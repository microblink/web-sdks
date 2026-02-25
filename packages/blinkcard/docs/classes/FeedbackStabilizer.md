[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / FeedbackStabilizer

# Class: FeedbackStabilizer\<SdkSpecificStateMap\>

FeedbackStabilizer provides UI state management with temporal smoothing.

It helps prevent UI "flickering" by:
- Maintaining a time-windowed history of UI state changes
- Applying weighted averaging to determine the most appropriate state
- Supporting immediate state changes through single-emit events
- Enforcing minimum display durations for states

## Type Parameters

### SdkSpecificStateMap

`SdkSpecificStateMap` *extends* [`UiStateMap`](../type-aliases/UiStateMap.md)

Type extending UiStateMap for SDK-specific states

## Constructors

### Constructor

> **new FeedbackStabilizer**\<`SdkSpecificStateMap`\>(`uiStateMap`, `initialKey`, `timeWindow?`, `decayRate?`): `FeedbackStabilizer`\<`SdkSpecificStateMap`\>

Creates a new FeedbackStabilizer instance.

#### Parameters

##### uiStateMap

`SdkSpecificStateMap`

Map of all possible UI states and their configurations

##### initialKey

`StateKey`\<`SdkSpecificStateMap`\>

Key of the initial UI state to display

##### timeWindow?

`number`

Optional custom time window (in ms) for state averaging

##### decayRate?

`number`

Optional custom decay rate for event weights

#### Returns

`FeedbackStabilizer`\<`SdkSpecificStateMap`\>

## Properties

### canShowNewUiState()

> **canShowNewUiState**: () => `boolean`

Checks if enough time has passed to show a new UI state

#### Returns

`boolean`

true if the current state's minimum duration has elapsed

## Accessors

### currentState

#### Get Signature

> **get** **currentState**(): `SdkSpecificStateMap`\[`StateKey`\<`SdkSpecificStateMap`\>\]

Gets the currently active UI state configuration.

##### Returns

`SdkSpecificStateMap`\[`StateKey`\<`SdkSpecificStateMap`\>\]

The currently active UI state configuration.

## Methods

### getEventQueue()

> **getEventQueue**(): [`UiStateEvent`](../type-aliases/UiStateEvent.md)\<`StateKey`\<`SdkSpecificStateMap`\>\>[]

Gets a copy of the current event queue for debugging.

#### Returns

[`UiStateEvent`](../type-aliases/UiStateEvent.md)\<`StateKey`\<`SdkSpecificStateMap`\>\>[]

A copy of the current event queue.

***

### getNewUiState()

> **getNewUiState**(`incomingUiStateKey`): `SdkSpecificStateMap`\[`StateKey`\<`SdkSpecificStateMap`\>\]

Processes a new UI state event and determines the state to display.

This method:
1. Handles single-emit events that bypass normal stabilization
2. Maintains a time-windowed queue of regular events
3. Applies temporal averaging with decay to determine the winning state

#### Parameters

##### incomingUiStateKey

`StateKey`\<`SdkSpecificStateMap`\>

Key of the new UI state event

#### Returns

`SdkSpecificStateMap`\[`StateKey`\<`SdkSpecificStateMap`\>\]

The UI state that should be displayed.

***

### getRemainingDuration()

> **getRemainingDuration**(): `number`

Retrieves the remaining time for the current state to satisfy its minimum duration.

#### Returns

`number`

Remaining time in milliseconds.

***

### getScoreBoard()

> **getScoreBoard**(): `Record`\<`string`, `number`[]\>

Gets the score history for each state.

#### Returns

`Record`\<`string`, `number`[]\>

The score history for each state.

***

### getScores()

> **getScores**(): `Record`\<`string`, `number`\>

Gets the current summed scores for each state.

#### Returns

`Record`\<`string`, `number`\>

The current summed scores for each state.

***

### getSingleEventQueue()

> **getSingleEventQueue**(): [`UiStateEvent`](../type-aliases/UiStateEvent.md)\<`StateKey`\<`SdkSpecificStateMap`\>\>[]

Gets a copy of the single event queue for debugging.

#### Returns

[`UiStateEvent`](../type-aliases/UiStateEvent.md)\<`StateKey`\<`SdkSpecificStateMap`\>\>[]

A copy of the current event queue.

***

### ingest()

> **ingest**(`incomingUiStateKey`): `void`

Enqueues a new UI state event to be considered on the next `tick()`.

#### Parameters

##### incomingUiStateKey

`StateKey`\<`SdkSpecificStateMap`\>

Key of the new UI state event

#### Returns

`void`

***

### reset()

> **reset**(`currentKey?`): `void`

Resets the stabilizer to its initial state.

#### Parameters

##### currentKey?

`StateKey`\<`SdkSpecificStateMap`\>

resets the stabilizer with a different key
than the one it was initialized with. Does not mutate `this.initialKey`

#### Returns

`void`

***

### restartCurrentStateTimer()

> **restartCurrentStateTimer**(): `void`

Restarts the minimum-duration timer for the current state.
Useful when a state should be timed from an external lifecycle point
(e.g. actual capture start) instead of construction/reset time.

#### Returns

`void`

***

### setTimeWindow()

> **setTimeWindow**(`timeWindow`): `void`

Updates the time window used for state stabilization

#### Parameters

##### timeWindow

`number`

New time window in milliseconds

#### Returns

`void`

***

### tick()

> **tick**(): `SdkSpecificStateMap`\[`StateKey`\<`SdkSpecificStateMap`\>\]

Advances stabilizer time and returns the state that should be displayed.

This method:
1. Handles single-emit events that bypass normal stabilization
2. Maintains a time-windowed queue of regular events
3. Applies temporal averaging with decay to determine the winning state

#### Returns

`SdkSpecificStateMap`\[`StateKey`\<`SdkSpecificStateMap`\>\]

The UI state that should be displayed.
