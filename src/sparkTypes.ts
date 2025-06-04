export type CreateLightningInvoiceParams = {
    amountSats: number
    memo?: string
    expirySeconds?: number
}

export declare enum LightningReceiveRequestStatus {
    /**
     * This is an enum value that represents values that could be added in the future.
     * Clients should support unknown values as more of them could be added without notice.
     */
    FUTURE_VALUE = "FUTURE_VALUE",
    INVOICE_CREATED = "INVOICE_CREATED",
    TRANSFER_CREATED = "TRANSFER_CREATED",
    TRANSFER_CREATION_FAILED = "TRANSFER_CREATION_FAILED",
    REFUND_SIGNING_COMMITMENTS_QUERYING_FAILED = "REFUND_SIGNING_COMMITMENTS_QUERYING_FAILED",
    REFUND_SIGNING_FAILED = "REFUND_SIGNING_FAILED",
    PAYMENT_PREIMAGE_RECOVERED = "PAYMENT_PREIMAGE_RECOVERED",
    PAYMENT_PREIMAGE_RECOVERING_FAILED = "PAYMENT_PREIMAGE_RECOVERING_FAILED",
    LIGHTNING_PAYMENT_RECEIVED = "LIGHTNING_PAYMENT_RECEIVED",
    TRANSFER_FAILED = "TRANSFER_FAILED",
    TRANSFER_COMPLETED = "TRANSFER_COMPLETED",
}

export declare enum BitcoinNetwork {
    /**
     * This is an enum value that represents values that could be added in the future.
     * Clients should support unknown values as more of them could be added without notice.
     */
    FUTURE_VALUE = "FUTURE_VALUE",
    /** The production version of the Bitcoin Blockchain. **/
    MAINNET = "MAINNET",
    /** A test version of the Bitcoin Blockchain, maintained by Lightspark. **/
    REGTEST = "REGTEST",
    /** A test version of the Bitcoin Blockchain, maintained by a centralized organization. Not in use at Lightspark. **/
    SIGNET = "SIGNET",
    /** A test version of the Bitcoin Blockchain, publicly available. **/
    TESTNET = "TESTNET",
}

export declare enum CurrencyUnit {
    /**
     * This is an enum value that represents values that could be added in the future.
     * Clients should support unknown values as more of them could be added without notice.
     */
    FUTURE_VALUE = "FUTURE_VALUE",
    /** Bitcoin is the cryptocurrency native to the Bitcoin network. It is used as the native medium for value transfer for the Lightning Network. **/
    BITCOIN = "BITCOIN",
    /** 0.00000001 (10e-8) Bitcoin or one hundred millionth of a Bitcoin. This is the unit most commonly used in Lightning transactions. **/
    SATOSHI = "SATOSHI",
    /** 0.001 Satoshi, or 10e-11 Bitcoin. We recommend using the Satoshi unit instead when possible. **/
    MILLISATOSHI = "MILLISATOSHI",
    /** United States Dollar. **/
    USD = "USD",
    /** Mexican Peso. **/
    MXN = "MXN",
    /** Philippine Peso. **/
    PHP = "PHP",
    /** Euro. **/
    EUR = "EUR",
    /** 0.000000001 (10e-9) Bitcoin or a billionth of a Bitcoin. We recommend using the Satoshi unit instead when possible. **/
    NANOBITCOIN = "NANOBITCOIN",
    /** 0.000001 (10e-6) Bitcoin or a millionth of a Bitcoin. We recommend using the Satoshi unit instead when possible. **/
    MICROBITCOIN = "MICROBITCOIN",
    /** 0.001 (10e-3) Bitcoin or a thousandth of a Bitcoin. We recommend using the Satoshi unit instead when possible. **/
    MILLIBITCOIN = "MILLIBITCOIN",
}

export interface CurrencyAmount {
    /** The original numeric value for this CurrencyAmount. **/
    originalValue: number
    /** The original unit of currency for this CurrencyAmount. **/
    originalUnit: CurrencyUnit
    /** The unit of user's preferred currency. **/
    preferredCurrencyUnit: CurrencyUnit
    /**
     * The rounded numeric value for this CurrencyAmount in the very base level of user's preferred
     * currency. For example, for USD, the value will be in cents.
     **/
    preferredCurrencyValueRounded: number
    /**
     * The approximate float value for this CurrencyAmount in the very base level of user's preferred
     * currency. For example, for USD, the value will be in cents.
     **/
    preferredCurrencyValueApprox: number
}

export interface Invoice {
    encodedInvoice: string
    bitcoinNetwork: BitcoinNetwork
    paymentHash: string
    amount: CurrencyAmount
    createdAt: string
    expiresAt: string
    memo?: string | undefined
}

export declare class Transfer {
    /** The total amount of the transfer. **/
    readonly totalAmount: CurrencyAmount
    /** The id of the transfer known at signing operators. If not set, the transfer hasn't been
     * initialized. **/
    readonly sparkId?: string | undefined
    constructor(
        /** The total amount of the transfer. **/
        totalAmount: CurrencyAmount,
        /** The id of the transfer known at signing operators. If not set, the transfer hasn't been
         * initialized. **/
        sparkId?: string | undefined
    )
}

export interface LightningReceiveRequest {
    /**
     * The unique identifier of this entity across all Lightspark systems. Should be treated as an opaque
     * string.
     **/
    id: string
    /** The date and time when the entity was first created. **/
    createdAt: string
    /** The date and time when the entity was last updated. **/
    updatedAt: string
    /** The network the lightning send request is on. **/
    network: BitcoinNetwork
    /** The lightning invoice generated to receive lightning payment. **/
    invoice: Invoice
    /** The status of the request. **/
    status: LightningReceiveRequestStatus
    /** The typename of the object **/
    typename: string
    /** The leaves transfer after lightning payment was received. **/
    transfer?: Transfer | undefined
    /** The payment preimage of the invoice if retrieved from SE. **/
    paymentPreimage?: string | undefined
}

export type TransferParams = {
    amountSats: number
    receiverSparkAddress: string
}
