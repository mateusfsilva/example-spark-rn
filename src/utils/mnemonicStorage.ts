/**
 * Secure Storage Utilities for Mnemonic Management
 *
 * This module handles secure storage and retrieval of wallet mnemonic phrases
 * using Expo SecureStore for persistent storage across app sessions.
 */

import * as SecureStore from 'expo-secure-store'

const MNEMONIC_STORAGE_KEY = 'wallet_mnemonic'

/**
 * Saves the wallet mnemonic securely to device storage.
 *
 * @param mnemonic - The 12-word mnemonic phrase to save
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function saveMnemonic(mnemonic: string): Promise<boolean> {
    try {
        await SecureStore.setItemAsync(MNEMONIC_STORAGE_KEY, mnemonic)
        console.log('Mnemonic saved securely to device storage')
        return true
    } catch (error) {
        console.error('Failed to save mnemonic:', error)
        return false
    }
}

/**
 * Retrieves the saved wallet mnemonic from secure storage.
 *
 * @returns Promise<string | null> - The saved mnemonic or null if not found/error
 */
export async function getSavedMnemonic(): Promise<string | null> {
    try {
        const mnemonic = await SecureStore.getItemAsync(MNEMONIC_STORAGE_KEY)
        if (mnemonic) {
            console.log('Mnemonic retrieved from secure storage')
            return mnemonic
        }
        console.log('No saved mnemonic found')
        return null
    } catch (error) {
        console.error('Failed to retrieve mnemonic:', error)
        return null
    }
}

/**
 * Removes the saved wallet mnemonic from secure storage.
 * This should be called when the user logs out.
 *
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function clearSavedMnemonic(): Promise<boolean> {
    try {
        await SecureStore.deleteItemAsync(MNEMONIC_STORAGE_KEY)
        console.log('Saved mnemonic cleared from device storage')
        return true
    } catch (error) {
        console.error('Failed to clear saved mnemonic:', error)
        return false
    }
}

/**
 * Checks if there is a saved mnemonic in secure storage.
 *
 * @returns Promise<boolean> - true if mnemonic exists, false otherwise
 */
export async function hasSavedMnemonic(): Promise<boolean> {
    try {
        const mnemonic = await SecureStore.getItemAsync(MNEMONIC_STORAGE_KEY)
        return mnemonic !== null
    } catch (error) {
        console.error('Failed to check for saved mnemonic:', error)
        return false
    }
}
