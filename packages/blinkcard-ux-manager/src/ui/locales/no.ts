/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for no.
 */
export default {
  feedback_messages: {
    blur_detected: "Hold kortet og telefonen i ro",
    blur_detected_desktop: "Hold kortet og enheten i ro",
    camera_angle_too_steep: "Hold kortet parallelt med telefonen",
    camera_angle_too_steep_desktop: "Hold kortet parallelt med skjermen",
    card_number_scanned: "Kortnummersiden er skannet",
    card_scanned: "Kortet er skannet",
    document_too_close_to_edge: "Flytt lenger bort",
    flip_card: "Snu kortet",
    flip_to_back_side: "Snu kortet",
    move_closer: "Flytt nærmere",
    move_farther: "Flytt lenger bort",
    occluded: "Hold kortet fullstendig synlig",
    scan_the_back_side: "Skann den andre siden av kortet",
    scan_the_front_side: "Skann kortnummeret",
  },
  help_button: { aria_label: "Hjelp", tooltip: "Trenger du hjelp?" },
  help_modal: {
    back_btn: "Tilbake",
    blur: {
      details:
        "Forsøk å holde telefonen og kortet i ro mens du skanner. Hvis de beveges, kan det føre til at bildet blir uskarpt og dataene i kortet blir uleselige.",
      details_desktop:
        "Prøv å holde enheten og kortet i ro når du skanner. Bevegelse kan gjøre bildet uklart eller at informasjonen på kortet blir uleselig.",
      title: "Stå i ro under skanningen",
    },
    camera_lens: {
      details:
        "Sjekk kameralinsen for flekker eller støv. En skitten linse gjør at det endelige bildet blir uklart, noe som gjør kortdetaljene uleselige og hindrer vellykket skanning av dataene.",
      title: "Rens kameralinsen din",
    },
    card_number: {
      details:
        "Kortnummeret er vanligvis et nummer på 16 siffer, men det kan bestå av 12 til 19 siffer. Det skal enten være trykt eller preget i opphøyde tall på kortet, og det kan stå på forsiden eller baksiden.",
      title: "Hvor er kortnummeret?",
    },
    done_btn: "Ferdig",
    lighting: {
      details:
        "Unngå direkte hardt lys fordi det gjenspeiles i kortet og kan føre til at deler av kortet blir uleselig. Hvis du ikke kan lese det som står på kortet, er det heller ikke synlig for kamera.",
      title: "Se opp for hardt lys",
    },
    next_btn: "Neste",
    occlusion: {
      details:
        "Sørg for at du ikke dekker til deler av kortet med en finger, inkludert bunnlinjene. Se også etter hologramrefleksjoner som kan forstyrre feltene på kortet.",
      title: "La alle feltene være synlige",
    },
  },
  onboarding_modal: {
    btn: "Start skanning",
    details:
      "Kortnummeret er vanligvis et nummer på 16 siffer. Det skal enten være trykt eller preget i opphøyde tall på kortet. Sørg for at kortet er godt opplyst og at alle detaljene er synlige.",
    details_desktop:
      "Kortnummeret består vanligvis av 16 siffer. Det skal enten være trykt eller preget i opphøyde tall på tvers av kortet. Sørg for at kameralinsen er ren, at kortet er godt belyst, og at alle detaljer er synlige.",
    title: "Skann kortnummeret først",
  },
  timeout_modal: {
    cancel_btn: "Avbryt",
    details: "Kan ikke lese kortet. Vennligst prøv igjen.",
    retry_btn: "Prøv på nytt",
    title: "Skanning mislyktes",
  },
} as const;
