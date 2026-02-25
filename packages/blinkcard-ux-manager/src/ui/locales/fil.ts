/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for fil.
 */
export default {
  feedback_messages: {
    blur_detected: "Panatilihing hindi gumagalaw ang card at telepono",
    blur_detected_desktop: "Panatilihing hindi gumagalaw ang card at device",
    camera_angle_too_steep: "Panatilihing nakatapat ang card sa telepono",
    camera_angle_too_steep_desktop: "Panatilihing nakatapat ang card sa screen",
    card_number_scanned: "Tagumpay! Na-scan ang numero na bahagi ng card",
    card_scanned: "Tagumpay! Na-scan ang card",
    document_too_close_to_edge: "Ilayo pa",
    flip_card: "Baligtarin ang card",
    flip_to_back_side: "Baligtarin ang card",
    move_closer: "Ilapit pa",
    move_farther: "Ilayo pa",
    occluded: "Panatilihing ganap na nakikita ang card",
    scan_the_back_side: "I-scan ang kabilang panig ng card",
    scan_the_front_side: "I-scan ang numero ng card",
  },
  help_button: { aria_label: "Tulong", tooltip: "Kailangan ng tulong?" },
  help_modal: {
    aria: "Tulong sa pag-scan",
    back_btn: "Bumalik",
    blur: {
      details:
        "Panatilihing hindi gumagalaw ang telepono at card habang nag-i-scan. Maaaring magpalabo sa larawan at hindi mababasa ang data sa card kapag nagalaw ito.",
      details_desktop:
        "Panatilihing hindi gumagalaw ang device at card habang nag-i-scan. Maaaring magpalabo sa larawan at hindi mababasa ang data sa card kapag nagalaw ito.",
      title: "Panatilihing hindi gumagalaw habang nag-i-scan",
    },
    camera_lens: {
      details:
        "Suriin kung may mga mantsa o alikabok ang lens ng camera mo. Nagdudulot ng paglabo ng pinal na larawan ang maruruming lens, na dahilan para hindi mabasa ang mga detalye ng card at hindi pag-scan sa data.",
      title: "Linisin ang mga lens ng camera mo",
    },
    card_number: {
      details:
        "Kadalasang 16 na digit ang numero ng card, bagama't maaari itong magkaroon ng 12 hanggang 19 digit. Dapat itong naka-print o naka-emboss sa mga nakataas na numero sa buong card. Puwede itong nasa unahan o likuran ng iyong card.",
      title: "Saan makikita ang numero ng card?",
    },
    done_btn: "Tapos na",
    done_btn_aria: "I-resume ang pag-scan",
    lighting: {
      details:
        "Iwasan ang direktang nakakasilaw na ilaw dahil maaari itong mag-reflect sa card at hindi mababasa ang mga bahagi ng card. Kung mo mabasa ang data sa card, hindi rin ito makikita ng camera.",
      title: "Tingnan kung may nakakasilaw na liwanag",
    },
    next_btn: "Susunod",
    occlusion: {
      details:
        "Siguraduhing hindi natatakpan ng iyong daliri ang mga bahagi ng card, pati na ang mga linya sa ilalim. Gayon rin, tingnan kung may mga hologram reflection na tumatakip sa mga field ng mga card.",
      title: "Panatilihing nakikita ang lahat ng field",
    },
  },
  onboarding_modal: {
    aria: "Mga Tagubilin sa Pag-scan",
    btn: "Simulan ang Pag-scan",
    details:
      "Kadalasang 16 na digit ang numero ng card. Dapat itong naka-print o naka-emboss sa mga nakataas na numero sa buong card. Siguraduhing sapat na naiilawan ang card na iyon at nakikita ang lahat ng detalye.",
    details_desktop:
      "Kadalasang 16 na digit ang numero ng card. Dapat itong naka-print o naka-emboss sa mga nakataas na numero sa buong card. Siguraduhing na malinis ang lens ng iyong camera, sapat na naiilawan ang card na iyon, at nakikita ang lahat ng detalye.",
    title: "I-scan muna ang numero ng card",
  },
  sdk_aria: "Screen ng pag-scan ng card",
  timeout_modal: {
    cancel_btn: "Kanselahin",
    details: "Hindi mabasa ang card. Pakisubukan ulit.",
    retry_btn: "Subukan ulit",
    title: "Hindi matagumpay ang pag-scan",
  },
} as const;
