/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for fil.
 */
export default {
  document_filtered_modal: {
    details: "Subukang mag-scan ng ibang dokumento.",
    title: "Hindi tinanggap ang dokumento",
  },
  document_not_recognized_modal: {
    details: "I-scan ang unahang bahagi ng isang suportadong dokumento.",
    title: "Hindi nababasa ang dokumento",
  },
  feedback_messages: {
    blur_detected: "Panatilihing hindi gumagalaw ang dokumento at telepono",
    camera_angle_too_steep: "Panatilihing nakatapat ang dokumento sa telepono",
    document_scanned_aria: "Tagumpay! Na-scan ang dokumento",
    document_too_close_to_edge: "Ilayo pa",
    face_photo_not_fully_visible:
      "Panatilihing ganap na nakikita ang larawan sa mukha",
    flip_document: "Baligtarin ang dokumento",
    flip_to_back_side: "Baligtarin ang dokumento",
    front_side_scanned_aria: "Tagumpay! Na-scan ang harap na bahagi",
    glare_detected: "I-tilt o iusog ang dokumento para maalis ang reflection",
    keep_document_parallel: "Panatilihing nakatapat ang dokumento sa screen",
    keep_document_still: "Panatilihing hindi gumagalaw ang dokumento at device",
    move_closer: "Ilapit pa",
    move_farther: "Ilayo pa",
    move_left: "Umusog sa page pakaliwa",
    move_right: "Umusog sa page pakanan",
    move_top: "Umusog sa page pataas",
    occluded: "Panatilihing ganap na nakikita ang dokumento",
    scan_data_page: "I-scan ang pahina ng data ng dokumento",
    scan_last_page_barcode: "I-scan ang barcode sa huling pahina",
    scan_left_page: "I-scan ang kaliwang page",
    scan_right_page: "I-scan ang kanang page",
    scan_the_back_side: "I-scan ang likurang bahagi ng dokumento",
    scan_the_barcode: "I-scan ang barcode",
    scan_the_front_side: "I-scan ang unahang bahagi ng dokumento",
    scan_top_page: "I-scan ang itaas ng page",
    too_bright: "Iusog sa bahaging hindi masyadong maliwanag",
    too_dark: "Iusog sa bahaging mas malinawag",
    wrong_left: "Pumunta sa kaliwang page",
    wrong_right: "Pumunta sa kanang page",
    wrong_top: "Pumunta sa itaas ng page",
  },
  help_button: { aria_label: "Tulong", tooltip: "Kailangan ng tulong?" },
  help_modal: {
    aria: "Tulong sa pag-scan",
    back_btn: "Bumalik",
    blur: {
      details:
        "Panatilihing ito gumagalaw ang telepono at dokumento habang nag-i-scan. Puwedeng maging malabo at hindi nababasa ang data sa dokumento kapag gumalaw.",
      details_desktop:
        "Panatilihing hindi gumagalaw ang device at dokumento habang nag-i-scan. Puwedeng maging malabo at hindi nababasa ang data sa dokumento kapag gumalaw.",
      title: "Panatilihing hindi gumagalaw habang nag-i-scan",
    },
    camera_lens: {
      details:
        "Suriin kung may mga mantsa o alikabok ang lens ng camera mo. Nagdudulot ng paglabo ng pinal na larawan ang maruruming lens, na dahilan para hindi mabasa ang mga detalye ng dokumento at hindi pag-scan sa data.",
      title: "Linisin ang mga lens ng camera mo",
    },
    done_btn: "Tapos na",
    done_btn_aria: "I-resume ang pag-scan",
    lighting: {
      details:
        "Iwasan ang direktang nakakasilaw na liwanag dahil umaaninag ito mula sa dokumento at puwedeng gawing hindi nababasa ang mga bahagi ng dokumento. Kung hindi mo mabasa ang data sa dokuemnto, hindi rin ito makikita ng camera.",
      title: "Tingnan kung may nakakasilaw na liwanag",
    },
    next_btn: "Susunod",
    visibility: {
      details:
        "Siguraduhin na hindi natatakpak ng iyong daliri ang mga bahagi ng dokumento, pati na ang pinakababang mga linya. Gayon rin, tingnan rin kung may mga hologram reflection na maaaring makatakip sa mga field ng dokumento.",
      title: "Panatilihing nakikita ang lahat ng field",
    },
  },
  onboarding_modal: {
    aria: "Mga Tagubilin sa Pag-scan",
    btn: "Simulan ang Pag-scan",
    details:
      "Tiyaki na lubos na naiilawan ang dokumento. Dapat nakikita sa screen ng camera ang lahat ng field ng dokumento.",
    details_desktop:
      "Tiyaking malinis ang lens ng camera mo at lubos na naiilawan ang dokumento. Dapat nakikita sa screen ng camera ang lahat ng field ng dokumento.",
    title: "Panatilihing nakikita ang lahat ng detalye",
    title_desktop: "Maghandang mag-scan",
  },
  sdk_aria: "Screen ng pag-scan ng dokumento",
  timeout_modal: {
    cancel_btn: "Kanselahin",
    details: "Hindi mabasa ang dokumento. Pakisubukan ulit.",
    retry_btn: "Subukan ulit",
    title: "Hindi matagumpay ang pag-scan",
  },
} as const;
