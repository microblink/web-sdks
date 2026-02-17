[**@microblink/blinkcard-core**](../README.md)

***

[@microblink/blinkcard-core](../README.md) / StrictnessLevel

# Type Alias: StrictnessLevel

> **StrictnessLevel** = `"disabled"` \| `"level-1"` \| `"level-2"` \| `"level-3"` \| `"level-4"` \| `"level-5"` \| `"level-6"` \| `"level-7"` \| `"level-8"` \| `"level-9"` \| `"level-10"`

Defines the strictness level used by various models to control detection
sensitivity.

Higher levels apply stricter validation criteria, improving security and
reducing false accepts (FAR), but may increase false rejects (FRR).

Levels are ordered by increasing strictness:

- `Disabled` turns the check off.
- The first active level has the lowest FRR and highest FAR.
- The last level has the highest FRR and lowest FAR.
