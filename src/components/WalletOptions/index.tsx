import React from "react"
import { View, Button } from "react-native"
import { styles } from "./styles"

type Props = {
    onCreate: () => void
    onOpen: () => void
}

export function WalletOptions({ onCreate, onOpen }: Props) {
    return (
        <View>
            <Button title="Create new wallet" onPress={onCreate} />
            <View style={styles.spacer} />
            <Button title="Open an existent wallet" onPress={onOpen} />
        </View>
    )
}
