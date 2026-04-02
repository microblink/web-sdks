/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for ha.
 */
export default {
  document_filtered_modal: {
    details: "Gwada ɗaukar hoton wata takarda ta daban.",
    title: "Ba a karɓi takarda ba",
  },
  document_not_recognized_modal: {
    details: "A ɗauki hoton gaban takardar ƙarin bayanin.",
    title: "Ba a gane takarda ba",
  },
  feedback_messages: {
    blur_detected: "A daina motsa takarda da waya",
    camera_angle_too_steep: "Sanya takarda a saitin waya",
    document_scanned_aria: "An yi nasara! An ɗauki hoton takarda",
    document_too_close_to_edge: "Matsa baya",
    face_photo_not_fully_visible:
      "A daidaita hoton fuska yadda za a riƙa kallon sa duka",
    flip_document: "Juya takardar",
    flip_to_back_side: "A juya bayan",
    front_side_scanned_aria: "An yi nasara! An ɗauki hoton gaba ta gefe",
    glare_detected:
      "A karkata ko a matsar da takarda domin a cire dau da hasken yake yi",
    keep_document_parallel: "Sanya takarda a saitin sikirin ɗin",
    keep_document_still: "A daina motsa takarda da na'ura",
    move_closer: "Matsa kusa",
    move_farther: "Matsa baya",
    move_left: "Koma zuwa shafin da yake ta hagu",
    move_right: "Koma zuwa shafin da yake ta dama",
    move_top: "Koma zuwa shafin da yake ta sama",
    occluded: "A daidaita yadda za a iya kallon takardar baki ɗaya",
    scan_data_page: "Ɗauki hoton shafin bayanan takardar",
    scan_last_page_barcode: "Sikanin lambar kaya daga shafin ƙarshe",
    scan_left_page: "Ɗauki hoton shafin hagu",
    scan_right_page: "Ɗauki hoton shafin dama",
    scan_the_back_side: "A ɗauki hoton bayan takardar",
    scan_the_barcode: "A ɗauki hoton lambar barcode",
    scan_the_front_side: "A ɗauki hoton gaban takardar",
    scan_top_page: "Ɗauki hoton shafin sama",
    too_bright: "Matsa zuwa wuri mai ƙarancin haske",
    too_dark: "Matsa zuwa wuri mai haske",
    wrong_left: "Koma zuwa shafin hagu",
    wrong_right: "Koma zuwa shafin dama",
    wrong_top: "Koma zuwa shafin sama",
  },
  help_button: { aria_label: "Taimako", tooltip: "Ana buƙatar taimako?" },
  help_modal: {
    aria: "Taimako a fannin ɗaukar hoto",
    back_btn: "Baya",
    blur: {
      details:
        "A daina motsa waya da takarda yayin ɗaukar hoto. Motsa ɗaya daga cikinsu zai sa hoton ya yi dishi-dishi sannan zai sa ba za a iya karanta bayanan da suke kan takardar ba.",
      details_desktop:
        "A daina motsa na'ura da takarda yayin ɗaukar hoto. Motsa ɗaya daga cikinsu zai sa hoton ya yi dishi-dishi sannan zai sa ba za a iya karanta bayanan da suke kan takardar ba.",
      title: "Kada a motsa yayin ɗaukar hoto",
    },
    camera_lens: {
      details:
        "A duba domin tabbatar da gilashin kamerarku bai yi dishi-dishi ba, kuma ba ya ɗauke da ƙura. Gilashin kamera mai datti yakan sa hoton ya yi bishi-bishi, wanda hakan zai sa ba za a iya karanta bayanan da suke kan takardar ba sannan zai hana a ɗauki hoton bayanna yadda ya kamata.",
      title: "Ku tsaftace gilashin kamerarku",
    },
    done_btn: "Kammala",
    done_btn_aria: "Ci gaba da ɗaukar hoto",
    lighting: {
      details:
        "Kada a yi amfani da haske mai ƙarfi domin zai yi dau a kan takardar sannan zai sa ba za a iya karanta wasu ɓangarorin takardar ba. Idan ba za ku iya karanta bayanan da suke kan takardar ba, to kemara ma ba za ta iya ganin su ba.",
      title: "A duba haske mai ƙarfi",
    },
    next_btn: "Gaba",
    visibility: {
      details:
        "A tabbatar da cewa ba a rufe wasu ɓangarorin takardar ba da yatsa, ciki har da layukan da suke ƙasan takardar. Bayan haka, a duba ko akwai layukan haske da suka hau kan ɓangarorin takardar.",
      title: "A daidaita yadda za a riƙa ganin dukkannin ɓangarori",
    },
  },
  onboarding_modal: {
    aria: "Ƙa'idojin Ɗaukar Hoto",
    btn: "Fara ɗaukar hoto",
    details:
      "A tabbatar da an haska ɗaukacin takardar. Ya kasance ana ganin dukkannin ɓangarorin takardar a cikin sikirin ɗin kamera.",
    details_desktop:
      "A tabbatar da cewa gilashin kamera ɗin ba shi da ƙura sannan an haska ɗaukacin takardar. Ya kasance ana ganin dukkannin ɓangarorin takardar a cikin sikirin ɗin kamera.",
    title: "A daidaita yadda za a riƙa ganin dukkannin bayanan",
    title_desktop: "Shirya domin ɗaukar hoto",
  },
  sdk_aria: "Sikirin na ɗaukar hoton takarda",
  timeout_modal: {
    cancel_btn: "Soke",
    details: "An kasa karanta takardar. A sake gwadawa.",
    retry_btn: "Sake gwadawa",
    title: "An yi nasarar ɗaukar hoto",
  },
} as const;
