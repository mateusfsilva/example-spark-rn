import "@azure/core-asynciterator-polyfill"
import { Buffer } from "buffer"
import "text-encoding"
global.Buffer = Buffer

import { Stack } from "expo-router"

export default function RootLayout() {
    return <Stack screenOptions={{ headerShown: false }} />
}
