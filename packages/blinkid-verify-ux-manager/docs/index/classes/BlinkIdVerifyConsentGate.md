[**@microblink/blinkid-verify-ux-manager**](../../README.md)

***

[@microblink/blinkid-verify-ux-manager](../../README.md) / [index](../README.md) / BlinkIdVerifyConsentGate

# Class: BlinkIdVerifyConsentGate

Holds a `BlinkIdVerifyUxManager` until the user accepts `RequireConsent`.

The factory returns this gate instead of the manager. Acceptance hands the manager to the caller. Decline dismounts
the camera UI and destroys the manager.

## Constructors

### Constructor

> **new BlinkIdVerifyConsentGate**(`manager`, `consentFields`): `BlinkIdVerifyConsentGate`

#### Parameters

##### manager

[`BlinkIdVerifyUxManager`](../interfaces/BlinkIdVerifyUxManager.md)

Manager constructed by the factory. Frame processing stays blocked until consent is accepted.

##### consentFields

[`ConsentUiInput`](../type-aliases/ConsentUiInput.md)

Values used to render the consent UI and generate the accepted consent object.

#### Returns

`BlinkIdVerifyConsentGate`

## Methods

### consentUiResponse()

> **consentUiResponse**(`cameraManagerComponent`, `localizationStrings?`): `Promise`\<[`BlinkIdVerifyUxManager`](../interfaces/BlinkIdVerifyUxManager.md) \| `undefined`\>

Shows the consent modal on the camera UI.

Acceptance returns the manager, which the caller then owns. Decline dismounts the camera UI, destroys the manager,
and returns `undefined`. A second call after acceptance returns the same manager without showing the modal again.

#### Parameters

##### cameraManagerComponent

`CameraManagerComponent`

Mounted camera UI used to show the consent modal.

##### localizationStrings?

Optional overrides for the consent dialog copy. The same object used for the feedback
  UI applies here.

###### consent_modal?

`string` \| \{ `consent_btn?`: `string`; `consent_switch?`: `string`; `decline_btn?`: `string`; `details?`: `string`; `optional?`: `string`; `privacy_link?`: `string`; `privacy_notice?`: `string`; `title?`: `string`; \} = `...`

###### document_filtered_modal?

`string` \| \{ `details?`: `string`; `title?`: `string`; \} = `...`

###### document_not_recognized_modal?

`string` \| \{ `details?`: `string`; `title?`: `string`; \} = `...`

###### feedback_messages?

`string` \| \{ `blur_detected?`: `string`; `camera_angle_too_steep?`: `string`; `document_scanned_aria?`: `string`; `document_too_close_to_edge?`: `string`; `face_photo_not_fully_visible?`: `string`; `flip_document?`: `string`; `flip_to_back_side?`: `string`; `front_side_scanned_aria?`: `string`; `glare_detected?`: `string`; `keep_document_parallel?`: `string`; `keep_document_still?`: `string`; `move_closer?`: `string`; `move_farther?`: `string`; `move_left?`: `string`; `move_right?`: `string`; `move_top?`: `string`; `occluded?`: `string`; `scan_data_page?`: `string`; `scan_last_page_barcode?`: `string`; `scan_left_page?`: `string`; `scan_right_page?`: `string`; `scan_the_back_side?`: `string`; `scan_the_barcode?`: `string`; `scan_the_front_side?`: `string`; `scan_top_page?`: `string`; `screen_detected?`: `string`; `too_bright?`: `string`; `too_dark?`: `string`; `wrong_left?`: `string`; `wrong_right?`: `string`; `wrong_top?`: `string`; \} = `...`

###### flashlight_warning_message?

`string` = "Watch out for flashlight glare.\nGently move your ID around to avoid it."

###### help_button?

`string` \| \{ `aria_label?`: `string`; `tooltip?`: `string`; \} = `...`

###### help_modal?

`string` \| \{ `aria?`: `string`; `back_btn?`: `string`; `blur?`: `string` \| \{ `details?`: `string`; `details_desktop?`: `string`; `title?`: `string`; \}; `camera_lens?`: `string` \| \{ `details?`: `string`; `title?`: `string`; \}; `done_btn?`: `string`; `done_btn_aria?`: `string`; `lighting?`: `string` \| \{ `details?`: `string`; `title?`: `string`; \}; `next_btn?`: `string`; `visibility?`: `string` \| \{ `details?`: `string`; `title?`: `string`; \}; \} = `...`

###### onboarding_modal?

`string` \| \{ `aria?`: `string`; `btn?`: `string`; `details?`: `string`; `details_desktop?`: `string`; `title?`: `string`; `title_desktop?`: `string`; \} = `...`

###### privacy_notice?

`string` \| \{ `title?`: `string`; \} = `...`

###### sdk_aria?

`string` = `"Document scanning screen"`

###### timeout_modal?

`string` \| \{ `cancel_btn?`: `string`; `details?`: `string`; `retry_btn?`: `string`; `title?`: `string`; \} = `...`

#### Returns

`Promise`\<[`BlinkIdVerifyUxManager`](../interfaces/BlinkIdVerifyUxManager.md) \| `undefined`\>

The UX manager when consent is accepted, otherwise `undefined`.

***

### destroy()

> **destroy**(): `void`

Destroys the manager when the caller abandons the flow before acceptance.

After a successful `consentUiResponse`, the caller owns the manager and must call `manager.destroy()` instead.

#### Returns

`void`
