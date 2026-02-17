[**@microblink/blinkcard**](../README.md)

***

[@microblink/blinkcard](../README.md) / CardLivenessCheckResult

# Type Alias: CardLivenessCheckResult

> **CardLivenessCheckResult** = `object`

Structure representing the result of liveness checks for a card.

## Properties

### cardHeldInHandCheckResult

> **cardHeldInHandCheckResult**: [`CheckResult`](CheckResult.md)

Result of the liveness check that detects whether a card is being held in
human hands.

***

### photocopyCheckResult

> **photocopyCheckResult**: [`CheckResult`](CheckResult.md)

Result of the liveness check that detects whether the input image is a
photocopy of a card.

***

### screenCheckResult

> **screenCheckResult**: [`CheckResult`](CheckResult.md)

Result of the liveness check that detects whether card is displayed on the
screen.
