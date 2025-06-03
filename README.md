# Spark RN Example

This is a React Native example app using the Spark SDK to manage a Bitcoin wallet, show Spark and Bitcoin addresses, and claim Bitcoin deposits. The app is built with Expo and supports iOS simulators.

## Features

- Create a new Bitcoin wallet or open an existing one using a 12-word mnemonic.
- Display wallet balance.
- Show and copy your Spark address.
- Show and copy your Bitcoin deposit address (reuses unused addresses or generates a new one).
- Claim Bitcoin deposits by entering a transaction ID.
- Error handling and loading indicators for all wallet operations.
- Logout and reset wallet state.

## How to Run on iOS Simulator

1. **Clean the workspace and remove previous builds:**
    ```sh
    rm -rf node_modules ios android .expo
    ```

2. **Install dependencies:**
    ```sh
    npm install
    ```

3. **Prebuild native code for Expo (clean build):**
    ```sh
    npx expo prebuild --clean
    ```

4. **Run the app on the iOS simulator:**
    ```sh
    npx expo run:ios
    ```

## Notes

- Make sure you have Xcode and the iOS simulator installed on your machine.
- If you encounter issues with the simulator, try restarting Xcode and running the commands again.
- The app uses the Spark SDK and requires internet access for wallet operations.

## Project Structure

- `src/app/` - Main app screens and navigation.
- `src/components/` - Reusable UI components.
- `src/hooks/` - Custom React hooks for wallet logic.
- `src/spark.ts` - SparkSDK singleton wrapper and wallet logic.

---

Feel free to open issues or contribute!
