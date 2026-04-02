/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for lv.
 */
export default {
  document_filtered_modal: {
    details: "Mēģiniet skenēt citu dokumentu.",
    title: "Dokuments nav pieņemts",
  },
  document_not_recognized_modal: {
    details: "Skenējiet atbalstītā dokumenta priekšpusi.",
    title: "Dokuments nav atpazīts",
  },
  feedback_messages: {
    blur_detected: "Turēt dokumentu un tālruni nekustīgu",
    camera_angle_too_steep: "Turēt dokumentu paralēli tālrunim",
    document_scanned_aria: "Dokuments noskenēts veiksmīgi!",
    document_too_close_to_edge: "Pārvietot tālāk",
    face_photo_not_fully_visible: "Turēt sejas fotoattēlu pilnībā redzamu",
    flip_document: "Apvērst dokumentu",
    flip_to_back_side: "Apvērst uz aizmuguri",
    front_side_scanned_aria: "Priekšpuse noskenēta veiksmīgi!",
    glare_detected: "Sasvērt vai pārvietot dokumentu, lai novērstu atspīdumu",
    keep_document_parallel: "Turiet dokumentu paralēli ekrānam",
    keep_document_still: "Nekustiniet dokumentu un ierīci",
    move_closer: "Pārvietot tuvāk",
    move_farther: "Pārvietot tālāk",
    move_left: "Pārvietot uz kreiso lapu",
    move_right: "Pārvietot uz labo lapu",
    move_top: "Pārvietot uz augšējo lapu",
    occluded: "Turēt dokumentu pilnībā redzamu",
    scan_data_page: "Skenēt dokumenta datu lapu",
    scan_last_page_barcode: "Skenēt svītrkodu no pēdējās lapas",
    scan_left_page: "Skenēt kreiso lapu",
    scan_right_page: "Skenēt labo lapu",
    scan_the_back_side: "Skenēt dokumenta aizmuguri",
    scan_the_barcode: "Skenēt svītrkodu",
    scan_the_front_side: "Skenēt dokumenta priekšpusi",
    scan_top_page: "Skenēt augšējo lapu",
    too_bright: "Pārvietot uz vietu ar mazāku apgaismojumu",
    too_dark: "Pārvietot uz vietu ar spilgtāku apgaismojumu",
    wrong_left: "Pārvietot uz kreiso lapu",
    wrong_right: "Pārvietot uz labo lapu",
    wrong_top: "Pārvietot uz augšējo lapu",
  },
  help_button: { aria_label: "Palīdzība", tooltip: "Vai vajadzīga palīdzība?" },
  help_modal: {
    aria: "Palīdzība skenēšanas procesā",
    back_btn: "Atpakaļ",
    blur: {
      details:
        "Skenēšanas laikā mēģiniet tālruni un dokumentu turēt nekustīgu. Pārvietojot vienu vai otru, attēls var būt izplūdis, un dokumenta dati var kļūt nesalasāmi.",
      details_desktop:
        "Skenēšanas laikā centieties nekustināt ierīci un dokumentu. Pretējā gadījumā attēls var būt izplūdis, un dokumenta dati var kļūt nesalasāmi.",
      title: "Skenēšanas laikā turēt nekustīgu",
    },
    camera_lens: {
      details:
        "Pārbaudiet, vai uz kameras objektīva nav traipu vai putekļu. Ar netīru objektīvu uzņemts attēls būs izplūdis, un informācija dokumentā nebūs salasāma un noskenējama.",
      title: "Notīriet kameras objektīvu",
    },
    done_btn: "Gatavs",
    done_btn_aria: "Atsākt skenēšanu",
    lighting: {
      details:
        "Izvairieties no tiešas spilgtas gaismas, jo tā atstarojas no dokumenta un var padarīt atsevišķas dokumenta daļas nelasāmas. Ja nevarat izlasīt dokumentā esošos datus, tos neredz arī kamera.",
      title: "Uzmanieties no spilgtas gaismas",
    },
    next_btn: "Nākamais",
    visibility: {
      details:
        "Raugieties, lai neaizsegtu dokumenta daļas ar pirkstu, ieskaitot apakšējās līnijas. Uzmanieties arī no hologrammas atspulgiem virs dokumenta laukiem.",
      title: "Paturēt visus laukus redzamus",
    },
  },
  onboarding_modal: {
    aria: "Skenēšanas norādījumi",
    btn: "Sāciet skenēšanu",
    details:
      "Pārliecinieties, vai dokuments ir labi apgaismots. Kameras ekrānā jābūt redzamiem visiem dokumenta laukiem.",
    details_desktop:
      "Pārliecinieties, ka kameras objektīvs ir tīrs un dokuments ir labi apgaismots. Kameras ekrānā jābūt redzamiem visiem dokumenta laukiem.",
    title: "Paturēt redzamu visu detalizēto informāciju",
    title_desktop: "Sagatavojieties skenēšanai",
  },
  sdk_aria: "Dokumenta skenēšanas ekrāns",
  timeout_modal: {
    cancel_btn: "Atcelt",
    details: "Nevar nolasīt dokumentu. Lūdzu, mēģiniet vēlreiz.",
    retry_btn: "Mēģināt no jauna",
    title: "Skenēšana neizdevās",
  },
} as const;
