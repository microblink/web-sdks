[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / getUserId

# Function: getUserId()

> **getUserId**(`storageKey`): `string`

Gets the user id from local storage, or generates a new one.

This is a workaround for the lack of a user id in the worker scope.

## Parameters

### storageKey

`string`

The localStorage key to use for persisting the user id.

## Returns

`string`

a unique user id
