[**@microblink/blinkcard-core**](../README.md)

***

[@microblink/blinkcard-core](../README.md) / PingBase

# Interface: PingBase\<TSchemaName, TSchemaVersion, TData, TSessionNumber\>

Generated base structure for a ping event.

## Type Parameters

### TSchemaName

`TSchemaName` *extends* [`SchemaName`](../type-aliases/SchemaName.md)

### TSchemaVersion

`TSchemaVersion` *extends* `Semver` = `"1.0.0"`

### TData

`TData` *extends* `object` = \{ \}

### TSessionNumber

`TSessionNumber` *extends* `number` = `number`

## Properties

### data

> **data**: `TData`

***

### schemaName

> **schemaName**: `TSchemaName`

***

### schemaVersion

> **schemaVersion**: `TSchemaVersion`

***

### sessionNumber?

> `optional` **sessionNumber**: `TSessionNumber`
