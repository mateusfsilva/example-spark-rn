import React from "react"
import { Button } from "react-native"

type Props = {
    onShow: () => void
    loading?: boolean
}

export function ShowBitcoinAddressButton({ onShow, loading }: Props) {
    return (
        <Button
            title="Show Bitcoin Address"
            onPress={onShow}
            disabled={loading}
        />
    )
}
