/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for sv.
 */
export default {
  document_filtered_modal: {
    details: "Prova att skanna ett annat dokument.",
    title: "Dokumentet godkändes ej",
  },
  document_not_recognized_modal: {
    details: "Skanna framsidan på ett dokument som stöds.",
    title: "Dokumentet kändes inte igen",
  },
  error_modal: { cancel_btn: "Avbryt", retry_btn: "Försök igen" },
  feedback_messages: {
    blur_detected: "Håll dokumentet och mobilen stilla",
    camera_angle_too_steep: "Håll dokumentet parallellt med telefonen",
    document_scanned_aria: "Lyckades! Skannat dokument",
    document_too_close_to_edge: "Flytta längre bort",
    face_photo_not_fully_visible: "Håll fotot fullt synligt",
    flip_document: "Vänd på dokumentet",
    flip_to_back_side: "Vänd till baksidan",
    front_side_scanned_aria: "Lyckades! Framsidan skannad",
    glare_detected: "Luta eller flytta dokumentet för att ta bort reflektionen",
    keep_document_parallel: "Håll dokumentet parallellt med skärmen",
    keep_document_still: "Håll dokumentet och enheten stilla",
    keep_still: "Stå stilla",
    move_closer: "Flytta närmare",
    move_farther: "Flytta längre bort",
    move_left: "Flytta till den vänstra sidan",
    move_right: "Flytta till den högra sidan",
    move_top: "Flytta till översta sidan",
    occluded: "Håll dokumentet fullt synligt",
    scan_data_page: "Skanna dokumentets datasida",
    scan_last_page_barcode: "Läs av streckkoden från den sista sidan",
    scan_left_page: "Skanna den vänstra sidan",
    scan_right_page: "Skanna den högra sidan",
    scan_the_back_side: "Skanna dokumentets baksida",
    scan_the_barcode: "Skanna streckkoden",
    scan_the_barcode_side: "Skanna streckkodssidan av ett dokument",
    scan_the_front_side: "Skanna dokumentets framsida",
    scan_top_page: "Skanna den översta sidan",
    too_bright: "Flytta till mindre belyst plats",
    too_dark: "Flytta till mer belyst plats",
    wrong_left: "Flytta till den vänstra sidan",
    wrong_right: "Flytta till den högra sidan",
    wrong_top: "Flytta till den översta sidan",
  },
  help_button: { aria_label: "Hjälp", tooltip: "Behöver du hjälp?" },
  help_modal: {
    aria: "Hjälp med skanning",
    back_btn: "Tillbaka",
    barcode_only: {
      blur: {
        details:
          "Försök att hålla telefonen och streckkoden stilla medan du skannar. Att röra sig kan göra bilden suddig och göra streckkoden svår att läsa.",
        details_desktop:
          "Försök att stå stilla medan du skannar. Rörelse kan göra bilden suddig och göra streckkoden svår att läsa.",
        title: "Håll stilla medan du skannar",
        title_desktop: "Håll stilla medan du skannar",
      },
      camera_lens: {
        details_desktop:
          "Kontrollera kameralinsen för fläckar eller damm. En smutsig lins gör att den slutliga bilden blir suddig, vilket gör streckkoden oläslig och förhindrar att informationen skannas.",
        title_desktop: "Rengör kameralinsen",
      },
      lighting: {
        details:
          "Undvik direkt starkt ljus eftersom det kan skapa reflektioner på streckkoden och göra den svår att skanna. Om streckkoden inte är tydligt synlig för dig kanske kameran inte heller kan läsa den.",
        details_desktop:
          "Undvik direkt starkt ljus eftersom det kan skapa reflektioner på streckkoden och göra den svår att skanna. Om streckkoden inte är tydligt synlig för dig kanske kameran inte heller kan läsa den.",
        title: "Se upp för skarpt ljus",
        title_desktop: "Se upp för skarpt ljus",
      },
      visibility: {
        details:
          "Se till att du inte täcker delar av streckkoden med fingret. Se också upp för reflektioner som går över streckkoden och kan göra den oläslig.",
        details_desktop:
          "Se till att du inte täcker delar av streckkoden med fingret. Se också upp för reflektioner som går över streckkoden och kan göra den oläslig.",
        title: "Håll streckkoden synlig",
        title_desktop: "Håll streckkoden synlig",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "Försök att hålla telefonen och dokumentet stilla under skanningen. Om du rör någotdera kan bilden bli suddig och informationen på dokumentet oläslig.",
        details_desktop:
          "Försök att stå stilla medan du skannar. Rörelse kan göra bilden suddig och göra informationen i dokumentet oläslig.",
        title: "Håll stilla medan du skannar",
        title_desktop: "Håll stilla medan du skannar",
      },
      camera_lens: {
        details_desktop:
          "Kontrollera om kameralinsen är smutsig eller dammig. Om linsen är smutsig blir den färdiga bilden suddig, vilket innebär att kortuppgifterna blir oläsliga och skanningen misslyckas.",
        title_desktop: "Rengör kameralinsen",
      },
      lighting: {
        details:
          "Undvik starkt direktljus eftersom det reflekteras från dokumentet och kan göra delar av det oläsliga. Om du inte kan läsa informationen på dokumentet kommer den inte heller att synas för kameran.",
        details_desktop:
          "Undvik starkt direktljus eftersom det reflekteras från dokumentet och kan göra delar av det oläsliga. Om du inte kan läsa informationen på dokumentet kommer den inte heller att synas för kameran.",
        title: "Se upp för skarpt ljus",
        title_desktop: "Se upp för skarpt ljus",
      },
      visibility: {
        details:
          "Se till att du inte täcker delar av streckkoden med fingret. Se också upp för reflektioner som går över streckkoden och kan göra den oläslig.",
        details_desktop:
          "Se till att du inte täcker delar av streckkoden med fingret. Se också upp för reflektioner som går över streckkoden och kan göra den oläslig.",
        title: "Håll streckkoden synlig",
        title_desktop: "Håll streckkoden synlig",
      },
    },
    done_btn: "Klart",
    done_btn_aria: "Återuppta skanning",
    full_document: {
      blur: {
        details:
          "Försök att hålla telefonen och dokumentet stilla under skanningen. Om du rör någotdera kan bilden bli suddig och informationen på dokumentet oläslig.",
        details_desktop:
          "Försök att stå stilla medan du skannar. Rörelse kan göra bilden suddig och göra informationen i dokumentet oläslig.",
        title: "Håll stilla medan du skannar",
        title_desktop: "Håll stilla medan du skannar",
      },
      camera_lens: {
        details_desktop:
          "Kontrollera om kameralinsen är smutsig eller dammig. Om linsen är smutsig blir den färdiga bilden suddig, vilket innebär att kortuppgifterna blir oläsliga och skanningen misslyckas.",
        title_desktop: "Rengör kameralinsen",
      },
      lighting: {
        details:
          "Undvik starkt direktljus eftersom det reflekteras från dokumentet och kan göra delar av det oläsliga. Om du inte kan läsa informationen på dokumentet kommer den inte heller att synas för kameran.",
        details_desktop:
          "Undvik starkt direktljus eftersom det reflekteras från dokumentet och kan göra delar av det oläsliga. Om du inte kan läsa informationen på dokumentet kommer den inte heller att synas för kameran.",
        title: "Se upp för skarpt ljus",
        title_desktop: "Se upp för skarpt ljus",
      },
      visibility: {
        details:
          "Se till att du inte täcker delar av dokumentet med fingret, inklusive de nedre raderna. Se också upp för hologramreflektioner som löper över dokumentets fält.",
        details_desktop:
          "Se till att du inte täcker delar av dokumentet med fingret, inklusive de nedre raderna. Se också upp för hologramreflektioner som löper över dokumentets fält.",
        title: "Håll alla fält synliga",
        title_desktop: "Håll alla fält synliga",
      },
    },
    next_btn: "Nästa",
  },
  onboarding_modal: {
    aria: "Skanningsinstruktioner",
    barcode_only: {
      details:
        "Leta efter en streckkod (en serie svarta linjer eller en fyrkantig kod). Rikta kameran mot den och håll den stilla – skanningen sker automatiskt.",
      details_desktop:
        "Leta efter en streckkod (en serie svarta linjer eller en fyrkantig kod). Se till att hålla kameralinsen ren och streckkoden väl upplyst.",
      title: "Leta reda på och skanna streckkoden",
      title_desktop: "Rengör linsen och leta reda på streckkoden",
    },
    btn: "Börja skanna",
    document_with_barcode: {
      details:
        "Olika typer av ID-kort kan ha olika streckkodsformat och placeringar. Titta på fram- och baksidan av ID-korten för att se om det finns en streckkod.",
      details_desktop:
        "Kontrollera fram- och baksidan av ID-kortet för en streckkod. Se till att hålla kameralinsen ren och dokumentet väl upplyst.",
      title: "Leta reda på streckkoden på ID-kortet",
      title_desktop: "Rengör linsen och leta reda på streckkoden",
    },
    full_document: {
      details:
        "Se till att dokumentet är väl belyst. Alla fält i dokumentet ska synas på kameraskärmen.",
      details_desktop:
        "Se till att hålla kameralinsen ren och dokumentet väl belyst. Alla fält i dokumentet ska synas på kameraskärmen.",
      title: "Håll alla uppgifter synliga",
      title_desktop: "Förbered skanningen",
    },
  },
  sdk_aria: "Skärm för dokumentskanning",
  timeout_modal: {
    details: "Det gick inte att läsa dokumentet. Försök igen.",
    title: "Skanningen misslyckades",
  },
} as const;
