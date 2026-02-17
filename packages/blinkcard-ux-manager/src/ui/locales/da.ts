/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for da.
 */
export default {
  feedback_messages: {
    blur_detected: "Hold kort og telefon stille",
    blur_detected_desktop: "Hold kort og enhed stille",
    camera_angle_too_steep: "Hold kortet parallelt med telefonen",
    camera_angle_too_steep_desktop: "Hold kortet parallelt med skærmen",
    card_number_scanned: "Det lykkedes! Siden med kortnummeret er scannet.",
    card_scanned: "Det lykkedes! Kortet er scannet.",
    document_too_close_to_edge: "Flyt længere væk",
    flip_card: "Vend kortet om",
    flip_to_back_side: "Vend kortet om",
    move_closer: "Flyt tættere på",
    move_farther: "Flyt længere væk",
    occluded: "Hold hele kortet synligt",
    scan_the_back_side: "Scan den anden side af kortet",
    scan_the_front_side: "Scan kortnummeret",
  },
  help_button: { aria_label: "Hjælp", tooltip: "Brug for hjælp?" },
  help_modal: {
    back_btn: "Tilbage",
    blur: {
      details:
        "Prøv at holde telefonen og kortet stille, mens du scanner. Hvis du bevæger dig, kan billedet blive sløret og dataene på kortet blive ulæselige.",
      details_desktop:
        "Prøv at holde enheden og kortet stille, mens du scanner. Bevægelse af dem kan sløre billedet og gøre dataene på kortet ulæselige.",
      title: "Undgå bevægelse, mens du scanner",
    },
    camera_lens: {
      details:
        "Tjek din kameralinse for smuds eller støv. En snavset linse gør det endelige billede sløret, hvilket gør kortoplysningerne ulæselige, hvilket forhindrer scanningen af dataene i at lykkes.",
      title: "Rens din kameralinse",
    },
    card_number: {
      details:
        "Kortnummeret er normalt et 16-cifret nummer, selvom det kan have mellem 12 og 19 cifre. Det skal enten være trykt eller præget med hævede tal på tværs af kortet. Det kan være på forsiden eller bagsiden af dit kort.",
      title: "Hvor er kortnummeret?",
    },
    done_btn: "Færdig",
    lighting: {
      details:
        "Undgå direkte skarpt lys, da det reflekteres fra kortet og kan gøre dele af kortet ulæselige. Hvis du ikke kan læse dataene på kortet, vil de heller ikke være synlige for kameraet.",
      title: "Vær opmærksom på skarpt lys",
    },
    next_btn: "Næste",
    occlusion: {
      details:
        "Sørg for, at du ikke dækker nogen dele af kortet med en finger, inklusive de nederste linjer. Vær desuden opmærksom på hologramrefleksioner, der går henover kortets felter.",
      title: "Hold alle felterne synlige",
    },
  },
  onboarding_modal: {
    btn: "Start scanning",
    details:
      "Kortnummeret er normalt et 16-cifret nummer. Det skal enten være trykt eller præget med hævede tal på tværs af kortet. Sørg for, at kortet er godt oplyst, og at alle detaljer er synlige.",
    details_desktop:
      "Kortnummeret er normalt et 16-cifret nummer. Det er enten trykt eller præget som tal på tværs af kortet. Sørg for, at din kameralinse er ren, at kortet er ordentligt oplyst, og at alle detaljerne er synlige.",
    title: "Scan først kortnummeret",
  },
  timeout_modal: {
    cancel_btn: "Annuller",
    details: "Kan ikke læse kortet. Prøv igen.",
    retry_btn: "Prøv igen",
    title: "Scanning mislykkedes",
  },
} as const;
