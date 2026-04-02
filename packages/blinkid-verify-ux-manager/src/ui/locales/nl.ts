/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for nl.
 */
export default {
  document_filtered_modal: {
    details: "Probeer een ander document te scannen.",
    title: "Document niet geaccepteerd",
  },
  document_not_recognized_modal: {
    details: "Scan de voorzijde van een ondersteund document.",
    title: "Document niet herkend",
  },
  feedback_messages: {
    blur_detected: "Houd het document en de telefoon stil",
    camera_angle_too_steep: "Houd het document parallel aan de telefoon",
    document_scanned_aria: "Succes! Document gescand",
    document_too_close_to_edge: "Beweeg verder weg",
    face_photo_not_fully_visible: "Houd foto gezicht volledig zichtbaar",
    flip_document: "Draai het document om",
    flip_to_back_side: "Draai het document om",
    front_side_scanned_aria: "Succes! Voorkant gescand",
    glare_detected:
      "Kantel of verplaats het document om de reflectie te verwijderen",
    keep_document_parallel: "Houd het document parallel aan het scherm",
    keep_document_still: "Houd het document en het toestel stil",
    move_closer: "Beweeg dichterbij",
    move_farther: "Beweeg verder weg",
    move_left: "Ga naar de pagina links",
    move_right: "Ga naar de pagina aan de rechterkant",
    move_top: "Ga naar de pagina bovenaan",
    occluded: "Het document volledig zichtbaar houden",
    scan_data_page: "Scan de pagina met gegevens van het document",
    scan_last_page_barcode: "Scan de barcode van de laatste pagina",
    scan_left_page: "Scan de linkerpagina",
    scan_right_page: "Scan de rechterpagina",
    scan_the_back_side: "Scan de achterkant van het document",
    scan_the_barcode: "Scan de barcode",
    scan_the_front_side: "Scan de voorzijde\\nvan een document",
    scan_top_page: "Scan de bovenste pagina",
    too_bright: "Ga na een plek met minder licht",
    too_dark: "Ga naar een lichtere plek",
    wrong_left: "Ga naar de linkerpagina",
    wrong_right: "Ga naar de rechterpagina",
    wrong_top: "Ga naar de bovenste pagina",
  },
  help_button: { aria_label: "Help", tooltip: "Hulp nodig?" },
  help_modal: {
    aria: "Hulp bij scannen",
    back_btn: "Terug",
    blur: {
      details:
        "Probeer de telefoon en het document tijdens het scannen stil te houden. Als u een van beide beweegt, kan de afbeelding wazig worden en kunnen gegevens op het document onleesbaar worden.",
      details_desktop:
        "Probeer het toestel en het document tijdens het scannen stil te houden. Als u een van beide beweegt, kan de afbeelding wazig worden en kunnen gegevens op het document onleesbaar worden.",
      title: "Beweeg niet tijdens het scannen",
    },
    camera_lens: {
      details:
        "Controleer dat er geen vlekken of stof op de lens van uw camera zitten. Een vuile lens zorgt ervoor dat de uiteindelijke afbeelding wazig wordt, waardoor de documentgegevens onleesbaar worden en de gegevens niet goed kunnen worden gescand.",
      title: "Maak de lens van uw camera schoon",
    },
    done_btn: "Gereed",
    done_btn_aria: "Verder met scannen",
    lighting: {
      details:
        "Vermijd direct fel licht, omdat dat vanaf het document weerspiegelt en delen van het document onleesbaar kan maken. Als u gegevens op het document niet kunt lezen, zijn ze voor de camera ook niet zichtbaar.",
      title: "Pas op voor fel licht",
    },
    next_btn: "Volgende",
    visibility: {
      details:
        "Zorg ervoor dat u onderdelen van het document niet afdekt met een vinger, dus ook niet de onderste regels. Waak ook voor hologramreflecties op de documentvelden.",
      title: "Zorg ervoor dat alle velden zichtbaar zijn",
    },
  },
  onboarding_modal: {
    aria: "Instructies voor scannen",
    btn: "Beginnen met scannen",
    details:
      "Zorg ervoor dat het document goed verlicht is. Alle velden op het document moeten onder het camerascherm zichtbaar zijn.",
    details_desktop:
      "Zorg ervoor dat de cameralens schoon is en het document goed verlicht is. Alle velden op het document moeten zichtbaar zijn op het camerascherm.",
    title: "Zorg ervoor dat alle gegevens zichtbaar zijn",
    title_desktop: "Voorbereiden om te scannen",
  },
  sdk_aria: "Scherm voor documenten scannen",
  timeout_modal: {
    cancel_btn: "Annuleren",
    details: "Kon het document niet lezen. Probeer het alstublieft opnieuw.",
    retry_btn: "Probeer opnieuw",
    title: "Scan niet gelukt",
  },
} as const;
