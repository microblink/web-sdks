/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for no.
 */
export default {
  document_filtered_modal: {
    details: "Forsøk å skanne et annet dokument.",
    title: "Dokumentet godtas ikke",
  },
  document_not_recognized_modal: {
    details: "Skann forsiden av et støttet dokument.",
    title: "Dokument ikke gjenkjent",
  },
  feedback_messages: {
    blur_detected: "Hold dokumentet og telefonen i ro",
    camera_angle_too_steep: "La dokumentet være parallelt med telefonen",
    document_scanned_aria: "Skanning av dokument vellykket!",
    document_too_close_to_edge: "Flytt lenger bort",
    face_photo_not_fully_visible: "La ansiktsfoto være helt synlig",
    flip_document: "Snu dokumentet",
    flip_to_back_side: "Snu til baksiden",
    front_side_scanned_aria: "Skanning av forsiden vellykket!",
    glare_detected: "Vipp eller flytt dokumentet for å fjerne refleksjon",
    keep_document_parallel: "Hold dokumentet parallelt med skjermen",
    keep_document_still: "Hold dokumentet og enheten i ro",
    move_closer: "Flytt nærmere",
    move_farther: "Flytt lenger bort",
    move_left: "Flytt til siden til venstre",
    move_right: "Flytt til siden til høyre",
    move_top: "Flytt til den øverste siden",
    occluded: "La dokumentet være helt synlig.",
    scan_data_page: "Skann datasiden av dokumentet",
    scan_last_page_barcode: "Skann strekkoden på siste side",
    scan_left_page: "Skann den venstre siden",
    scan_right_page: "Skann den høyre siden",
    scan_the_back_side: "Skann baksiden av dokumentet",
    scan_the_barcode: "Skann strekkoden",
    scan_the_front_side: "Skann forsiden av dokumentet",
    scan_top_page: "Skann den øverste siden",
    too_bright: "Flytt til et sted med mindre belysning",
    too_dark: "Flytt til et lysere sted",
    wrong_left: "Flytt til den venstre siden",
    wrong_right: "Flytt til den høyre siden",
    wrong_top: "Flytt til toppen av siden",
  },
  help_button: { aria_label: "Hjelp", tooltip: "Trenger du hjelp?" },
  help_modal: {
    aria: "Hjelp med skanning",
    back_btn: "Tilbake",
    blur: {
      details:
        "Forsøk å holde telefonen og dokumentet i ro under skanningen. Å bevege dem kan føre til at bildet blir uskarpt og dataene i dokumentet uleselige.",
      details_desktop:
        "Prøv å holde enheten og dokumentet i ro når du skanner. Bevegelse kan gjøre bildet uskarpt og føre til at dataene i dokumentet ikke kan leses.",
      title: "Stå i ro under skanningen",
    },
    camera_lens: {
      details:
        "Sjekk om det er støv eller flekker på kameralinsen. En skitten linse gjør at bildet blir uskarpt, noe som fører til at informasjonen i dokumentet blir uleselig og ikke skannes ordentlig.",
      title: "Rens kameralinsen din",
    },
    done_btn: "Ferdig",
    done_btn_aria: "Fortsett å skanne",
    lighting: {
      details:
        "Unngå direkte hardt lys fordi det gjenspeiles i dokumentet og kan føre til at deler av dokumentet blir uleselig. Hvis ikke du kan lese det som står i dokumentet, blir det heller ikke synlig for kamera.",
      title: "Se opp for hardt lys",
    },
    next_btn: "Neste",
    visibility: {
      details:
        "Sørg for at du ikke dekker til deler av dokumentet med en finger, inkludert bunnlinjene. Se også etter hologramrefleksjoner som kan forstyrre feltene i dokumentet.",
      title: "La alle feltene være synlige",
    },
  },
  onboarding_modal: {
    aria: "Slik skanner du",
    btn: "Start skanning",
    details:
      "Sørg for at dokumentet er godt opplyst. Alle feltene i dokumentet skal være synlige på kameraskjermen.",
    details_desktop:
      "Sørg for at kameralinsen er ren og at dokumentet er godt opplyst. Alle feltene i dokumentet skal være synlige på skjermen.",
    title: "La alle detaljene være synlige",
    title_desktop: "Gjør deg klar til å skanne",
  },
  sdk_aria: "Dokumentskanningside",
  timeout_modal: {
    cancel_btn: "Avbryt",
    details: "Kunne ikke lese dokumentet. Prøv igjen.",
    retry_btn: "Prøv på nytt",
    title: "Skanning mislyktes",
  },
} as const;
