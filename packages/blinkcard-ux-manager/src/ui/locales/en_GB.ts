/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for en_GB.
 */
export default {
  feedback_messages: {
    blur_detected: "Keep card and phone still",
    blur_detected_desktop: "Keep card and device still",
    camera_angle_too_steep: "Keep card parallel to phone",
    camera_angle_too_steep_desktop: "Keep card parallel with screen",
    card_number_scanned: "Success! Card number side scanned",
    card_scanned: "Success! Card scanned",
    document_too_close_to_edge: "Move farther",
    flip_card: "Flip the card over",
    flip_to_back_side: "Flip the card over",
    move_closer: "Move closer",
    move_farther: "Move farther",
    occluded: "Keep the card fully visible",
    scan_the_back_side: "Scan the other side of the card",
    scan_the_front_side: "Scan the card number",
  },
  help_button: { aria_label: "Help", tooltip: "Need help?" },
  help_modal: {
    back_btn: "Back",
    blur: {
      details:
        "Keep the phone and card still while scanning. Moving either may blur the image and make the card details unreadable.",
      details_desktop:
        "Try to keep the device and card still while scanning. Moving either can blur the image and make data on the card unreadable.",
      title: "Keep still while scanning",
    },
    camera_lens: {
      details:
        "Check your camera lens for smudges or dust. A dirty lens causes the final image to blur, making the card details unreadable and preventing successful scan of the data.",
      title: "Clean your camera lens",
    },
    card_number: {
      details:
        "The card number is usually 16 digits long, though it may be between 12 and 19 digits. It will be printed or embossed in raised numbers on the card, either on the front or the back.",
      title: "Where is the card number?",
    },
    done_btn: "Done",
    lighting: {
      details:
        "Avoid direct, harsh light as it can reflect off the card and make parts of it unreadable. If you can’t read the data on the card yourself, the camera won’t be able to either.",
      title: "Watch out for harsh light",
    },
    next_btn: "Next",
    occlusion: {
      details:
        "Make sure you’re not covering any part of the card with your fingers, including the bottom lines. Also watch out for hologram reflections that may obscure the card’s fields.",
      title: "Keep all the fields visible",
    },
  },
  onboarding_modal: {
    btn: "Start Scanning",
    details:
      "The card number is usually 16 digits long. It will be printed or embossed in raised numbers on the card. Make sure the card is well lit and that all details are clearly visible.",
    details_desktop:
      "Card number is usually a 16-digit number. It should be either printed or embossed in raised numbers across the card. Make sure your camera lens is clean, the card is well lit, and all details are visible.",
    title: "Scan the card number first",
  },
  timeout_modal: {
    cancel_btn: "Cancel",
    details: "Unable to read the card. Please try again.",
    retry_btn: "Retry",
    title: "Scan unsuccessful",
  },
} as const;
