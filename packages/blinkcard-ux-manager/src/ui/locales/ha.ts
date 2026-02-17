/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for ha.
 */
export default {
  feedback_messages: {
    blur_detected: "A daina motsa kati da waya",
    blur_detected_desktop: "A daina motsa kati da na'ura",
    camera_angle_too_steep: "A sanya kati a saitin waya",
    camera_angle_too_steep_desktop: "A sanya kati a saitin waya",
    card_number_scanned: "An yi nasara! An ɗauki hoton gefen lambar kati",
    card_scanned: "An yi nasara! An ɗauki hoton kati",
    document_too_close_to_edge: "Matsa baya",
    flip_card: "A juya bayan katin",
    flip_to_back_side: "A juya bayan katin",
    move_closer: "Matsa kusa",
    move_farther: "Matsa baya",
    occluded: "A daidaita yadda za a iya kallon katin baki ɗaya",
    scan_the_back_side: "A ɗauki hoton ɗaya ɓangaren katin",
    scan_the_front_side: "A ɗauki hoton lambar katin",
  },
  help_button: { aria_label: "Taimako", tooltip: "Ana buƙatar taimako?" },
  help_modal: {
    back_btn: "Baya",
    blur: {
      details:
        "A daina motsa waya da kati yayin ɗaukar hoto. Motsa ɗaya daga cikinsu zai sa hoton ya yi dishi-dishi sannan zai sa ba za a iya karanta bayanan da suke kan katin ba.",
      details_desktop:
        "A daina motsa na'ura da kati yayin ɗaukar hoto. Motsa ɗaya daga cikinsu zai sa hoton ya yi dishi-dishi sannan zai sa ba za a iya karanta bayanan da suke kan katin ba.",
      title: "Kada a motsa yayin ɗaukar hoto",
    },
    camera_lens: {
      details:
        "A duba domin tabbatar da gilashin kamerarku bai yi dishi-dishi ba, kuma ba ya ɗauke da ƙura. Gilashin kamera mai datti yakan sa hoton ya yi bishi-bishi, wanda hakan zai sa ba za a iya karanta bayanan da suke kan katin ba sannan zai hana a ɗauki hoton bayanna yadda ya kamata.",
      title: "Ku tsaftace gilashin kamerarku",
    },
    card_number: {
      details:
        "Yawanci lambar kati takan kasance lambobi 16, duk da cewa za ta iya ƙunsar lambobi tsakanin 12 zuwa 19. Za su kasance ko dai waɗanda aka gurza da rubutun kwamfuta ko waɗanda aka zana da tsarin rubutu mai tudu a kan katin. Zai iya kasance a gaba ko a bayan katinku.",
      title: "A ina lambar katin take?",
    },
    done_btn: "Kammala",
    lighting: {
      details:
        "Kada a yi amfani da haske mai ƙarfi domin zai yi dau a kan katin sannan zai sa ba za a iya karanta wasu ɓangarorin katin ba. Idan ba za ku iya karanta bayanan da suke kan katin ba, to kamara ma ba za ta iya ganin su ba.",
      title: "A duba haske mai ƙarfi",
    },
    next_btn: "Gaba",
    occlusion: {
      details:
        "A tabbatar da cewa ba a rufe wasu ɓangarorin katin ba da yatsa, ciki har da layukan da suke ƙasan katin. Bayan haka, a duba ko akwai layukan haske da suka hau kan ɓangarorin katin.",
      title: "A daidaita yadda za a riƙa ganin dukkannin ɓangarori",
    },
  },
  onboarding_modal: {
    btn: "Fara ɗaukar hoto",
    details:
      "Yawanci lambar kati takan kasance lambobi 16. Za su kasance ko dai waɗanda aka gurza da rubutun kwamfuta ko waɗanda aka zana da tsarin rubutu mai tudu a kan katin. A tabbatar da cewa an haska katin yadda ya kamata sannan ana kallon dukkannin bayanan da suke kai.",
    details_desktop:
      "Yawanci lambar kati takan kasance lambobi 16. Za su kasance ko dai waɗanda aka gurza da rubutun kwamfuta ko waɗanda aka zana da tsarin rubutu mai tudu a kan katin. A tabbatar da cewa ƙura bai tare gilashin kamerarku ba, sannan tabbatar an haska katin yadda ya kamata kuma ana kallon dukkannin bayanan da suke kai.",
    title: "A fara ɗaukar hoton lambar katin",
  },
  timeout_modal: {
    cancel_btn: "Soke",
    details: "An kasa karanta katin. A sake gwadawa.",
    retry_btn: "Sake gwadawa",
    title: "An yi nasarar ɗaukar hoto",
  },
} as const;
