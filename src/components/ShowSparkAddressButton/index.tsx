import React from "react"
import { Button } from "react-native"

type Props = {
    onShow: () => void
    loading?: boolean
}

export function ShowSparkAddressButton({ onShow, loading }: Props) {
    return (
        <Button
            title="Show Spark Address"
            onPress={onShow}
            disabled={loading}
        />
    )
}
