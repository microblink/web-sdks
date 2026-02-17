/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for sw.
 */
export default {
  feedback_messages: {
    blur_detected: "Hakikisha kadi na simu havisongi",
    blur_detected_desktop: "Hakikisha kadi na kifaa havisongi",
    camera_angle_too_steep: "Weka kadi ikae sambamba na simu",
    camera_angle_too_steep_desktop: "Weka kadi ikae sambamba na skrini",
    card_number_scanned: "Imemaliza! Upande wa namba ya kadi umeskaniwa",
    card_scanned: "Imemaliza! Kadi imeskaniwa",
    document_too_close_to_edge: "Songa mbali",
    flip_card: "Geuza kadi",
    flip_to_back_side: "Geuza kadi",
    move_closer: "Songa karibu",
    move_farther: "Songa mbali",
    occluded: "Hakikisha kadi inaonekana kabisa",
    scan_the_back_side: "Skani upande mwingine wa kadi",
    scan_the_front_side: "Skani namba ya kadi",
  },
  help_button: { aria_label: "Usaidizi", tooltip: "Unahitaji usaidizi?" },
  help_modal: {
    back_btn: "Nyuma",
    blur: {
      details:
        "Jaribu kuhakikisha kadi na simu havisongi unaposkani. Ukisogeza chochote picha inaweza kukosa kuonekana vizuri na kufanya data kwenye kadi isiweze kusomeka.",
      details_desktop:
        "Jaribu kuhakikisha kadi na kifaa havisongi unaposkani. Ukisogeza chochote picha inaweza kukosa kuonekana vizuri na kufanya data kwenye kadi isiweze kusomeka.",
      title: "Usisonge unaposkani",
    },
    camera_lens: {
      details:
        "Angalia lenzi ya kamera yako kama ina uchafu au madoa. Lenzi chafu hufanya picha ya mwisho isionekane vizuri, na kufanya maelezo ya kadi yasiweze kusomeka na kuzuia data kuskanikiwa vizuri.",
      title: "Safisha lenzi ya kamera yako",
    },
    card_number: {
      details:
        "Namba ya kadi kawaida ni namba 16, ingawa inaweza kuwa na kati ya namba 12 na 19. Inapaswa kuwa imechapishwa au kuchorwa kwa namba zilizoinuka kwenye kadi. Inaweza kuwa mbele au nyuma ya kadi yako.",
      title: "Namba ya kadi iko wapi?",
    },
    done_btn: "Umemaliza",
    lighting: {
      details:
        "Epuka mwanga mkali wa moja kwa moja kwa sababu huakisiwa kutoka kwenye kadi na inaweza kufanya sehemu za kadi zisiweze kusomeka. Ikiwa huwezi kusoma data kwenye kadi, vilevile haitaonekana kwenye kamera.",
      title: "Kuwa mwangalifu na mwanga mkali",
    },
    next_btn: "Endelea",
    occlusion: {
      details:
        "Hakikisha hujafunika sehemu za kadi kwa kidole, ikijumuisha laini za chini. Pia, kuwa mwangalifu na mwanga unaoakisiwa na hologramu unaopita juu ya sehemu za kadi.",
      title: "Hakikisha sehemu zote zinaonekana",
    },
  },
  onboarding_modal: {
    btn: "Anza kuskani",
    details:
      "Namba ya kadi kawaida ni namba 16. Inapaswa kuwa imechapishwa au kuchorwa kwa namba zilizoinuka kwenye kadi. Hakikisha kadi iko kwenye mwanga wa kutosha na maelezo yote yanaonekana.",
    details_desktop:
      "Namba ya kadi kawaida ni namba 16. Inapaswa kuwa imechapishwa au kuchorwa kwa namba zilizoinuka kwenye kadi. Hakikisha lenzi ya kamera yako ni safi, kadi iko kwenye mwanga wa kutosha na maelezo yote yanaonekana.",
    title: "Skani namba ya kadi kwanza",
  },
  timeout_modal: {
    cancel_btn: "Acha",
    details: "Imeshindwa kusoma kadi. Tafadhali jaribu tena.",
    retry_btn: "Jaribu tena",
    title: "Imeshindwa kuskani",
  },
} as const;
