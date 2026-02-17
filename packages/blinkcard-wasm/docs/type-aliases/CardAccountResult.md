[**@microblink/blinkcard-wasm**](../README.md)

***

[@microblink/blinkcard-wasm](../README.md) / CardAccountResult

# Type Alias: CardAccountResult

> **CardAccountResult** = `object`

Represents the account information of a single account on a card.

## Properties

### cardCategory

> **cardCategory**: `string` \| `undefined`

***

### cardNumber

> **cardNumber**: `string`

The card number as scanned from the card.

***

### cardNumberPrefix

> **cardNumberPrefix**: `string` \| `undefined`

The payment card's number prefix.

***

### cardNumberValid

> **cardNumberValid**: `boolean`

Indicates whether the scanned card number is valid according to the Luhn
algorithm.

***

### cvv

> **cvv**: `string` \| `undefined`

The payment card's security code/value.

***

### expiryDate

> **expiryDate**: [`DateResult`](DateResult.md)

The payment card's expiry date.

***

### fundingType

> **fundingType**: `string` \| `undefined`

The card funding type (e.g., "DEBIT", "CREDIT", "CHARGE CARD").

***

### issuerCountry

> **issuerCountry**: `string` \| `undefined`

The name of the card issuer's country.

***

### issuerCountryCode

> **issuerCountryCode**: `string` \| `undefined`

The ISO 3166-1 alpha-3 country code of the card issuer's country (e.g., "USA", "GBR", "HRV").

***

### issuerName

> **issuerName**: `string` \| `undefined`

The name of the financial institution that issued the payment card.
