/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for sl.
 */
export default {
  feedback_messages: {
    blur_detected: "Držite kartico in telefon pri miru",
    blur_detected_desktop: "Držite kartico in napravo pri miru",
    camera_angle_too_steep: "Kartico držite vzporedno s telefonom",
    camera_angle_too_steep_desktop: "Kartico držite vzporedno z zaslonom",
    card_number_scanned: "Uspelo! Stran s številko kartice je skenirana",
    card_scanned: "Uspelo! Kartica je skenirana",
    document_too_close_to_edge: "Oddaljite",
    flip_card: "Obrnite kartico",
    flip_to_back_side: "Obrnite kartico",
    move_closer: "Približajte",
    move_farther: "Oddaljite",
    occluded: "Kartica naj bo povsem vidna",
    scan_the_back_side: "Optično preberite drugo stran kartice",
    scan_the_front_side: "Skenirajte številko kartice",
  },
  help_button: { aria_label: "Pomoč", tooltip: "Potrebujete pomoč?" },
  help_modal: {
    aria: "Pomoč pri optičnem branju",
    back_btn: "Nazaj",
    blur: {
      details:
        "Med skeniranjem poskusite držati telefon in kartico pri miru. Gibanje obeh lahko zamegli sliko in onemogoči branje podatkov na kartici.",
      details_desktop:
        "Potrudite se, da bosta med optičnim branjem naprava in kartica pri miru. Če se katera od njiju premakne, se lahko slika razmaže in bodo podatki na kartici neberljivi.",
      title: "Držite pri miru med optičnim branjem",
    },
    camera_lens: {
      details:
        "Preverite, da ni morda na objektivu kamere kakšna umazanija ali prah. Če je objektiv umazan, dobite zamegljeno končno sliko, zato so potem podatki s kartice neberljivi in jih ni mogoče uspešno optično prebrati.",
      title: "Očistite objektiv kamere",
    },
    card_number: {
      details:
        "Številka kartice je običajno 16-mestna, vendar je lahko sestavljena iz 12 do 19 številk. Natisnjena ali vtisnjena mora biti z dvignjenimi številkami na celotni kartici. Lahko je na sprednji ali zadnji strani kartice.",
      title: "Kje je številka kartice?",
    },
    done_btn: "Končano",
    done_btn_aria: "Nadaljuj optično branje",
    lighting: {
      details:
        "Izogibajte se neposredni močni svetlobi, ker se ta odbija od kartice in lahko povzroči, da delov kartice ni mogoče prebrati. Če podatkov na kartici ne morete prebrati, jih tudi fotoaparat ne bo videl.",
      title: "Svetloba ne sme biti premočna",
    },
    next_btn: "Naprej",
    occlusion: {
      details:
        "Prepričajte se, da s prstom ne prekrivate delov kartice, vključno s spodnjimi vrsticami. Pazite tudi na hologramske odseve, ki segajo čez polja kartic.",
      title: "Vidna morajo biti vsa polja",
    },
  },
  onboarding_modal: {
    aria: "Navodila za optično branje",
    btn: "Začetek skeniranja",
    details:
      "Številka kartice je običajno 16-mestna. Natisnjena ali vtisnjena mora biti z dvignjenimi številkami po celotni kartici. Prepričajte se, da je kartica dobro osvetljena in da so vidne vse podrobnosti.",
    details_desktop:
      "Številka kartice je običajno 16-mestna. Morala bi biti natisnjena ali vtisnjena z izbočenimi številkami po celotni kartici. Prepričajte se, da je objektiv kamere čist, kartica dobro osvetljena in da so vidne vse podrobnosti.",
    title: "Najprej skenirajte številko kartice",
  },
  sdk_aria: "Zaslon za optično branje kartic",
  timeout_modal: {
    cancel_btn: "Prekliči",
    details: "Kartice ni bilo mogoče prebrati. Poskusite znova.",
    retry_btn: "Poskusi znova",
    title: "Optično branje ni uspelo",
  },
} as const;
