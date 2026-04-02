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
    keep_document_still: "Tartsa mozdulatlanul a dokumentumot és az eszközt",
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
    scan_the_front_side: "Szkennelje be egy dokumentum\\nelülső oldalát",
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
    blur: {
      details:
        "A szkennelés során próbálja mozdulatlanul tartani a telefont és a dokumentumot. Mozgás hatására a kép elmosódhat, a dokumentumon lévő adatok pedig olvashatatlanná válhatnak.",
      details_desktop:
        "A szkennelés során próbálja mozdulatlanul tartani az eszközt és a dokumentumot. Mozgás hatására a kép elmosódhat, a dokumentumon lévő adatok pedig olvashatatlanná válhatnak.",
      title: "Maradjon mozdulatlan a szkennelés során",
    },
    camera_lens: {
      details:
        "Ellenőrizze, hogy nincs-e folt vagy por a kamera lencséjén. A piszkos lencse elhomályosítja a végső képet, így a dokumentum részletei olvashatatlanná válnak, ami megakadályozza az adatok sikeres beolvasását.",
      title: "Tisztítsa meg a kameralencsét",
    },
    done_btn: "Kész",
    done_btn_aria: "Szkennelés folytatása",
    lighting: {
      details:
        "Kerülje a közvetlen, erős fényt, mivel visszaverődik a dokumentumról, és ennek hatására a dokumentum egyes részei olvashatatlanná válhatnak. Ha nem tudja leolvasni a dokumentumon lévő adatokat, akkor a kamera számára sem lesznek láthatók.",
      title: "Ügyeljen az erős fényre",
    },
    next_btn: "Következő",
    visibility: {
      details:
        "Ügyeljen arra, hogy ne takarja le az ujjával a dokumentum részeit (az alsó sorokat is beleértve). Ügyeljen továbbá a hologramokra is, amelyek visszatükröződnek a dokumentummezőkön.",
      title: "Az összes mező legyen teljes egészében látható",
    },
  },
  onboarding_modal: {
    aria: "Szkennelési utasítások",
    btn: "Szkennelés megkezdése",
    details:
      "Ügyeljen a dokumentum megfelelő megvilágítására. Minden dokumentummezőnek láthatónak kell lennie a kameraképernyőn.",
    details_desktop:
      "Ügyeljen a kameralencse tisztán tartására és a dokumentum megfelelő megvilágítására. Minden dokumentummezőnek láthatónak kell lennie a kameraképernyőn.",
    title: "Az összes adat legyen látható",
    title_desktop: "Készüljön fel a szkennelésre",
  },
  sdk_aria: "Dokumentumszkennelés képernyő",
  timeout_modal: {
    cancel_btn: "Mégsem",
    details: "Nem sikerült elolvasni a dokumentumot. Kérjük, próbálja újra.",
    retry_btn: "Próbálja újra",
    title: "Sikertelen szkennelés",
  },
} as const;
