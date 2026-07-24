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
  error_modal: { cancel_btn: "Atcelt", retry_btn: "Mēģināt no jauna" },
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
    keep_still: "Nekustieties",
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
    scan_the_barcode_side: "Skenējiet dokumenta svītrkoda pusi",
    scan_the_front_side: "Skenēt dokumenta priekšpusi",
    scan_the_mrz_side: "Noskenējiet to dokumenta pusi, kurā ir MRZ",
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
    barcode_only: {
      blur: {
        details:
          "Skenēšanas laikā nekustiniet tālruni un svītrkodu. Pretējā gadījumā attēls var būt izplūdis, un svītrkodu būs grūti nolasīt.",
        details_desktop:
          "Skenēšanas laikā centieties nekustēties. Pretējā gadījumā attēls var būt izplūdis, un svītrkodu būs grūti nolasīt.",
        title: "Skenēšanas laikā turēt nekustīgu",
        title_desktop: "Skenēšanas laikā turēt nekustīgu",
      },
      camera_lens: {
        details_desktop:
          "Pārbaudiet, vai uz kameras objektīva nav traipu vai putekļu. Netīrs objektīvs izraisa galīgā attēla izplūšanu, padarot svītrkodu nelasāmu un neļaujot sekmīgi skenēt datus.",
        title_desktop: "Notīriet kameras objektīvu",
      },
      lighting: {
        details:
          "Izvairieties no tiešas spilgtas gaismas, jo tā var radīt atspīdumu uz svītrkoda, un to būs grūti skenēt. Ja jūs skaidri nesaredzat svītrkodu, arī kamera to nevarēs nolasīt.",
        details_desktop:
          "Izvairieties no tiešas spilgtas gaismas, jo tā var radīt atspīdumu uz svītrkoda, un to būs grūti skenēt. Ja jūs skaidri nesaredzat svītrkodu, arī kamera to nevarēs nolasīt.",
        title: "Uzmanieties no spilgtas gaismas",
        title_desktop: "Uzmanieties no spilgtas gaismas",
      },
      visibility: {
        details:
          "Pārliecinieties, ka kādu svītrkoda daļu neaizsedzat ar pirkstu. Nodrošiniet arī, lai uz svītrkoda nebūtu atspīduma, jo šādā gadījumā svītrkods nebūs nolasāms.",
        details_desktop:
          "Pārliecinieties, ka kādu svītrkoda daļu neaizsedzat ar pirkstu. Nodrošiniet arī, lai uz svītrkoda nebūtu atspīduma, jo šādā gadījumā svītrkods nebūs nolasāms.",
        title: "Turiet dokumentu tā, lai svītrkods būtu redzams",
        title_desktop: "Turiet dokumentu tā, lai svītrkods būtu redzams",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "Skenēšanas laikā mēģiniet tālruni un dokumentu turēt nekustīgu. Pārvietojot vienu vai otru, attēls var būt izplūdis, un dokumenta dati var kļūt nesalasāmi.",
        details_desktop:
          "Skenēšanas laikā nekustieties. Pretējā gadījumā attēls var būt izplūdis, un dokumenta dati var kļūt nesalasāmi.",
        title: "Skenēšanas laikā turēt nekustīgu",
        title_desktop: "Skenēšanas laikā turēt nekustīgu",
      },
      camera_lens: {
        details_desktop:
          "Pārbaudiet, vai uz kameras objektīva nav traipu vai putekļu. Ar netīru objektīvu uzņemts attēls būs izplūdis, un informācija dokumentā nebūs salasāma un noskenējama.",
        title_desktop: "Notīriet kameras objektīvu",
      },
      lighting: {
        details:
          "Izvairieties no tiešas spilgtas gaismas, jo tā atstarojas no dokumenta un var padarīt atsevišķas dokumenta daļas nelasāmas. Ja nevarat izlasīt dokumentā esošos datus, tos neredz arī kamera.",
        details_desktop:
          "Izvairieties no tiešas spilgtas gaismas, jo tā atstarojas no dokumenta un var padarīt atsevišķas dokumenta daļas nelasāmas. Ja nevarat izlasīt dokumentā esošos datus, tos neredz arī kamera.",
        title: "Uzmanieties no spilgtas gaismas",
        title_desktop: "Uzmanieties no spilgtas gaismas",
      },
      visibility: {
        details:
          "Pārliecinieties, ka kādu svītrkoda daļu neaizsedzat ar pirkstu. Nodrošiniet arī, lai uz svītrkoda nebūtu atspīduma, jo šādā gadījumā svītrkods nebūs nolasāms.",
        details_desktop:
          "Pārliecinieties, ka kādu svītrkoda daļu neaizsedzat ar pirkstu. Nodrošiniet arī, lai uz svītrkoda nebūtu atspīduma, jo šādā gadījumā svītrkods nebūs nolasāms.",
        title: "Turiet dokumentu tā, lai svītrkods būtu redzams",
        title_desktop: "Turiet dokumentu tā, lai svītrkods būtu redzams",
      },
    },
    document_with_mrz: {
      blur: {
        details:
          "Skenēšanas laikā mēģiniet tālruni un dokumentu turēt nekustīgu. Pārvietojot vienu vai otru, attēls var būt izplūdis, un dokumenta dati var kļūt nesalasāmi.",
        details_desktop:
          "Skenēšanas laikā nekustieties. Pretējā gadījumā attēls var būt izplūdis, un dokumenta dati var kļūt nesalasāmi.",
        title: "Skenēšanas laikā turēt nekustīgu",
        title_desktop: "Skenēšanas laikā turēt nekustīgu",
      },
      camera_lens: {
        details_desktop:
          "Pārbaudiet, vai uz kameras objektīva nav traipu vai putekļu. Ar netīru objektīvu uzņemts attēls būs izplūdis, un informācija dokumentā nebūs salasāma un noskenējama.",
        title_desktop: "Notīriet kameras objektīvu",
      },
      lighting: {
        details:
          "Izvairieties no tiešas spilgtas gaismas, jo tā atstarojas no dokumenta un var padarīt atsevišķas dokumenta daļas nelasāmas. Ja nevarat izlasīt dokumentā esošos datus, tos neredz arī kamera.",
        details_desktop:
          "Izvairieties no tiešas spilgtas gaismas, jo tā atstarojas no dokumenta un var padarīt atsevišķas dokumenta daļas nelasāmas. Ja nevarat izlasīt dokumentā esošos datus, tos neredz arī kamera.",
        title: "Uzmanieties no spilgtas gaismas",
        title_desktop: "Uzmanieties no spilgtas gaismas",
      },
      visibility: {
        details:
          "Pārliecinieties, ka neaizsedzat daļu MRZ ar pirkstu. Pārbaudiet arī to, vai MRZ neietekmē atspīdumi, kas var neļaut to nolasīt.",
        details_desktop:
          "Pārliecinieties, ka neaizsedzat daļu MRZ ar pirkstu. Pārbaudiet arī to, vai MRZ neietekmē atspīdumi, kas var neļaut to nolasīt.",
        title: "Turiet dokumentu tā, lai būtu redzama MRZ",
        title_desktop: "",
      },
    },
    done_btn: "Gatavs",
    done_btn_aria: "Atsākt skenēšanu",
    full_document: {
      blur: {
        details:
          "Skenēšanas laikā mēģiniet tālruni un dokumentu turēt nekustīgu. Pārvietojot vienu vai otru, attēls var būt izplūdis, un dokumenta dati var kļūt nesalasāmi.",
        details_desktop:
          "Skenēšanas laikā nekustieties. Pretējā gadījumā attēls var būt izplūdis, un dokumenta dati var kļūt nesalasāmi.",
        title: "Skenēšanas laikā turēt nekustīgu",
        title_desktop: "Skenēšanas laikā turēt nekustīgu",
      },
      camera_lens: {
        details_desktop:
          "Pārbaudiet, vai uz kameras objektīva nav traipu vai putekļu. Ar netīru objektīvu uzņemts attēls būs izplūdis, un informācija dokumentā nebūs salasāma un noskenējama.",
        title_desktop: "Notīriet kameras objektīvu",
      },
      lighting: {
        details:
          "Izvairieties no tiešas spilgtas gaismas, jo tā atstarojas no dokumenta un var padarīt atsevišķas dokumenta daļas nelasāmas. Ja nevarat izlasīt dokumentā esošos datus, tos neredz arī kamera.",
        details_desktop:
          "Izvairieties no tiešas spilgtas gaismas, jo tā atstarojas no dokumenta un var padarīt atsevišķas dokumenta daļas nelasāmas. Ja nevarat izlasīt dokumentā esošos datus, tos neredz arī kamera.",
        title: "Uzmanieties no spilgtas gaismas",
        title_desktop: "Uzmanieties no spilgtas gaismas",
      },
      visibility: {
        details:
          "Raugieties, lai neaizsegtu dokumenta daļas ar pirkstu, ieskaitot apakšējās līnijas. Uzmanieties arī no hologrammas atspulgiem virs dokumenta laukiem.",
        details_desktop:
          "Raugieties, lai neaizsegtu dokumenta daļas ar pirkstu, ieskaitot apakšējās līnijas. Uzmanieties arī no hologrammas atspulgiem virs dokumenta laukiem.",
        title: "Paturēt visus laukus redzamus",
        title_desktop: "Paturēt visus laukus redzamus",
      },
    },
    next_btn: "Nākamais",
  },
  onboarding_modal: {
    aria: "Skenēšanas norādījumi",
    barcode_only: {
      details:
        "Meklējiet svītrkodu (vairākas melnas līnijas vai kvadrātkodu). Vērsiet kameru pret to un nekustieties — skenēšana notiks automātiski.",
      details_desktop:
        "Meklējiet svītrkodu (vairākas melnas līnijas vai kvadrātkodu). Pārliecinieties, ka kameras objektīvs ir tīrs, un svītrkods ir labi apgaismots.",
      title: "Atrodiet un skenējiet svītrkodu",
      title_desktop: "Notīriet objektīvu un atrodiet svītrkodu",
    },
    btn: "Sāciet skenēšanu",
    document_with_barcode: {
      details:
        "Dažādiem dokumentiem var būt dažādi svītrkoda formāti un atrašanās vietas. Lai atrastu svītrkodu, aplūkojiet dokumenta priekšpusi un aizmuguri.",
      details_desktop:
        "Lai atrastu svītrkodu, pārbaudiet dokumenta priekšpusi un aizmuguri. Pārliecinieties, ka kameras objektīvs ir tīrs un dokuments ir labi apgaismots.",
      title: "Atrodiet dokumentā svītrkodu",
      title_desktop: "Notīriet objektīvu un atrodiet svītrkodu",
    },
    document_with_mrz: {
      details:
        "Dokumenta priekšpuses vai aizmugures apakšdaļā jūs atradīsiet garu virkni rakstzīmju, kas ir izvietota 2–3 rindās un sadalīta ar bultiņām (<< vai >>).",
      details_desktop:
        "Lai atrastu MRZ, pārbaudiet dokumenta priekšpusi un aizmuguri. Meklējiet dokumenta apakšdaļā 2-3 rindas rakstzīmju un bultiņu simbolu  (<<). Pārliecinieties, ka kameras objektīvs ir tīrs un dokuments ir labi apgaismots.",
      title: "Atrodiet dokumentā MRZ",
      title_desktop: "Notīriet kameras objektīvu un atrodiet MRZ",
    },
    full_document: {
      details:
        "Pārliecinieties, vai dokuments ir labi apgaismots. Kameras ekrānā jābūt redzamiem visiem dokumenta laukiem.",
      details_desktop:
        "Pārliecinieties, ka kameras objektīvs ir tīrs un dokuments ir labi apgaismots. Kameras ekrānā jābūt redzamiem visiem dokumenta laukiem.",
      title: "Paturēt redzamu visu detalizēto informāciju",
      title_desktop: "Sagatavojieties skenēšanai",
    },
  },
  sdk_aria: "Dokumenta skenēšanas ekrāns",
  timeout_modal: {
    details:
      "Pārliecinieties, ka dokuments ir labi apgaismots, pilnībā redzams un to neietekmē atspīdums.",
    details_desktop:
      "Pārliecinieties, ka kameras objektīvs ir tīrs un dokuments ir pilnībā redzams, fokusā un labi apgaismots.",
    title: "Nevar nolasīt dokumentu",
  },
} as const;
