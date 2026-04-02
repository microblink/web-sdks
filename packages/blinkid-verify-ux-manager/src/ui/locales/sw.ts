/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for sw.
 */
export default {
  document_filtered_modal: {
    details: "Jaribu kuskani hati tofauti.",
    title: "Hati haikubaliki",
  },
  document_not_recognized_modal: {
    details: "Skani upande wa mbele wa hati inayokubalika.",
    title: "Hati imeshindwa kutambuliwa",
  },
  feedback_messages: {
    blur_detected: "Hakikisha hati na simu havisongi",
    camera_angle_too_steep: "Hakikisha hati iko sambamba na simu",
    document_scanned_aria: "Imemaliza! Hati imeskaniwa",
    document_too_close_to_edge: "Songa mbali",
    face_photo_not_fully_visible: "Hakikisha picha ya uso inaonekana kabisa",
    flip_document: "Geuza hati",
    flip_to_back_side: "Geuza upande wa nyuma",
    front_side_scanned_aria: "Imemaliza! Upande wa mbele umeskaniwa",
    glare_detected: "Inamisha au sogeza hati ili uondoe mwanga unaoakisiwa",
    keep_document_parallel: "Hakikisha hati iko sambamba na skrini",
    keep_document_still: "Hakikisha hati na kifaa havisongi",
    move_closer: "Songa karibu",
    move_farther: "Songa mbali",
    move_left: "Nenda kwenye ukurasa wa kushoto",
    move_right: "Nenda kwenye ukurasa wa kulia",
    move_top: "Nenda kwenye ukurasa wa juu",
    occluded: "Hakikisha hati inaonekana kabisa",
    scan_data_page: "Skani ukurasa wa data wa hati",
    scan_last_page_barcode: "Changanua msimbopau kwenye ukurasa wa mwisho",
    scan_left_page: "Skani ukurasa wa kushoto",
    scan_right_page: "Skani ukurasa wa kulia",
    scan_the_back_side: "Skani upande wa nyuma wa hati",
    scan_the_barcode: "Skani msimbopau",
    scan_the_front_side: "Skani upande wa mbele wa hati",
    scan_top_page: "Skani ukurasa wa juu",
    too_bright: "Songa mahali penye mwanga kidogo",
    too_dark: "Songa mahali penye mwanga mwingi",
    wrong_left: "Nenda kwenye ukurasa wa kushoto",
    wrong_right: "Nenda kwenye ukurasa wa kulia",
    wrong_top: "Nenda kwenye ukurasa wa juu",
  },
  help_button: { aria_label: "Usaidizi", tooltip: "Unahitaji usaidizi?" },
  help_modal: {
    aria: "Usaidizi wa kuskani",
    back_btn: "Nyuma",
    blur: {
      details:
        "Jaribu kuhakikisha hati na simu havisongi unaposkani. Ukisogeza chochote picha inaweza kukosa kuonekana vizuri na kufanya data kwenye hati isiweze kusomeka.",
      details_desktop:
        "Jaribu kuhakikisha hati na kifaa havisongi unaposkani. Ukisogeza chochote picha inaweza kukosa kuonekana vizuri na kufanya data kwenye hati isiweze kusomeka.",
      title: "Usisonge unaposkani",
    },
    camera_lens: {
      details:
        "Angalia lenzi ya kamera yako kama ina uchafu au madoa. Lenzi chafu hufanya picha ya mwisho isionekane vizuri, na kufanya maelezo ya hati yasiweze kusomeka na kuzuia data kuskanikiwa vizuri.",
      title: "Safisha lenzi ya kamera yako",
    },
    done_btn: "Umemaliza",
    done_btn_aria: "Endelea kuskani",
    lighting: {
      details:
        "Epuka mwanga mkali wa moja kwa moja kwa sababu huakisiwa kutoka kwenye hati na inaweza kufanya sehemu za hati zisiweze kusomeka. Ikiwa huwezi kusoma data kwenye hati, vilevile haitaonekana kwenye kamera.",
      title: "Kuwa mwangalifu na mwanga mkali",
    },
    next_btn: "Endelea",
    visibility: {
      details:
        "Hakikisha hujafunika sehemu za hati kwa kidole, ikijumuisha laini za chini. Pia, kuwa mwangalifu na mwanga unaoakisiwa na hologramu unaopita juu ya sehemu za hati.",
      title: "Hakikisha sehemu zote zinaonekana",
    },
  },
  onboarding_modal: {
    aria: "Maagizo ya kuskani",
    btn: "Anza kuskani",
    details:
      "Hakikisha hati iko kwenye mwanga wa kutosha. Sehemu zote za hati zinapaswa kuonekana kwenye skrini ya kamera.",
    details_desktop:
      "Hakikisha lenzi ya kamera yako ni safi na hati iko kwenye mwanga wa kutosha. Sehemu zote za hati zinapaswa kuonekana kwenye skrini ya kamera.",
    title: "Hakikisha kila kitu kinaonekana",
    title_desktop: "Kuwa tayari kuskani",
  },
  sdk_aria: "Skrini ya kuskani hati",
  timeout_modal: {
    cancel_btn: "Acha",
    details: "Imeshindwa kusoma hati. Tafadhali jaribu tena.",
    retry_btn: "Jaribu tena",
    title: "Imeshindwa kuskani",
  },
} as const;
