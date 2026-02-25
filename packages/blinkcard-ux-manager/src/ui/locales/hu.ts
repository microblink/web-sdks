/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for hu.
 */
export default {
  feedback_messages: {
    blur_detected: "Tartsa mozdulatlanul a kártyát és a telefont",
    blur_detected_desktop: "Tartsa a kártyát és az eszközt mozdulatlanul",
    camera_angle_too_steep: "Tartsa a kártyát a telefonnal párhuzamosan",
    camera_angle_too_steep_desktop:
      "Tartsa a kártyát a képernyővel párhuzamosan",
    card_number_scanned: "Sikerült! A kártyaszámos oldal beszkennelve",
    card_scanned: "Sikerült! A kártya beszkennelve",
    document_too_close_to_edge: "Menjen távolabb",
    flip_card: "Fordítsa meg a kártyát",
    flip_to_back_side: "Fordítsa meg a kártyát",
    move_closer: "Menjen közelebb",
    move_farther: "Menjen távolabb",
    occluded: "A kártya teljes egészében legyen látható",
    scan_the_back_side: "Olvassa be a kártya másik oldalát",
    scan_the_front_side: "Szkennelje be a kártyaszámot",
  },
  help_button: { aria_label: "Súgó", tooltip: "Segíthetünk bármiben?" },
  help_modal: {
    aria: "Szkennelési súgó",
    back_btn: "Vissza",
    blur: {
      details:
        "A szkennelés során próbálja mozdulatlanul tartani a telefont és a kártyát. Mozgás hatására a kép elmosódhat, a kártyán lévő adatok pedig olvashatatlanná válhatnak.",
      details_desktop:
        "A szkennelés során próbálja mozdulatlanul tartani az eszközt és a kártyát. Mozgás hatására a kép elmosódhat, a kártyán lévő adatok pedig olvashatatlanná válhatnak.",
      title: "Maradjon mozdulatlan a szkennelés során",
    },
    camera_lens: {
      details:
        "Ellenőrizze, hogy nincs-e kosz vagy por a kamera lencséjén. A piszkos lencse elhomályosítja a végső képet, így a kártyaadatok olvashatatlanná válnak, és ez megakadályozza az adatok sikeres beolvasását.",
      title: "Tisztítsa meg a kameralencsét",
    },
    card_number: {
      details:
        "A kártyaszám általában 16 számjegyből áll, ugyanakkor 12–19 számjegyből álló kártyaszám is előfordul. A szám nyomtatva vagy kiemelkedő, dombornyomott formában látható a kártyán. A kártya elülső vagy hátsó oldalán található.",
      title: "Hol található a kártyaszám?",
    },
    done_btn: "Kész",
    done_btn_aria: "Szkennelés folytatása",
    lighting: {
      details:
        "Kerülje a közvetlen, erős fényt, mivel visszaverődik a kártyáról, és ennek hatására a kártya egyes részei olvashatatlanná válhatnak. Ha nem tudja leolvasni a kártyán lévő adatokat, akkor a kamera számára sem lesznek láthatók.",
      title: "Ügyeljen az erős fényre",
    },
    next_btn: "Következő",
    occlusion: {
      details:
        "Ügyeljen arra, hogy ne takarja le az ujjával a kártya részeit (az alsó sorokat is beleértve). Ügyeljen továbbá a hologramokra is, amelyek visszatükröződnek a kártya mezőin.",
      title: "Az összes mező legyen teljes egészében látható",
    },
  },
  onboarding_modal: {
    aria: "Szkennelési utasítások",
    btn: "Szkennelés megkezdése",
    details:
      "A kártyaszám általában 16 számjegyből áll. A szám nyomtatva vagy kiemelkedő, dombornyomott formában látható a kártyán. Ügyeljen a kártya megfelelő megvilágítására, és hogy minden adat jól látható legyen.",
    details_desktop:
      "A kártyaszám általában 16 számjegyből áll. A szám nyomtatva vagy kiemelkedő, dombornyomott formában látható a kártyán. Ügyeljen a kameralencse tisztaságára, a kártya megfelelő megvilágítására, és arra, hogy minden adat jól látható legyen.",
    title: "Először a kártyaszámot szkennelje be",
  },
  sdk_aria: "Kártyaszkennelés képernyő",
  timeout_modal: {
    cancel_btn: "Mégsem",
    details: "Nem sikerült a kártya olvasása. Kérjük, próbálja újra.",
    retry_btn: "Próbálja újra",
    title: "Sikertelen szkennelés",
  },
} as const;
