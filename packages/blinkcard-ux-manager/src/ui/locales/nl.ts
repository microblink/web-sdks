/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for nl.
 */
export default {
  feedback_messages: {
    blur_detected: "Houd de kaart en de telefoon stil",
    blur_detected_desktop: "Houd de kaart en het toestel stil",
    camera_angle_too_steep: "Kaart parallel aan telefoon houden",
    camera_angle_too_steep_desktop: "Kaart parallel aan scherm houden",
    card_number_scanned: "Geslaagd! Kaartnummerzijde gescand.",
    card_scanned: "Geslaagd! Kaart gescand.",
    document_too_close_to_edge: "Beweeg verder weg",
    flip_card: "Draai de kaart om",
    flip_to_back_side: "Draai de kaart om",
    move_closer: "Beweeg dichterbij",
    move_farther: "Beweeg verder weg",
    occluded: "Houd de kaart volledig zichtbaar",
    scan_the_back_side: "Scan de andere kant van de kaart",
    scan_the_front_side: "Scan het kaartnummer",
  },
  help_button: { aria_label: "Help", tooltip: "Hulp nodig?" },
  help_modal: {
    aria: "Hulp bij scannen",
    back_btn: "Terug",
    blur: {
      details:
        "Probeer de telefoon en de kaart tijdens het scannen stil te houden. Als u een van beide beweegt, kan de afbeelding wazig worden en kunnen gegevens op de kaart onleesbaar worden.",
      details_desktop:
        "Probeer het toestel en de kaart tijdens het scannen stil te houden. Als u een van beide beweegt, kan de afbeelding wazig worden en kunnen gegevens op de kaart onleesbaar worden.",
      title: "Beweeg niet tijdens het scannen",
    },
    camera_lens: {
      details:
        "Controleer dat er geen vlekken of stof op de lens van uw camera zitten. Een vuile lens zorgt ervoor dat de uiteindelijke afbeelding wazig wordt, waardoor de kaartgegevens onleesbaar worden en de gegevens niet goed kunnen worden gescand.",
      title: "Maak de lens van uw camera schoon",
    },
    card_number: {
      details:
        "Het kaartnummer bestaat in de regel uit 16 cijfers, maar kan ook uit 12 tot 19 cijfers bestaan. Het nummer is ofwel gedrukt of in reliëf in verhoogde cijfers op de kaart aangebracht. Het nummer kan op de voor- of achterkant van uw kaart staan.",
      title: "Waar staat het kaartnummer?",
    },
    done_btn: "Gereed",
    done_btn_aria: "Verder met scannen",
    lighting: {
      details:
        "Vermijd direct fel licht, omdat dat vanaf de kaart weerspiegelt en delen van de kaart onleesbaar kan maken. Als u gegevens op de kaart niet kunt lezen, zijn ze voor de camera ook niet zichtbaar.",
      title: "Pas op voor fel licht",
    },
    next_btn: "Volgende",
    occlusion: {
      details:
        "Zorg ervoor dat u onderdelen van de kaart niet afdekt met een vinger, dus ook niet de onderste regels. Waak ook voor hologramreflecties op de kaartvelden.",
      title: "Zorg ervoor dat alle velden zichtbaar zijn",
    },
  },
  onboarding_modal: {
    aria: "Instructies voor scannen",
    btn: "Beginnen met scannen",
    details:
      "Het kaartnummer bestaat in de regel uit 16 cijfers. Het nummer is ofwel gedrukt of in reliëf in verhoogde cijfers op de kaart aangebracht. Zorg ervoor dat de kaart goed wordt verlicht en dat alle details zichtbaar zijn.",
    details_desktop:
      "Het kaartnummer bestaat in de regel uit 16 cijfers. Het nummer is ofwel gedrukt of in reliëf in verhoogde cijfers op de kaart aangebracht. Zorg ervoor dat de cameralens goed schoon is, de kaart goed wordt belicht en dat alle details zichtbaar zijn.",
    title: "Scan eerst het kaartnummer",
  },
  sdk_aria: "Scherm voor kaarten scannen",
  timeout_modal: {
    cancel_btn: "Annuleren",
    details: "Kon de kaart niet lezen. Probeer het opnieuw.",
    retry_btn: "Probeer opnieuw",
    title: "Scan niet gelukt",
  },
} as const;
