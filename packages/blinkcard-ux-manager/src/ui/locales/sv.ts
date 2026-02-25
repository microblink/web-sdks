/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for sv.
 */
export default {
  feedback_messages: {
    blur_detected: "Håll kortet och telefonen stilla",
    blur_detected_desktop: "Håll kortet och enheten stilla",
    camera_angle_too_steep: "Håll kortet parallellt med telefonen",
    camera_angle_too_steep_desktop: "Håll kortet parallellt med skärmen",
    card_number_scanned: "Lyckades! Kortets nummersida skannat",
    card_scanned: "Lyckades! Kort skannat",
    document_too_close_to_edge: "Flytta längre bort",
    flip_card: "Vänd på kortet",
    flip_to_back_side: "Vänd på kortet",
    move_closer: "Flytta närmare",
    move_farther: "Flytta längre bort",
    occluded: "Håll kortet helt synligt",
    scan_the_back_side: "Läs av den andra sidan av kortet",
    scan_the_front_side: "Skanna kortnumret",
  },
  help_button: { aria_label: "Hjälp", tooltip: "Behöver du hjälp?" },
  help_modal: {
    aria: "Hjälp med skanning",
    back_btn: "Tillbaka",
    blur: {
      details:
        "Försök att hålla telefonen och kortet stilla under skanningen. Om du rör någotdera kan bilden bli suddig och informationen på kortet oläslig.",
      details_desktop:
        "Försök att hålla enheten och kortet stilla under skanningen. Om någon av dem rör sig kan bilden bli suddig och göra kortuppgifterna oläsliga.",
      title: "Håll stilla medan du skannar",
    },
    camera_lens: {
      details:
        "Kontrollera om kameralinsen är smutsig eller dammig. En smutsig lins gör att den slutliga bilden blir suddig, vilket gör kortuppgifterna oläsliga och förhindrar att skanningen lyckas.",
      title: "Rengör kameralinsen",
    },
    card_number: {
      details:
        "Kortnumret består oftast av 16 siffror, men det kan bestå av mellan 12 och 19 siffror. Numret är antingen tryckt eller präglat i upphöjda siffror på kortets fram- eller baksida.",
      title: "Var finns kortnumret?",
    },
    done_btn: "Klart",
    done_btn_aria: "Återuppta skanning",
    lighting: {
      details:
        "Undvik starkt direktljus eftersom det reflekteras från kortet och kan göra delar av det oläsliga. Om du inte kan läsa informationen på kortet kommer den inte heller att synas för kameran.",
      title: "Se upp för skarpt ljus",
    },
    next_btn: "Nästa",
    occlusion: {
      details:
        "Se till att du inte täcker delar av kortet med fingret, inklusive de nedre raderna. Se också upp för hologramreflektioner som löper över kortets fält.",
      title: "Håll alla fält synliga",
    },
  },
  onboarding_modal: {
    aria: "Skanningsinstruktioner",
    btn: "Börja skanna",
    details:
      "Kortnumret består oftast av 16 siffror. Det är antingen tryckt eller präglat i upphöjda siffror på kortets fram- eller baksida. Se till att kortet är ordentligt upplyst och att alla detaljer syns.",
    details_desktop:
      "Kortnumret är vanligtvis ett 16-siffrigt nummer. Det ska vara tryckt eller präglat med upphöjda siffror på kortet. Se till att kameralinsen är ren, att kortet är väl belyst och att alla uppgifter är synliga.",
    title: "Skanna kortnumret först",
  },
  sdk_aria: "Skärm för kortskanning",
  timeout_modal: {
    cancel_btn: "Avbryt",
    details: "Det gick inte att läsa kortet. Försök igen.",
    retry_btn: "Försök igen",
    title: "Skanningen misslyckades",
  },
} as const;
