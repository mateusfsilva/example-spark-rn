import { createLogger } from "@/logger"
import { SparkWallet } from "@buildonspark/spark-sdk/native"
import {
    SparkWalletEvents,
    SparkWalletNormalizedEvents,
} from "@/models/sparkWalletEvents"

const logger = createLogger("SparkEvents")

// Helpers to safely serialize event payloads (BigInt, Uint8Array, Map, Set, Date, Error, circular refs)
function isTypedArray(v: any): v is
    | Uint8Array
    | Int8Array
    | Uint16Array
    | Int16Array
    | Uint32Array
    | Int32Array
    | Float32Array
    | Float64Array
    | BigInt64Array
    | BigUint64Array {
    return (
        typeof v === "object" &&
        v != null &&
        typeof (v as any).BYTES_PER_ELEMENT === "number"
    )
}

function toHex(u8: Uint8Array): string {
    try {
        return `0x${Buffer.from(u8).toString("hex")}`
    } catch {
        const hex = Array.from(u8)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")

        return `0x${hex}`
    }
}

function safeSerializeValue(value: any, seen = new WeakSet()): any {
    const t = typeof value

    if (value == null || t === "string" || t === "number" || t === "boolean") {
        return value
    }

    if (t === "bigint") {
        return value.toString()
    }

    if (value instanceof Date) {
        return value.toISOString()
    }

    if (value instanceof Error) {
        return {
            name: value.name,
            message: value.message,
            stack: value.stack,
        }
    }

    if (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) {
        return `hex:${(value as Buffer).toString("hex")}`
    }

    if (isTypedArray(value)) {
        return toHex(new Uint8Array(value.buffer, value.byteOffset, value.byteLength))
    }

    if (value instanceof ArrayBuffer) {
        return toHex(new Uint8Array(value))
    }

    if (value instanceof Set) {
        return Array.from(value).map((v) => safeSerializeValue(v, seen))
    }

    if (value instanceof Map) {
        return Object.fromEntries(
            Array.from(value.entries()).map(([k, v]) => [
                typeof k === "object" ? JSON.stringify(safeSerializeValue(k, seen)) : String(k),
                safeSerializeValue(v, seen),
            ])
        )
    }

    if (typeof value.toJSON === "function") {
        try {
            return value.toJSON()
        } catch {
            // ignore
        }
    }

    if (Array.isArray(value)) {
        return value.map((v) => safeSerializeValue(v, seen))
    }

    if (t === "object") {
        if (seen.has(value)) {
            return "[Circular]"
        }

        seen.add(value)

        const out: Record<string, any> = {}

        for (const key of Object.keys(value)) {
            out[key] = safeSerializeValue((value as any)[key], seen)
        }

        return out
    }

    try {
        return String(value)
    } catch {
        return "[Unserializable]"
    }
}

function toStringCoerce(v: any): string {
    if (typeof v === "string") {
        return v
    }

    if (typeof v === "bigint") {
        return v.toString()
    }

    if (typeof Buffer !== "undefined" && Buffer.isBuffer(v)) {
        return `hex:${(v as Buffer).toString("hex")}`
    }

    if (isTypedArray(v)) {
        return toHex(new Uint8Array(v.buffer, v.byteOffset, v.byteLength))
    }

    if (v instanceof ArrayBuffer) {
        return toHex(new Uint8Array(v))
    }

    if (v && typeof v.toString === "function" && v.toString !== Object.prototype.toString) {
        try {
            return v.toString()
        } catch {
            // ignore
        }
    }

    try {
        return JSON.stringify(safeSerializeValue(v))
    } catch {
        return "[Unserializable]"
    }
}

function toSatsString(v: any): string {
    if (typeof v === "number") {
        return String(v)
    }

    if (typeof v === "bigint") {
        return v.toString()
    }

    return toStringCoerce(v)
}

export class SparkEventManager {
    private wallet: SparkWallet | undefined

    private defaultEventHandlers:
        | { [K in keyof SparkWalletEvents]: SparkWalletEvents[K] }
        | null = null

    private normalizedListenerMap: Map<
        keyof SparkWalletNormalizedEvents,
        Map<Function, Function>
    > = new Map()

    bindWallet(wallet: SparkWallet): void {
        this.wallet = wallet

        this.attachDefaultEventHandlers()

        this.enableEventDebugging()
    }

    unbindWallet(): void {
        this.detachDefaultEventHandlers()

        this.disableEventDebugging()

        this.wallet = undefined
    }

    on<E extends keyof SparkWalletEvents>(
        event: E,
        listener: SparkWalletEvents[E]
    ): void {
        if (!this.wallet) {
            throw new Error("Wallet is not initialized")
        }

        ;(this.wallet as any).on?.(event, listener)
    }

    off<E extends keyof SparkWalletEvents>(
        event: E,
        listener: SparkWalletEvents[E]
    ): void {
        if (!this.wallet) {
            return
        }

        ;(this.wallet as any).off?.(event, listener)
    }

    once<E extends keyof SparkWalletEvents>(
        event: E,
        listener: SparkWalletEvents[E]
    ): void {
        if (!this.wallet) {
            throw new Error("Wallet is not initialized")
        }

        ;(this.wallet as any).once?.(event, listener)
    }

    onAny(eventName: string, listener: (...args: any[]) => void): void {
        if (!this.wallet) {
            throw new Error("Wallet is not initialized")
        }

        ;(this.wallet as any).on?.(eventName, listener)
    }

    onNormalized<E extends keyof SparkWalletNormalizedEvents>(
        event: E,
        listener: SparkWalletNormalizedEvents[E]
    ): void {
        if (!this.wallet) {
            throw new Error("Wallet is not initialized")
        }

        const w = this.wallet as any

        const adapter = (...args: any[]) => {
            switch (event) {
                case "transfer:claimed": {
                    const [id, bal] = args

                    ;(listener as any)(toStringCoerce(id), toSatsString(bal))

                    break
                }
                case "deposit:confirmed": {
                    const [id, bal] = args

                    ;(listener as any)(toStringCoerce(id), toSatsString(bal))

                    break
                }
                case "stream:connected": {
                    ;(listener as any)()

                    break
                }
                case "stream:disconnected": {
                    const [reason] = args

                    ;(listener as any)(toStringCoerce(reason))

                    break
                }
                case "stream:reconnecting": {
                    const [attempt, maxAttempts, delayMs, error] = args

                    ;(listener as any)(
                        attempt,
                        maxAttempts,
                        delayMs,
                        toStringCoerce(error)
                    )

                    break
                }
                default: {
                    ;(listener as any)(...args.map((a) => toStringCoerce(a)))
                }
            }
        }

        const map =
            this.normalizedListenerMap.get(event) ??
            new Map<Function, Function>()

        map.set(listener as unknown as Function, adapter)

        this.normalizedListenerMap.set(event, map)

        w.on?.(event, adapter)
    }

    offNormalized<E extends keyof SparkWalletNormalizedEvents>(
        event: E,
        listener: SparkWalletNormalizedEvents[E]
    ): void {
        if (!this.wallet) {
            return
        }

        const w = this.wallet as any

        const map = this.normalizedListenerMap.get(event)

        const adapter = map?.get(listener as unknown as Function)

        if (adapter) {
            w.off?.(event, adapter)

            map!.delete(listener as unknown as Function)
        }
    }

    enableEventDebugging(): void {
        if (!this.wallet) {
            throw new Error("Wallet is not initialized")
        }

        const w = this.wallet as any

        if (w.__emitPatched) {
            logger.info("SDK event debugging already enabled")

            return
        }

        const originalEmit =
            typeof w.emit === "function" ? w.emit.bind(w) : undefined

        if (!originalEmit) {
            logger.warn("Wallet does not expose an emit function to patch")

            return
        }

        w.__emitPatched = true
        w.__originalEmit = originalEmit
        w.emit = (event: string, ...args: any[]) => {
            try {
                const safeArgs = args.map((a) => safeSerializeValue(a))

                logger.debug(`[SDK Event] ${event}`, { args: safeArgs })
            } catch {
                // no-op
            }

            return originalEmit(event, ...args)
        }

        logger.info("SDK event debugging enabled")
    }

    disableEventDebugging(): void {
        if (!this.wallet) {
            return
        }

        const w = this.wallet as any

        if (w.__emitPatched && typeof w.__originalEmit === "function") {
            w.emit = w.__originalEmit

            delete w.__originalEmit
            delete w.__emitPatched

            logger.info("SDK event debugging disabled")
        }
    }

    getRegisteredEventNames(): Array<string | symbol> {
        if (!this.wallet) {
            throw new Error("Wallet is not initialized")
        }

        const w = this.wallet as any

        if (typeof w.eventNames === "function") {
            return w.eventNames()
        }

        return []
    }

    private attachDefaultEventHandlers(): void {
        if (!this.wallet) {
            return
        }

        if (this.defaultEventHandlers) {
            this.detachDefaultEventHandlers()
        }

        const handlers: {
            [K in keyof SparkWalletEvents]: SparkWalletEvents[K]
        } = {
            "transfer:claimed": (transferId, updatedBalance) => {
                logger.info("Event transfer:claimed", {
                    transferId: toStringCoerce(transferId as any),
                    updatedBalanceSats: toSatsString(updatedBalance as any),
                })
            },
            "deposit:confirmed": (depositId, updatedBalance) => {
                logger.info("Event deposit:confirmed", {
                    depositId: toStringCoerce(depositId as any),
                    updatedBalanceSats: toSatsString(updatedBalance as any),
                })
            },
            "stream:connected": () => {
                logger.info("Event stream:connected")
            },
            "stream:disconnected": (reason) => {
                logger.warn("Event stream:disconnected", {
                    reason: toStringCoerce(reason as any),
                })
            },
            "stream:reconnecting": (attempt, maxAttempts, delayMs, error) => {
                logger.debug("Event stream:reconnecting", {
                    attempt,
                    maxAttempts,
                    delayMs,
                    error: toStringCoerce(error as any),
                })
            },
        }

        const w = this.wallet as any

        Object.entries(handlers).forEach(([event, fn]) => {
            w.on?.(event, fn)
        })

        this.defaultEventHandlers = handlers

        logger.info("Default Spark event handlers attached")
    }

    private detachDefaultEventHandlers(): void {
        if (!this.wallet || !this.defaultEventHandlers) {
            return
        }

        const w = this.wallet as any

        Object.entries(this.defaultEventHandlers).forEach(([event, fn]) => {
            w.off?.(event, fn)
        })

        this.defaultEventHandlers = null

        logger.info("Default Spark event handlers detached")
    }
}
