/**
 * Test file for Lightning Invoice Parser
 * This file contains test cases to verify the parser functionality
 */

import {
    parseLightningInvoiceMemo,
    parseLightningInvoiceDetails,
    makeRelayHttpCall,
    processLightningPaymentRelay
} from './lightningInvoiceParser'

// Test invoice with JSON in description field (properly formatted)
const testInvoiceWithRelay = `lnbc5u1p50p7h0pp5gv2hyqqvcj2g2paymzzjf4f7hcl454adfkux8a84fmmcf3wrevvqsp5lsyvcn5rauzv02jj4cc08fv3aj478kjn447t3x0xyk3e9ak7sqtqxq9z0rgqnp4qvyndeaqzman7h898jxm98dzkm0mlrsx36s93smrur7h0azyyuxc5rzjq25carzepgd4vqsyn44jrk85ezrpju92xyrk9apw4cdjh6yrwt5jgqqqqrt49lmtcqqqqqqqqqqq86qq9qrzjqwghf7zxvfkxq5a6sr65g0gdkv768p83mhsnt0msszapamzx2qvuxqqqqrt49lmtcqqqqqqqqqqq86qq9qcqzpgdy90v38yetvv9ujyw3zdp68gurn8ghj7mtef9cyzerywfjhxue0d4u4qct5dq3zcgngw368qjr9v9jx2u3z8fajy6m90y3r5gnd09fk2cmjv46zytpzweskcat9yga8gun4v47h69qyyssqjvta257k24gxjx65kz4mk45hdds7q5ckr4nu2pk5g8zr3yjcwznn62f96qpcq0p9jx98z74p5nxegjqn4hvzw2hjr930l9tu82gu9jgqgry5dl`

// Test invoice with embedded JSON in description
const testInvoiceWithJson = `lnbc5u1p50p7h0pp5gv2hyqqvcj2g2paymzzjf4f7hcl454adfkux8a84fmmcf3wrevvqsp5lsyvcn5rauzv02jj4cc08fv3aj478kjn447t3x0xyk3e9ak7sqtqxq9z0rgqnp4qvyndeaqzman7h898jxm98dzkm0mlrsx36s93smrur7h0azyyuxc5rzjq25carzepgd4vqsyn44jrk85ezrpju92xyrk9apw4cdjh6yrwt5jgqqqqrt49lmtcqqqqqqqqqqq86qq9qrzjqwghf7zxvfkxq5a6sr65g0gdkv768p83mhsnt0msszapamzx2qvuxqqqqrt49lmtcqqqqqqqqqqq86qq9qcqzpgdy90v38yetvv9ujyw3zdp68gurn8ghj7mtef9cyzerywfjhxue0d4u4qct5dq3zcgngw368qjr9v9jx2u3z8fajy6m90y3r5gnd09fk2cmjv46zytpzweskcat9yga8gun4v47h69qyyssqjvta257k24gxjx65kz4mk45hdds7q5ckr4nu2pk5g8zr3yjcwznn62f96qpcq0p9jx98z74p5nxegjqn4hvzw2hjr930l9tu82gu9jgqgry5dl`

// Test invoice without relay configuration
const testInvoiceWithoutRelay = `lnbc1p50p7h0pp5gv2hyqqvcj2g2paymzzjf4f7hcl454adfkux8a84fmmcf3wrevvqsp5lsyvcn5rauzv02jj4cc08fv3aj478kjn447t3x0xyk3e9ak7sqtqxq9z0rgqnp4qvyndeaqzman7h898jxm98dzkm0mlrsx36s93smrur7h0azyyuxc5rzjq25carzepgd4vqsyn44jrk85ezrpju92xyrk9apw4cdjh6yrwt5jgqqqqrt49lmtcqqqqqqqqqqq86qq9qrzjqwghf7zxvfkxq5a6sr65g0gdkv768p83mhsnt0msszapamzx2qvuxqqqqrt49lmtcqqqqqqqqqqq86qq9qcqzpgdy90v38yetvv9ujyw3zdp68gurn8ghj7mtef9cyzerywfjhxue0d4u4qct5dq3zcgngw368qjr9v9jx2u3z8fajy6m90y3r5gnd09fk2cmjv46zytpzweskcat9yga8gun4v47h69qyyssqjvta257k24gxjx65kz4mk45hdds7q5ckr4nu2pk5g8zr3yjcwznn62f96qpcq0p9jx98z74p5nxegjqn4hvzw2hjr930l9tu82gu9jgqgry5dl`

// Real invoice from the logs for testing
const realInvoiceFromLogs = `lnbc500n1p50zcmepp5hpj2pn0zzxgrajs95am52kxaq4yzwjq7jmn7gxtxum2t3uhxlu6ssp5tfpfmqyfhtxqsptq73u8s7lnhvvuz5839c32f0tktyy960ck6lkqxq9z0rgqnp4qvyndeaqzman7h898jxm98dzkm0mlrsx36s93smrur7h0azyyuxc5rzjq25carzepgd4vqsyn44jrk85ezrpju92xyrk9apw4cdjh6yrwt5jgqqqqrt49lmtcqqqqqqqqqqq86qq9qrzjqwghf7zxvfkxq5a6sr65g0gdkv768p83mhsnt0msszapamzx2qvuxqqqqrt49lmtcqqqqqqqqqqq86qq9qcqzpgdy90v38yetvv9ujyw3zdp68gurn8ghj7mtef9cyzerywfjhxue0d4u4qct5dq3zcgngw368qjr9v9jx2u3z8fajy6m90y3r5gnd09fk2cmjv46zytpzweskcat9yga8gun4v47h69qyyssqlay2zf5htj7d9fry5nc8j4fzd48g4v7lqaa8vnrrw8wxg4mrs7hns0xuw0t6eeu4m3lr25tdvz5p04ft0f5aehdwvsyl45as279vvegqs94jh0`

export function runParserTests() {
    console.log('=== Testing Lightning Invoice Parser ===')

    // Test 1: Parse invoice details from real invoice
    console.log('\n1. Testing parseLightningInvoiceDetails with real invoice:')
    const details = parseLightningInvoiceDetails(realInvoiceFromLogs)
    console.log('Invoice details:', details)

    // Test 2: Invoice with JSON relay configuration
    console.log('\n2. Testing invoice with JSON relay configuration:')
    const result1 = parseLightningInvoiceMemo(testInvoiceWithJson)
    console.log('Result:', result1)

    // Test 3: Invoice without relay configuration
    console.log('\n3. Testing invoice without relay configuration:')
    const result2 = parseLightningInvoiceMemo(testInvoiceWithoutRelay)
    console.log('Result:', result2)

    // Test 4: Real invoice from logs
    console.log('\n4. Testing real invoice from logs:')
    const result3 = parseLightningInvoiceMemo(realInvoiceFromLogs)
    console.log('Result:', result3)

    // Test 5: Test HTTP call with mock configuration (successful payment)
    console.log('\n5. Testing HTTP call with mock configuration (successful payment):')
    const mockConfig = {
        relay: 'https://httpbin.org/post',
        httpHeader: {
            key: 'X-Test-Header',
            value: 'test-value'
        }
    }

    const successBody = { invoice: testInvoiceWithJson }
    makeRelayHttpCall(mockConfig, successBody)
        .then(success => {
            console.log('HTTP call result (success):', success)
        })
        .catch(error => {
            console.error('HTTP call error:', error)
        })

    // Test 6: Test HTTP call with failed payment
    console.log('\n6. Testing HTTP call with failed payment:')
    const failureBody = { invoice: false }
    makeRelayHttpCall(mockConfig, failureBody)
        .then(success => {
            console.log('HTTP call result (failure):', success)
        })
        .catch(error => {
            console.error('HTTP call error:', error)
        })

    // Test 7: Test complete payment processing (successful)
    console.log('\n7. Testing complete payment processing (successful):')
    processLightningPaymentRelay(testInvoiceWithJson, true)
        .then(success => {
            console.log('Payment processing result (success):', success)
        })
        .catch(error => {
            console.error('Payment processing error:', error)
        })

    // Test 8: Test complete payment processing (failed)
    console.log('\n8. Testing complete payment processing (failed):')
    processLightningPaymentRelay(testInvoiceWithJson, false)
        .then(success => {
            console.log('Payment processing result (failed):', success)
        })
        .catch(error => {
            console.error('Payment processing error:', error)
        })
}

// Export test invoices for manual testing
export {
    testInvoiceWithRelay,
    testInvoiceWithJson,
    testInvoiceWithoutRelay,
    realInvoiceFromLogs
}
