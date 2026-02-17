[**@microblink/blinkcard-core**](../README.md)

***

[@microblink/blinkcard-core](../README.md) / ExtractionSettings

# Type Alias: ExtractionSettings

> **ExtractionSettings** = `object`

Controls which fields and images should be extracted from the payment card.

Disabling extraction of unused fields can improve recognition performance or
reduce memory usage.

## Properties

### extractCardholderName

> **extractCardholderName**: `boolean`

Whether to extract the cardholder name.

***

### extractCvv

> **extractCvv**: `boolean`

Whether to extract the CVV (Card Verification Value) security code.

Usually found on the back of the card. Required for secure transactions.

***

### extractExpiryDate

> **extractExpiryDate**: `boolean`

Whether to extract the card expiry date.

***

### extractIban

> **extractIban**: `boolean`

Whether to extract the IBAN (International Bank Account Number).

***

### extractInvalidCardNumber

> **extractInvalidCardNumber**: `boolean`

Indicates whether card numbers that fail checksum validation should be
accepted.

Card numbers are validated using the Luhn algorithm. A value of `false`
(default) means only card numbers that pass the checksum validation will be
accepted. A value of `true` means card numbers that fail checksum
validation will still be accepted. - This may be useful for testing
purposes or when processing damaged/worn cards. - The `cardNumberValid`
field in the result will still indicate whether the checksum passed.
