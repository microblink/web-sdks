/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for sk.
 */
export default {
  feedback_messages: {
    blur_detected: "Držte kartu a telefón v pokoji",
    blur_detected_desktop: "Držte kartu a zariadenie v pokoji",
    camera_angle_too_steep: "Držte kartu rovnobežne s telefónom",
    camera_angle_too_steep_desktop: "Držte kartu rovnobežne s obrazovkou",
    card_number_scanned: "Úspech! Strana s číslom karty bola naskenovaná",
    card_scanned: "Úspech! Karta bola naskenovaná",
    document_too_close_to_edge: "Posuňte sa ďalej",
    flip_card: "Otočte kartu",
    flip_to_back_side: "Otočte kartu",
    move_closer: "Posuňte sa bližšie",
    move_farther: "Posuňte sa ďalej",
    occluded: "Kartu majte vždy plne viditeľnú",
    scan_the_back_side: "Nasnímajte druhú stranu karty",
    scan_the_front_side: "Nasnímajte číslo karty",
  },
  help_button: { aria_label: "Pomoc", tooltip: "Potrebujete pomoc?" },
  help_modal: {
    back_btn: "Späť",
    blur: {
      details:
        "Skúste počas snímania ponechať telefón a kartu v pokoji bez pohybu. Pohyb môže rozmazať obraz a spôsobiť nečitateľnosť údajov na karte.",
      details_desktop:
        "Skúste počas snímania ponechať zariadenie a kartu v pokoji bez pohybu. Pohyb môže rozmazať obraz a spôsobiť, že sa údaje na karte nebudú dať prečítať.",
      title: "Počas snímania zostaňte v pokoji",
    },
    camera_lens: {
      details:
        "Skontrolujte, či na objektíve kamery nie sú šmuhy alebo prach. Ak je objektív znečistený, výsledný obraz bude rozmazaný, údaje na karte sa nebudú dať prečítať a snímanie údajov sa nepodarí.",
      title: "Vyčistite objektív kamery",
    },
    card_number: {
      details:
        "Číslo karty je zvyčajne 16-miestne číslo, hoci môže mať 12 až 19 číslic. Malo by byť vytlačené alebo vyrazené vo forme vyvýšených čísel naprieč kartou. Môže byť na prednej alebo zadnej strane karty.",
      title: "Kde je číslo karty?",
    },
    done_btn: "Hotovo",
    lighting: {
      details:
        "Vyhnite sa priamemu ostrému svetlu, pretože sa odráža od karty a môže spôsobiť, že časti karty budú nečitateľné. Ak vy nedokážete čítať údaje na karte, nebude ich vidieť ani kamera.",
      title: "Pozor na ostré svetlo",
    },
    next_btn: "Ďalej",
    occlusion: {
      details:
        "Uistite sa, že nezakrývate časti karty prstom, vrátane spodných čiar. Dávajte si tiež pozor na hologramové odrazy, ktoré prechádzajú cez polia kariet.",
      title: "Udržujte všetky polia viditeľné",
    },
  },
  onboarding_modal: {
    btn: "Spustiť skenovanie",
    details:
      "Číslo karty je zvyčajne 16-miestne číslo. Malo by byť vytlačené alebo vyrazené vo forme vyvýšených čísel naprieč kartou. Uistite sa, že karta je dobre osvetlená a všetky detaily sú viditeľné.",
    details_desktop:
      "Číslo karty je zvyčajne 16-miestne číslo. Malo by byť vytlačené alebo vyrazené vo forme vyvýšených čísel naprieč kartou. Uistite sa, že objektív kamery je čistý, karta je dobre osvetlená a všetky detaily sú viditeľné.",
    title: "Najskôr nasnímajte číslo karty",
  },
  timeout_modal: {
    cancel_btn: "Zrušiť",
    details: "Kartu sa nepodarilo prečítať. Skúste to znova.",
    retry_btn: "Skúsiť znova",
    title: "Skenovanie neúspešné",
  },
} as const;
