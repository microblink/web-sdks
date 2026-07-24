/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for hu.
 */
export default {
  document_filtered_modal: {
    details: "Próbáljon meg beolvasni egy másik dokumentumot.",
    title: "Dokumentum elutasítva",
  },
  document_not_recognized_modal: {
    details: "Szkennelje be egy támogatott dokumentum elülső oldalát.",
    title: "A dokumentum nincs felismerve",
  },
  error_modal: { cancel_btn: "Mégsem", retry_btn: "Próbálja újra" },
  feedback_messages: {
    blur_detected: "Tartsa a dokumentumot és a telefont mozdulatlanul",
    camera_angle_too_steep: "Tartsa a dokumentumot a telefonnal párhuzamosan",
    document_scanned_aria: "Siker! Dokumentum beolvasva",
    document_too_close_to_edge: "Menjen távolabb",
    face_photo_not_fully_visible: "Tartsa az arcképet teljesen láthatóan",
    flip_document: "Fordítsa meg a dokumentumot",
    flip_to_back_side: "Fordítsa meg a dokumentumot",
    front_side_scanned_aria: "Siker! Első oldal beolvasva",
    glare_detected:
      "Döntse meg vagy mozgassa a dokumentumot a tükröződés megszüntetéséhez",
    keep_document_parallel: "Tartsa a dokumentumot az eszközzel párhuzamosan",
    keep_still: "Ne mozogjon",
    move_closer: "Menjen közelebb",
    move_farther: "Menjen távolabb",
    move_left: "Áthelyezés a bal oldali oldalra",
    move_right: "Áthelyezés a jobb oldali oldalra",
    move_top: "Áthelyezés az oldal tetejére",
    occluded: "Tartsd a dokumentumot teljesen láthatóan",
    scan_data_page: "A dokumentum adatlapjának beolvasása",
    scan_last_page_barcode: "Olvassa be a vonalkódot az utolsó oldalról",
    scan_left_page: "A bal oldali oldal beolvasása",
    scan_right_page: "A jobb oldali oldal beolvasása",
    scan_the_back_side: "Szkennelje be a dokumentum hátoldalát",
    scan_the_barcode: "Szkennelje be a vonalkódot",
    scan_the_barcode_side: "Olvassa be a dokumentum vonalkódos oldalát",
    scan_the_front_side: "Szkennelje be egy dokumentum\\nelülső oldalát",
    scan_the_mrz_side: "Olvassa be az okmány MRZ kódot tartalmazó oldalát",
    scan_top_page: "A felső oldal beolvasása",
    too_bright: "Menjen egy kevésbé megvilágított helyre",
    too_dark: "Menjen jobban megvilágított helyre",
    wrong_left: "Áthelyezés a bal oldali oldalra",
    wrong_right: "Áthelyezés a jobb oldali oldalra",
    wrong_top: "Áthelyezés a legfelső oldalra",
  },
  help_button: { aria_label: "Súgó", tooltip: "Segíthetünk bármiben?" },
  help_modal: {
    aria: "Szkennelési súgó",
    back_btn: "Vissza",
    barcode_only: {
      blur: {
        details:
          "Próbálja mozdulatlanul tartani a telefont és a vonalkódot a beolvasás alatt. Ha valamelyik mozog, elmosódhat a kép, és a vonalkód nehezen olvashatóvá válhat.",
        details_desktop:
          "Próbáljon mozdulatlan maradni a beolvasáskor.Ha mozog, a kép elmosódott lehet, és így nehéz lehet a vonalkód beolvasása.",
        title: "Maradjon mozdulatlan a szkennelés során",
        title_desktop: "Maradjon mozdulatlan a szkennelés során",
      },
      camera_lens: {
        details_desktop:
          "Ellenőrizze, hogy nincs-e maszat vagy por a lencsén. Ha a lencse koszos, a végső kép elmosódhat, így a vonalkód olvashatatlanná válhat, és nem lehetséges az adatokat beolvasni.",
        title_desktop: "Tisztítsa meg a kameralencsét",
      },
      lighting: {
        details:
          "Kerülje a közvetlen, erős fényt, mert tükröződést okozhat a vonalkódon, és megnehezítheti a beolvasást. Ha a vonalkód az Ön számára sem látható tisztán, valószínűleg a kamera sem tudja beolvasni.",
        details_desktop:
          "Kerülje a közvetlen, erős fényt, mert tükröződést okozhat a vonalkódon, és megnehezítheti a beolvasást. Ha a vonalkód az Ön számára sem látható tisztán, valószínűleg a kamera sem tudja beolvasni.",
        title: "Ügyeljen az erős fényre",
        title_desktop: "Ügyeljen az erős fényre",
      },
      visibility: {
        details:
          "Ügyeljen arra, hogy a vonalkód egyes részeit ne takarja el az ujjával. Ezenkívül ügyeljen a tükröződésekre, amelyek a vonalkódon áthaladnak, és olvashatatlanná tehetik azt.",
        details_desktop:
          "Ügyeljen arra, hogy a vonalkód egyes részeit ne takarja el az ujjával. Ezenkívül ügyeljen a tükröződésekre, amelyek a vonalkódon áthaladnak, és olvashatatlanná tehetik azt.",
        title: "Tartsa láthatóan a vonalkódot",
        title_desktop: "Tartsa láthatóan a vonalkódot",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "A szkennelés során próbálja mozdulatlanul tartani a telefont és a dokumentumot. Mozgás hatására a kép elmosódhat, a dokumentumon lévő adatok pedig olvashatatlanná válhatnak.",
        details_desktop:
          "Próbáljon mozdulatlan maradni a beolvasás közben. A mozgás elhomályosíthatja a képet, és olvashatatlanná teheti a dokumentumon lévő adatokat.",
        title: "Maradjon mozdulatlan a szkennelés során",
        title_desktop: "Maradjon mozdulatlan a szkennelés során",
      },
      camera_lens: {
        details_desktop:
          "Ellenőrizze, hogy nincs-e folt vagy por a kamera lencséjén. A piszkos lencse elhomályosítja a végső képet, így a dokumentum részletei olvashatatlanná válnak, ami megakadályozza az adatok sikeres beolvasását.",
        title_desktop: "Tisztítsa meg a kameralencsét",
      },
      lighting: {
        details:
          "Kerülje a közvetlen, erős fényt, mivel visszaverődik a dokumentumról, és ennek hatására a dokumentum egyes részei olvashatatlanná válhatnak. Ha nem tudja leolvasni a dokumentumon lévő adatokat, akkor a kamera számára sem lesznek láthatók.",
        details_desktop:
          "Kerülje a közvetlen, erős fényt, mivel visszaverődik a dokumentumról, és ennek hatására a dokumentum egyes részei olvashatatlanná válhatnak. Ha nem tudja leolvasni a dokumentumon lévő adatokat, akkor a kamera számára sem lesznek láthatók.",
        title: "Ügyeljen az erős fényre",
        title_desktop: "Ügyeljen az erős fényre",
      },
      visibility: {
        details:
          "Ügyeljen arra, hogy a vonalkód egyes részeit ne takarja el az ujjával. Ezenkívül ügyeljen a tükröződésekre, amelyek a vonalkódon áthaladnak, és olvashatatlanná tehetik azt.",
        details_desktop:
          "Ügyeljen arra, hogy a vonalkód egyes részeit ne takarja el az ujjával. Ezenkívül ügyeljen a tükröződésekre, amelyek a vonalkódon áthaladnak, és olvashatatlanná tehetik azt.",
        title: "Tartsa láthatóan a vonalkódot",
        title_desktop: "Tartsa láthatóan a vonalkódot",
      },
    },
    document_with_mrz: {
      blur: {
        details:
          "A szkennelés során próbálja mozdulatlanul tartani a telefont és a dokumentumot. Mozgás hatására a kép elmosódhat, a dokumentumon lévő adatok pedig olvashatatlanná válhatnak.",
        details_desktop:
          "Próbáljon mozdulatlan maradni a beolvasás közben. A mozgás elhomályosíthatja a képet, és olvashatatlanná teheti a dokumentumon lévő adatokat.",
        title: "Maradjon mozdulatlan a szkennelés során",
        title_desktop: "Maradjon mozdulatlan a szkennelés során",
      },
      camera_lens: {
        details_desktop:
          "Ellenőrizze, hogy nincs-e folt vagy por a kamera lencséjén. A piszkos lencse elhomályosítja a végső képet, így a dokumentum részletei olvashatatlanná válnak, ami megakadályozza az adatok sikeres beolvasását.",
        title_desktop: "Tisztítsa meg a kameralencsét",
      },
      lighting: {
        details:
          "Kerülje a közvetlen, erős fényt, mivel visszaverődik a dokumentumról, és ennek hatására a dokumentum egyes részei olvashatatlanná válhatnak. Ha nem tudja leolvasni a dokumentumon lévő adatokat, akkor a kamera számára sem lesznek láthatók.",
        details_desktop:
          "Kerülje a közvetlen, erős fényt, mivel visszaverődik a dokumentumról, és ennek hatására a dokumentum egyes részei olvashatatlanná válhatnak. Ha nem tudja leolvasni a dokumentumon lévő adatokat, akkor a kamera számára sem lesznek láthatók.",
        title: "Ügyeljen az erős fényre",
        title_desktop: "Ügyeljen az erős fényre",
      },
      visibility: {
        details:
          "Ügyeljen arra, hogy az MRZ egyes részeit ne takarja el az ujjával. Ezenkívül ügyeljen az MRZ kódot átfedő tükröződésekre is, amelyek olvashatatlanná tehetik.",
        details_desktop:
          "Ügyeljen arra, hogy az MRZ egyes részeit ne takarja el az ujjával. Ezenkívül ügyeljen az MRZ kódot átfedő tükröződésekre is, amelyek olvashatatlanná tehetik.",
        title: "Ügyeljen arra, hogy az MRZ látható maradjon",
        title_desktop: "Ügyeljen arra, hogy az MRZ látható maradjon",
      },
    },
    done_btn: "Kész",
    done_btn_aria: "Szkennelés folytatása",
    full_document: {
      blur: {
        details:
          "A szkennelés során próbálja mozdulatlanul tartani a telefont és a dokumentumot. Mozgás hatására a kép elmosódhat, a dokumentumon lévő adatok pedig olvashatatlanná válhatnak.",
        details_desktop:
          "Próbáljon mozdulatlan maradni a beolvasás közben. A mozgás elhomályosíthatja a képet, és olvashatatlanná teheti a dokumentumon lévő adatokat.",
        title: "Maradjon mozdulatlan a szkennelés során",
        title_desktop: "Maradjon mozdulatlan a szkennelés során",
      },
      camera_lens: {
        details_desktop:
          "Ellenőrizze, hogy nincs-e folt vagy por a kamera lencséjén. A piszkos lencse elhomályosítja a végső képet, így a dokumentum részletei olvashatatlanná válnak, ami megakadályozza az adatok sikeres beolvasását.",
        title_desktop: "Tisztítsa meg a kameralencsét",
      },
      lighting: {
        details:
          "Kerülje a közvetlen, erős fényt, mivel visszaverődik a dokumentumról, és ennek hatására a dokumentum egyes részei olvashatatlanná válhatnak. Ha nem tudja leolvasni a dokumentumon lévő adatokat, akkor a kamera számára sem lesznek láthatók.",
        details_desktop:
          "Kerülje a közvetlen, erős fényt, mivel visszaverődik a dokumentumról, és ennek hatására a dokumentum egyes részei olvashatatlanná válhatnak. Ha nem tudja leolvasni a dokumentumon lévő adatokat, akkor a kamera számára sem lesznek láthatók.",
        title: "Ügyeljen az erős fényre",
        title_desktop: "Ügyeljen az erős fényre",
      },
      visibility: {
        details:
          "Ügyeljen arra, hogy ne takarja le az ujjával a dokumentum részeit (az alsó sorokat is beleértve). Ügyeljen továbbá a hologramokra is, amelyek visszatükröződnek a dokumentummezőkön.",
        details_desktop:
          "Ügyeljen arra, hogy ne takarja le az ujjával a dokumentum részeit (az alsó sorokat is beleértve). Ügyeljen továbbá a hologramokra is, amelyek visszatükröződnek a dokumentummezőkön.",
        title: "Az összes mező legyen teljes egészében látható",
        title_desktop: "Az összes mező legyen teljes egészében látható",
      },
    },
    next_btn: "Következő",
  },
  onboarding_modal: {
    aria: "Szkennelési utasítások",
    barcode_only: {
      details:
        "Keressen vonalkódot (egymás melletti fekete vonalak vagy  négyzet alakú kód). Irányítsa rá a kamerát, és tartsa mozdulatlanul – a beolvasás automatikusan megtörténik.",
      details_desktop:
        "Keressen vonalkódot (több egymás melletti vékony vonal vagy négyzet alakú kód). Ügyeljen rá, hogy a kamera lencséja tiszta és a vonalkód jól megvilágított legyen.",
      title: "Keresse meg, és olvassa be a vonalkódot",
      title_desktop: "Tisztítsa meg a lencsét, és keresse meg a vonalkódot",
    },
    btn: "Szkennelés megkezdése",
    document_with_barcode: {
      details:
        "A különböző típusú okmányok eltérő vonalkód-formátummal és -helyekkel rendelkezhetnek. Nézze meg az okmány elejét és hátulját, hogy megtalálja a vonalkódot.",
      details_desktop:
        "Ellenőrizze az okmány elejét és hátulját vonalkódot keresve. Ügyeljen rá, hogy a kamera lencséje tiszta legyen, és az okmány jól meg legyen világítva.",
      title: "Keresse meg a vonalkódot az okmányon",
      title_desktop: "Tisztítsa meg a lencsét, és keresse meg a vonalkódot",
    },
    document_with_mrz: {
      details:
        "Az okmény elején vagy hátoldalán egy hosszú karaktersort talál, amely 2 vagy 3 sorra van osztva, valamint (<< vagy >>) nyilak választják el.",
      details_desktop:
        "Ellenőrizze az okmány elejét és hátoldalát, és keresse meg az MRZ kódot. Ez 2–3 karaktersorból és nyíl szimbólumokból (<<) áll, és az okmány alján helyezkedik el. Ügyeljen arra, hogy a kamera lencséje tiszta legyen, és a dokumentum jól meg legyen világítva.",
      title: "Keresse meg az MRZ kódot az okmányon",
      title_desktop: "Tisztítsa meg a lencsét, és keresse meg az MRZ kódot",
    },
    full_document: {
      details:
        "Ügyeljen a dokumentum megfelelő megvilágítására. Minden dokumentummezőnek láthatónak kell lennie a kameraképernyőn.",
      details_desktop:
        "Ügyeljen a kameralencse tisztán tartására és a dokumentum megfelelő megvilágítására. Minden dokumentummezőnek láthatónak kell lennie a kameraképernyőn.",
      title: "Az összes adat legyen látható",
      title_desktop: "Készüljön fel a szkennelésre",
    },
  },
  sdk_aria: "Dokumentumszkennelés képernyő",
  timeout_modal: {
    details:
      "Ügyeljen rá, hogy az okmány jól meg legyen világítva, teljesen látható legyen és ne legyen rajta becsillanás.",
    details_desktop:
      "Ügyeljen rá, hogy a kamera lencséje tiszta legyen, az okmány pedig teljesen látható és éles legyen, valamint jól meg legyen világítva.",
    title: "Az okmány nem olvasható",
  },
} as const;
