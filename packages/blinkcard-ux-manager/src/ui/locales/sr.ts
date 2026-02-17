/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for sr.
 */
export default {
  feedback_messages: {
    blur_detected: "Držite mirno karticu i telefon",
    blur_detected_desktop: "Držite mirno karticu i uređaj",
    camera_angle_too_steep: "Држите картицу паралелно са телефоном",
    camera_angle_too_steep_desktop: "Držite karticu paralelno s ekranom",
    card_number_scanned: "Успешно! Страна са бројем картице је скенирана",
    card_scanned: "Успешно! Картица је скенирана",
    document_too_close_to_edge: "Udaljite",
    flip_card: "Preokrenite karticu",
    flip_to_back_side: "Preokrenite karticu",
    move_closer: "Približite",
    move_farther: "Udaljite",
    occluded: "Vodite računa da cela kartica bude vidljiva",
    scan_the_back_side: "Skenirajte drugu stranu kartice",
    scan_the_front_side: "Skenirajte broj kartice",
  },
  help_button: { aria_label: "Pomoć", tooltip: "Potrebna vam je pomoć?" },
  help_modal: {
    back_btn: "Nazad",
    blur: {
      details:
        "Pokušajte da telefon i kartica budu mirni tokom skeniranja. Pomeranje bilo koje od njih može zamutiti sliku i učiniti podatke na dokumentu nečitljivim.",
      details_desktop:
        "Pokušajte da telefon i kartica budu mirni tokom skeniranja. Pomeranje bilo koje od njih može zamutiti sliku i učiniti podatke na kartici nečitljivim.",
      title: "Ostanite mirni dok skenirate",
    },
    camera_lens: {
      details:
        "Proverite da li na sočivu kamere ima mrlja ili prašine. Prljavo sočivo može zamutiti konačnu sliku, zbog čega detalji na kartici postaju nečitljivi i onemogućavaju uspešno skeniranje podataka.",
      title: "Očistite sočiva kamere",
    },
    card_number: {
      details:
        "Broj kartice je obično 16-cifreni broj, iako može imati između 12 i 19 cifara. Trebalo bi da bude odštampan ili utisnut podignutim brojevima preko kartice. Može biti na prednjoj ili zadnjoj strani kartice.",
      title: "Gde se nalazi broj kartice?",
    },
    done_btn: "Završeno",
    lighting: {
      details:
        "Izbegavajte direktnu oštru svetlost jer se odbija od kartice i može učiniti delove kartice nečitljivim. Ako ne možete da pročitate podatke na kartici, neće biti vidljivi ni kameri.",
      title: "Pazite na oštro svetlo",
    },
    next_btn: "Sledeći",
    occlusion: {
      details:
        "Uverite se da ne prekrivate delove kartice prstom, uključujući donje redove. Takođe, pazite na hologramske refleksije koje prelaze preko polja kartice.",
      title: "Neka sva polja budu vidljiva",
    },
  },
  onboarding_modal: {
    btn: "Pokreni skeniranje",
    details:
      "Broj kartice je obično 16-cifreni broj. Trebalo bi da bude odštampan ili utisnut podignutim brojevima preko kartice. Uverite se da je kartica dobro osvetljena i da su svi detalji vidljivi.",
    details_desktop:
      "Broj kartice je obično 16-cifreni broj. Može biti odštampan ili utisnut u vidu izdignutih brojeva na kartici. Uvjerite se da je sočivo kamere čisto, da je kartica dobro osvetljena i da su svi detalji jasno vidljivi.",
    title: "Prvo skenirajte broj kartice",
  },
  timeout_modal: {
    cancel_btn: "Otkaži",
    details: "Nije moguće pročitati karticu. Pokušajte ponovo.",
    retry_btn: "Pokušaj ponovo",
    title: "Skeniranje neuspešno",
  },
} as const;
