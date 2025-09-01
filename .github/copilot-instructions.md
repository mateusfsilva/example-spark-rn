# example-spark-rn — Guide for GitHub Copilot

Global rule
- ALL source code and comments in this app MUST be written in English.

Summary
- Expo/React Native app showcasing the Spark SDK to manage a Bitcoin wallet and Lightning features.
- UI is built from small, reusable components. Styles are colocated per component.
- Business logic is centralized in a single hook, and SDK access is encapsulated in a singleton wrapper.

Key files
- App screen: [src/app/index.tsx](src/app/index.tsx)
- App layout and polyfills: [src/app/_layout.tsx](src/app/_layout.tsx)
- App styles: [src/app/styles.ts](src/app/styles.ts)
- Business logic hook: [`useWallet`](src/hooks/useWallet.ts)
- SDK wrapper singleton: [`SparkSDK`](src/spark.ts)
  - Methods used across the app:
    - [`SparkSDK.getBalance`](src/spark.ts)
    - [`SparkSDK.getSparkAddress`](src/spark.ts)
    - [`SparkSDK.getSingleUseDepositAddress`](src/spark.ts)
    - [`SparkSDK.getUnusedDepositAddresses`](src/spark.ts)
    - [`SparkSDK.createLightningInvoice`](src/spark.ts)
    - [`SparkSDK.payLightningInvoice`](src/spark.ts)
    - [`SparkSDK.transfer`](src/spark.ts)
- Logger utilities: [`createLogger`](src/logger.ts), [`setDebugEnabled`](src/logger.ts), [`isDebugMode`](src/logger.ts)
- Spark-related types: [src/sparkTypes.ts](src/sparkTypes.ts)
- Address validation util: [`isValidSparkAddress`](src/utils/sparkAddressValidation.ts)
- Config: [package.json](package.json), [app.json](app.json), [babel.config.js](babel.config.js), [metro.config.js](metro.config.js), [README.md](README.md)

Architecture and patterns
- Separation of concerns:
  - UI and interactions live in components under [src/components](src/components).
  - Business logic and side effects live in [`useWallet`](src/hooks/useWallet.ts).
  - The Spark SDK is accessed only via the singleton [`SparkSDK`](src/spark.ts).
- Component pattern:
  - Each component/screen is split into index.tsx (JSX and behavior) + styles.ts (StyleSheet).
  - Examples:
    - Balance: [index.tsx](src/components/Balance/index.tsx) + [styles.ts](src/components/Balance/styles.ts)
    - WalletOptions: [index.tsx](src/components/WalletOptions/index.tsx) + [styles.ts](src/components/WalletOptions/styles.ts)
    - OpenWalletForm: [index.tsx](src/components/OpenWalletForm/index.tsx) + [styles.ts](src/components/OpenWalletForm/styles.ts)
    - ShowSparkAddressButton: [index.tsx](src/components/ShowSparkAddressButton/index.tsx) + [styles.ts](src/components/ShowSparkAddressButton/styles.ts)
    - SparkAddressLabel: [index.tsx](src/components/SparkAddressLabel/index.tsx) + [styles.ts](src/components/SparkAddressLabel/styles.ts)
    - ShowBitcoinAddressButton: [index.tsx](src/components/ShowBitcoinAddressButton/index.tsx) + [styles.ts](src/components/ShowBitcoinAddressButton/styles.ts)
    - BitcoinAddressLabel: [index.tsx](src/components/BitcoinAddressLabel/index.tsx) + [styles.ts](src/components/BitcoinAddressLabel/styles.ts)
    - ClaimDepositForm: [index.tsx](src/components/ClaimDepositForm/index.tsx) + [styles.ts](src/components/ClaimDepositForm/styles.ts)
    - CreateLightningInvoiceForm: [index.tsx](src/components/CreateLightningInvoiceForm/index.tsx) + [styles.ts](src/components/CreateLightningInvoiceForm/styles.ts)
    - LightningInvoiceLabel: [index.tsx](src/components/LightningInvoiceLabel/index.tsx) + [styles.ts](src/components/LightningInvoiceLabel/styles.ts)
    - TransferForm: [index.tsx](src/components/TransferForm/index.tsx) + [styles.ts](src/components/TransferForm/styles.ts)
    - PayLightningInvoiceForm: [index.tsx](src/components/PayLightningInvoiceForm/index.tsx) + [styles.ts](src/components/PayLightningInvoiceForm/styles.ts)
    - WalletMnemonicLabel: [index.tsx](src/components/WalletMnemonicLabel/index.tsx) + [styles.ts](src/components/WalletMnemonicLabel/styles.ts)
- State and flow:
  - [src/app/index.tsx](src/app/index.tsx) composes the UI and orchestrates visibility (forms, labels).
  - [`useWallet`](src/hooks/useWallet.ts) exposes state (balance, addresses, invoices, loading/error flags) and operations (create/open wallet, fetch balance, claim, transfer, invoice create/pay).
- Logging:
  - Use [`createLogger`](src/logger.ts) per module. Logs include timestamps, emojis, and levels. Toggle via [`setDebugEnabled`](src/logger.ts).
- Polyfills:
  - [src/app/_layout.tsx](src/app/_layout.tsx) sets `global.Buffer` and imports text encoding.
  - [metro.config.js](metro.config.js) maps Node core modules to empty polyfills.

Features
- Wallet
  - Create a new wallet or open with a 12-word mnemonic (UI in [src/app/index.tsx](src/app/index.tsx), forms in [OpenWalletForm](src/components/OpenWalletForm/index.tsx)).
  - View and copy the wallet mnemonic ([WalletMnemonicLabel](src/components/WalletMnemonicLabel/index.tsx)).
  - Logout/reset state (via [`useWallet`](src/hooks/useWallet.ts)).
- Balance
  - Show current balance and refresh ([Balance](src/components/Balance/index.tsx), [`SparkSDK.getBalance`](src/spark.ts)).
- Addresses
  - Show and copy Spark address ([ShowSparkAddressButton](src/components/ShowSparkAddressButton/index.tsx), [SparkAddressLabel](src/components/SparkAddressLabel/index.tsx), [`SparkSDK.getSparkAddress`](src/spark.ts)).
  - Show and copy Bitcoin single-use deposit address ([ShowBitcoinAddressButton](src/components/ShowBitcoinAddressButton/index.tsx), [BitcoinAddressLabel](src/components/BitcoinAddressLabel/index.tsx), [`SparkSDK.getSingleUseDepositAddress`](src/spark.ts), and reuse via [`SparkSDK.getUnusedDepositAddresses`](src/spark.ts)).
- On-chain claim
  - Claim a Bitcoin deposit by TXID ([ClaimDepositForm](src/components/ClaimDepositForm/index.tsx)).
- Lightning
  - Create invoice to receive payments ([CreateLightningInvoiceForm](src/components/CreateLightningInvoiceForm/index.tsx), [`SparkSDK.createLightningInvoice`](src/spark.ts), display via [LightningInvoiceLabel](src/components/LightningInvoiceLabel/index.tsx)).
  - Estimate fee and pay invoice ([PayLightningInvoiceForm](src/components/PayLightningInvoiceForm/index.tsx), [`SparkSDK.payLightningInvoice`](src/spark.ts)).
- Transfers
  - Send to another Spark address ([TransferForm](src/components/TransferForm/index.tsx)) with validation via [`isValidSparkAddress`](src/utils/sparkAddressValidation.ts) and [`SparkSDK.transfer`](src/spark.ts).

Guidelines for implementing features
- Mandatory language
  - Write all code and comments in English only (MUST).
- Where to put logic
  - Keep UI components presentational; put side effects and business rules in [`useWallet`](src/hooks/useWallet.ts).
  - Use the singleton [`SparkSDK`](src/spark.ts) for all SDK interactions.
- Component structure
  - Create a folder with index.tsx (component) and styles.ts (StyleSheet).
  - Keep props small and explicit; surface loading/error states near actions.
- Types and utilities
  - Reuse types from [src/sparkTypes.ts](src/sparkTypes.ts).
  - Reuse validators like [`isValidSparkAddress`](src/utils/sparkAddressValidation.ts).
- Logging and errors
  - Log at the start/end of async flows with [`createLogger`](src/logger.ts).
  - Return user-friendly error strings to the UI; keep forms open on failure.

Development notes
- Environment: Expo SDK 53, RN 0.79, React 19. Entry is [package.json](package.json) "expo-router/entry".
- iOS: see [README.md](README.md) for clean prebuild steps and `npx expo run:ios`.
- Babel: use [babel.config.js](babel.config.js) with Expo preset; include needed transforms for SDK features if required.
- Metro: see [metro.config.js](metro.config.js) for Node polyfills

## Code style rules (strict)

- Preserve intentional blank lines. Do not remove empty lines between code statements.
- Do not use single-line/compact control statements. Always use braces, even for single statements.
  - Not allowed: `if (seen.has(value)) return "[Circular]"`
  - Required: `if (seen.has(value)) { return "[Circular]" }`
- Surround control statements with a blank line when they are not the first or only statement within their block/scope. This applies to: `if`, `else`, `case`, `while`, `switch`, `return`, `try`, `catch`, `finally`.
  - Place one blank line before (and typically after) these statements unless the statement is the first (or only) line in the block.
- Log calls must also be separated by blank lines (one blank line before and after), e.g., calls to `logger.debug`, `logger.info`, `logger.warn`, `logger.error`.

Example (TypeScript):

```typescript
function example(items: any[], logger: Logger): void {
    const count = items.length

    if (count === 0) {
        return
    }

    logger.info("Processing items...", { count })

    for (const item of items) {
        if (item == null) {
            continue
        }

        try {
            processItem(item)
        } catch (err) {
            logger.error("Failed to process item", err)
        }
    }

    return
}
```
