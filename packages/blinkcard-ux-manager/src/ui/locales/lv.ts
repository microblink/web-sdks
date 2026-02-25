/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for lv.
 */
export default {
  feedback_messages: {
    blur_detected: "Turiet karti un tālruni nekustīgu",
    blur_detected_desktop: "Turiet karti un ierīci nekustīgu",
    camera_angle_too_steep: "Turiet karti paralēli ekrānam",
    camera_angle_too_steep_desktop: "Turiet karti paralēli ekrānam",
    card_number_scanned: "Kartes numura puse noskenēta veiksmīgi!",
    card_scanned: "Karte noskenēta veiksmīgi!",
    document_too_close_to_edge: "Pārvietot tālāk",
    flip_card: "Pagrieziet kartes otru pusi",
    flip_to_back_side: "Pagrieziet kartes otru pusi",
    move_closer: "Pārvietot tuvāk",
    move_farther: "Pārvietot tālāk",
    occluded: "Turiet karti tā, lai tā būtu pilnībā redzama",
    scan_the_back_side: "Noskenējiet kartes otru pusi",
    scan_the_front_side: "Noskenējiet kartes numuru",
  },
  help_button: { aria_label: "Palīdzība", tooltip: "Vai vajadzīga palīdzība?" },
  help_modal: {
    aria: "Palīdzība skenēšanas procesā",
    back_btn: "Atpakaļ",
    blur: {
      details:
        "Skenēšanas laikā nekustiniet tālruni un karti. Pretējā gadījumā attēls var būt izplūdis, un kartes dati var kļūt nesalasāmi.",
      details_desktop:
        "Skenēšanas laikā centieties turēt ierīci un karti nekustīgu. Pretējā gadījumā attēls var būt izplūdis, un kartes dati var kļūt nesalasāmi.",
      title: "Skenēšanas laikā turēt nekustīgu",
    },
    camera_lens: {
      details:
        "Pārbaudiet, vai uz kameras objektīva nav traipu vai putekļu. Netīrs objektīvs izraisa galīgā attēla izplūšanu, padarot kartes datus nelasāmus un neļaujot sekmīgi skenēt datus.",
      title: "Notīriet kameras objektīvu",
    },
    card_number: {
      details:
        "Parasti kartes numuru veido 16 cipari, bet tas var būt arī 12–19 ciparus garš. Tam jābūt uzdrukātam vai reljefi iespiestam pār karti. Kartes numurs var būt gan tās priekšpusē, gan aizmugurē.",
      title: "Kur atrast kartes numuru?",
    },
    done_btn: "Gatavs",
    done_btn_aria: "Atsākt skenēšanu",
    lighting: {
      details:
        "Izvairieties no tiešas spilgtas gaismas, jo tā atstarojas no kartes un var padarīt atsevišķas kartes daļas nesalasāmas. Ja nevarat salasīt datus uz kartes, tos neredzēs arī kamera.",
      title: "Uzmanieties no spilgtas gaismas",
    },
    next_btn: "Nākamais",
    occlusion: {
      details:
        "Pārliecinieties, ka kādu kartes daļu, arī apakšējās līnijas, neaizsedzat ar pirkstu. Uzmanieties arī no kartes laukus šķērsojošās hologrammas atspulgiem.",
      title: "Paturēt visus laukus redzamus",
    },
  },
  onboarding_modal: {
    aria: "Skenēšanas norādījumi",
    btn: "Sāciet skenēšanu",
    details:
      "Parasti kartes numuru veido 16 cipari. Tam jābūt uzdrukātam vai reljefi iespiestam pār karti. Pārliecinieties, ka apgaismojums ir pietiekams un visa kartes informācija ir labi redzama.",
    details_desktop:
      "Parasti kartes numuru veido 16 cipari. Tam jābūt uzdrukātam vai reljefi izspiestam uz kartes. Pārliecinieties, ka kameras objektīvs ir tīrs, karte ir labi apgaismota un visi kartes dati ir redzami.",
    title: "Vispirms noskenējiet kartes numuru",
  },
  sdk_aria: "Kartes skenēšanas ekrāns",
  timeout_modal: {
    cancel_btn: "Atcelt",
    details: "Nevar nolasīt karti. Lūdzu, mēģiniet vēlreiz.",
    retry_btn: "Mēģināt no jauna",
    title: "Skenēšana neizdevās",
  },
} as const;
