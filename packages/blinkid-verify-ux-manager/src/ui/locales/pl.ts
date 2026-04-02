/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for pl.
 */
export default {
  document_filtered_modal: {
    details: "Spróbuj zeskanować inny dokument",
    title: "Dokument nie został zaakceptowany",
  },
  document_not_recognized_modal: {
    details: "Zeskanuj przednią stronę obsługiwanego dokumentu.",
    title: "Nie rozpoznano dokumentu",
  },
  feedback_messages: {
    blur_detected: "Trzymaj dokument i telefon nieruchomo",
    camera_angle_too_steep: "Trzymaj dokument równolegle do telefonu",
    document_scanned_aria: "Udało się! Zeskanowano dokument",
    document_too_close_to_edge: "Przesuń dalej",
    face_photo_not_fully_visible:
      "Zdjęcie twarzy powinno być w całości widoczne",
    flip_document: "Odwróć dokument",
    flip_to_back_side: "Obróć na drugą stronę",
    front_side_scanned_aria: "Udało się! Zeskanowano przednią stronę",
    glare_detected: "Przechyl lub przesuń dokument, aby usunąć odbicie światła",
    keep_document_parallel: "Trzymaj dokument równolegle do ekranu",
    keep_document_still: "Trzymaj dokument i urządzenie nieruchomo",
    move_closer: "Przesuń bliżej",
    move_farther: "Przesuń dalej",
    move_left: "Przejdź do strony po lewej",
    move_right: "Przejdź do strony po prawej",
    move_top: "Przejdź do strony na górze",
    occluded: "Dokument powinien być w całości widoczny",
    scan_data_page: "Zeskanuj stronę dokumentu z danymi",
    scan_last_page_barcode: "Zeskanuj kod kreskowy z ostatniej strony",
    scan_left_page: "Zeskanuj lewą stronę",
    scan_right_page: "Zeskanuj prawą stronę",
    scan_the_back_side: "Zeskanuj tylną stronę dokumentu",
    scan_the_barcode: "Zeskanuj kod kreskowy",
    scan_the_front_side: "Zeskanuj przednią stronę dokumentu",
    scan_top_page: "Zeskanuj górną stronę",
    too_bright: "Przejdź w mniej oświetlone miejsce",
    too_dark: "Przejdź w jaśniejsze miejsce",
    wrong_left: "Przejdź do lewej strony",
    wrong_right: "Przejdź do prawej strony",
    wrong_top: "Przejdź do górnej strony",
  },
  help_button: { aria_label: "Pomoc", tooltip: "Potrzebujesz pomocy?" },
  help_modal: {
    aria: "Pomoc dotycząca skanowania",
    back_btn: "Wstecz",
    blur: {
      details:
        "Staraj się trzymać telefon i dokument nieruchomo podczas skanowania. Poruszanie którymkolwiek z nich może spowodować rozmazanie obrazu i uniemożliwić odczyt danych z dokumentu.",
      details_desktop:
        "Staraj się trzymać urządzenie i dokument nieruchomo podczas skanowania. Poruszanie którymkolwiek z nich może spowodować rozmazanie obrazu i uniemożliwić odczyt danych z dokumentu.",
      title: "Nie ruszaj się podczas skanowania",
    },
    camera_lens: {
      details:
        "Sprawdź, czy obiektyw aparatu nie jest zabrudzony lub zakurzony. Zabrudzenia mogą powodować rozmycie obrazu, przez co szczegóły dokumentu stają się nieczytelne, a ich zeskanowanie niemożliwe.",
      title: "Wyczyść obiektyw aparatu",
    },
    done_btn: "Gotowe",
    done_btn_aria: "Wznów skanowanie",
    lighting: {
      details:
        "Unikaj bezpośredniego silnego światła, ponieważ odbija się od dokumentu i niektóre jego części mogą stać się nieczytelne. Jeśli nie możesz odczytać danych z dokumentu, nie będą one widoczne również dla aparatu.",
      title: "Uważaj na silne światło",
    },
    next_btn: "Dalej",
    visibility: {
      details:
        "Upewnij się, że nie zasłaniasz dokumentu, w tym jego dolnych krawędzi, palcem. Zwróć też uwagę na refleksy z hologramu na polach dokumentu.",
      title: "Wszystkie pola powinny być widoczne",
    },
  },
  onboarding_modal: {
    aria: "Instrukcje skanowania",
    btn: "Rozpocznij skanowanie",
    details:
      "Upewnij się, że dokument jest dobrze oświetlony. Wszystkie pola dokumentu powinny być widoczne na ekranie aparatu.",
    details_desktop:
      "Upewnij się, że obiektyw aparatu jest czysty, a dokument dobrze oświetlony. Wszystkie pola dokumentu powinny być widoczne na ekranie aparatu.",
    title: "Wszystkie szczegóły powinny być widoczne",
    title_desktop: "Przygotuj się do skanowania",
  },
  sdk_aria: "Ekran skanowania dokumentów",
  timeout_modal: {
    cancel_btn: "Anuluj",
    details: "Nie można odczytać dokumentu. Spróbuj ponownie.",
    retry_btn: "Spróbuj ponownie",
    title: "Nieudane skanowanie",
  },
} as const;
