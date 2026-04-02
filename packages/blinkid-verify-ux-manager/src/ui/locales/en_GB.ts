/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for en_GB.
 */
export default {
  document_filtered_modal: {
    details: "Try scanning a different document.",
    title: "Document not accepted",
  },
  document_not_recognized_modal: {
    details: "Scan the front side of a supported document.",
    title: "Document not recognised",
  },
  feedback_messages: {
    blur_detected: "Keep document and phone still",
    camera_angle_too_steep: "Keep document parallel to phone",
    document_scanned_aria: "Success! Document scanned",
    document_too_close_to_edge: "Move farther",
    face_photo_not_fully_visible: "Keep face photo fully visible",
    flip_document: "Flip the document",
    flip_to_back_side: "Flip to the back side",
    front_side_scanned_aria: "Success! Front side scanned",
    glare_detected: "Tilt or move document to remove reflection",
    keep_document_parallel: "Keep document parallel with screen",
    keep_document_still: "Keep document and device still",
    move_closer: "Move closer",
    move_farther: "Move farther",
    move_left: "Move to the page on the left",
    move_right: "Move to the page on the right",
    move_top: "Move to the page on top",
    occluded: "Keep the document fully visible",
    scan_data_page: "Scan the data page of the document",
    scan_last_page_barcode: "Scan barcode from the last page",
    scan_left_page: "Scan the left page",
    scan_right_page: "Scan the right page",
    scan_the_back_side: "Scan the back side of the document",
    scan_the_barcode: "Scan the barcode",
    scan_the_front_side: "Scan the front side of the document",
    scan_top_page: "Scan the top page",
    too_bright: "Move to spot with less lighting",
    too_dark: "Move to brighter spot",
    wrong_left: "Move to the left page",
    wrong_right: "Move to the right page",
    wrong_top: "Move to the top page",
  },
  help_button: { aria_label: "Help", tooltip: "Need help?" },
  help_modal: {
    aria: "Scanning help",
    back_btn: "Back",
    blur: {
      details:
        "Try to keep the phone and document still while scanning. Moving either can blur the image and make data on the document unreadable.",
      details_desktop:
        "Keep the device and document steady while scanning. Any movement can blur the image and make the data unreadable.",
      title: "Keep still while scanning",
    },
    camera_lens: {
      details:
        "Check the camera lens for smudges or dust. A dirty lens can blur the image and make the document details unreadable, preventing a successful scan.",
      title: "Clean your camera lens",
    },
    done_btn: "Done",
    done_btn_aria: "Resume scanning",
    lighting: {
      details:
        "Avoid direct harsh light because it reflects from the document and can make parts of the document unreadable. If you can’t read data on the document, it won’t be visible to the camera either.",
      title: "Watch out for harsh light",
    },
    next_btn: "Next",
    visibility: {
      details:
        "Make sure you aren’t covering parts of the document with a finger, including the bottom lines. Also, watch out for hologram reflections that go over the document fields.",
      title: "Keep all the fields visible",
    },
  },
  onboarding_modal: {
    aria: "Scanning Instructions",
    btn: "Start Scanning",
    details:
      "Make sure you keep the document well lit. All document fields should be visible on the camera screen.",
    details_desktop:
      "Make sure the camera lens is clean and the document is well lit. Ensure all document fields are visible on the screen.",
    title: "Keep all the details visible",
    title_desktop: "Get ready to scan",
  },
  sdk_aria: "Document scanning screen",
  timeout_modal: {
    cancel_btn: "Cancel",
    details: "Unable to read the document. Please try again.",
    retry_btn: "Retry",
    title: "Scan unsuccessful",
  },
} as const;
