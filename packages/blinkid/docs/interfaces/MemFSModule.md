[**@microblink/blinkid**](../README.md)

***

[@microblink/blinkid](../README.md) / MemFSModule

# Interface: MemFSModule

## Properties

### FS?

> `optional` **FS**: `object`

#### mkdirTree()?

> `optional` **mkdirTree**(`path`): `void`

##### Parameters

###### path

`string`

##### Returns

`void`

#### readdir()?

> `optional` **readdir**(`path`): `string`[]

##### Parameters

###### path

`string`

##### Returns

`string`[]

#### readFile()?

> `optional` **readFile**(`path`): `Uint8Array`

##### Parameters

###### path

`string`

##### Returns

`Uint8Array`

#### stat()?

> `optional` **stat**(`path`): `object`

##### Parameters

###### path

`string`

##### Returns

`object`

###### size

> **size**: `number`

#### writeFile()?

> `optional` **writeFile**(`path`, `data`): `void`

##### Parameters

###### path

`string`

###### data

`Uint8Array`

##### Returns

`void`

***

### FS\_createDataFile()?

> `optional` **FS\_createDataFile**: (`parent`, `name`, `data`, `canRead`, `canWrite`, `canOwn?`) => `void`

#### Parameters

##### parent

`string`

##### name

`string`

##### data

`Uint8Array`

##### canRead

`boolean`

##### canWrite

`boolean`

##### canOwn?

`boolean`

#### Returns

`void`

***

### FS\_createPath()?

> `optional` **FS\_createPath**: (`parent`, `path`, `canRead`, `canWrite`) => `void`

#### Parameters

##### parent

`string`

##### path

`string`

##### canRead

`boolean`

##### canWrite

`boolean`

#### Returns

`void`

***

### FS\_unlink()?

> `optional` **FS\_unlink**: (`path`) => `void`

#### Parameters

##### path

`string`

#### Returns

`void`
