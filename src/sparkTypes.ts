
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



export interface LightningSendRequest {
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
    /** The lightning invoice user requested to pay. **/
    encodedInvoice: string
    /** The fee charged for paying the lightning invoice. **/
    fee: CurrencyAmount
    /** The idempotency key of the request. **/
    idempotencyKey: string
    /** The status of the request. **/
    status: LightningSendRequestStatus
    /** The typename of the object **/
    typename: string
    /** The leaves transfer after lightning payment was sent. **/
    transfer?: Transfer | undefined
    /** The preimage of the payment. **/
    paymentPreimage?: string | undefined
}

export declare enum LightningSendRequestStatus {
    /**
     * This is an enum value that represents values that could be added in the future.
     * Clients should support unknown values as more of them could be added without notice.
     */
    FUTURE_VALUE = "FUTURE_VALUE",
    CREATED = "CREATED",
    REQUEST_VALIDATED = "REQUEST_VALIDATED",
    LIGHTNING_PAYMENT_INITIATED = "LIGHTNING_PAYMENT_INITIATED",
    LIGHTNING_PAYMENT_FAILED = "LIGHTNING_PAYMENT_FAILED",
    LIGHTNING_PAYMENT_SUCCEEDED = "LIGHTNING_PAYMENT_SUCCEEDED",
    PREIMAGE_PROVIDED = "PREIMAGE_PROVIDED",
    TRANSFER_COMPLETED = "TRANSFER_COMPLETED",
}


export declare enum TransferStatus {
    TRANSFER_STATUS_SENDER_INITIATED = 0,
    TRANSFER_STATUS_SENDER_KEY_TWEAK_PENDING = 1,
    TRANSFER_STATUS_SENDER_KEY_TWEAKED = 2,
    TRANSFER_STATUS_RECEIVER_KEY_TWEAKED = 3,
    TRANSFER_STATUSR_RECEIVER_REFUND_SIGNED = 4,
    TRANSFER_STATUS_COMPLETED = 5,
    TRANSFER_STATUS_EXPIRED = 6,
    TRANSFER_STATUS_RETURNED = 7,
    TRANSFER_STATUS_SENDER_INITIATED_COORDINATOR = 8,
    TRANSFER_STATUS_RECEIVER_KEY_TWEAK_LOCKED = 9,
    TRANSFER_STATUS_RECEIVER_KEY_TWEAK_APPLIED = 10,
    TRANSFER_STATUS_RECEIVER_REFUND_SIGNED = 11, // Adding missing status from SDK
    UNRECOGNIZED = -1,
}

export interface WalletTransferLeaf {
    leaf: WalletLeaf | undefined
    secretCipher: string
    signature: string
    intermediateRefundTx: string
}

export declare enum TransferType {
    PREIMAGE_SWAP = 0,
    COOPERATIVE_EXIT = 1,
    TRANSFER = 2,
    UTXO_SWAP = 3,
    SWAP = 30,
    COUNTER_SWAP = 40,
    UNRECOGNIZED = -1,
}

export declare enum TransferDirection {
    INCOMING = "INCOMING",
    OUTGOING = "OUTGOING",
}

export interface WalletLeaf {
    id: string
    treeId: string
    value: number
    parentNodeId?: string | undefined
    nodeTx: string
    refundTx: string
    vout: number
    verifyingPublicKey: string
    ownerIdentityPublicKey: string
    signingKeyshare: SigningKeyshare | undefined
    status: string
    network: keyof typeof Network
}

export interface SigningKeyshare {
    /** The identifiers of the owners of the keyshare. */
    ownerIdentifiers: string[]
    /** The threshold of the keyshare. */
    threshold: number
}

export declare enum Network {
    UNSPECIFIED = 0,
    MAINNET = 1,
    REGTEST = 2,
    TESTNET = 3,
    SIGNET = 4,
    UNRECOGNIZED = -1,
}

import { TokenBalanceMap } from "@buildonspark/spark-sdk/native"

export type WalletBalance = {
    balance: bigint
    tokenBalances: TokenBalanceMap
}

export interface LightningSendFeeEstimateInput {
    encodedInvoice: string;
}

export interface WalletTransfer {
    id: string
    senderIdentityPublicKey: string
    receiverIdentityPublicKey: string
    status: keyof typeof TransferStatus
    totalValue: number
    expiryTime: Date | undefined
    leaves: WalletTransferLeaf[]
    createdTime: Date | undefined
    updatedTime: Date | undefined
    type: keyof typeof TransferType
    transferDirection: keyof typeof TransferDirection
}
