/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for pl.
 */
export default {
  feedback_messages: {
    blur_detected: "Nie poruszaj kartą ani telefonem",
    blur_detected_desktop: "Nie poruszaj kartą ani urządzeniem",
    camera_angle_too_steep: "Ustaw kartę równolegle do telefonu",
    camera_angle_too_steep_desktop: "Trzymaj kartę równolegle do ekranu",
    card_number_scanned:
      "Udało się! Zeskanowano stronę karty zawierającą numer",
    card_scanned: "Udało się! Zeskanowano kartę",
    document_too_close_to_edge: "Przesuń dalej",
    flip_card: "Odwróć kartę",
    flip_to_back_side: "Odwróć kartę",
    move_closer: "Przesuń bliżej",
    move_farther: "Przesuń dalej",
    occluded: "Karta musi być w pełni widoczna",
    scan_the_back_side: "Zeskanuj drugą stronę karty",
    scan_the_front_side: "Zeskanuj numer karty",
  },
  help_button: { aria_label: "Pomoc", tooltip: "Potrzebujesz pomocy?" },
  help_modal: {
    back_btn: "Wstecz",
    blur: {
      details:
        "Staraj się trzymać telefon i kartę nieruchomo podczas skanowania. Poruszanie nimi może spowodować rozmycie obrazu i uniemożliwić odczytanie danych na karcie.",
      details_desktop:
        "Podczas skanowania trzymaj urządzenie i kartę nieruchomo. Ruch może spowodować rozmycie obrazu i sprawić, że dane na karcie będą nieczytelne.",
      title: "Nie ruszaj się podczas skanowania",
    },
    camera_lens: {
      details:
        "Sprawdź, czy obiektyw aparatu nie jest zabrudzony lub zakurzony. Zabrudzenia mogą powodować rozmycie obrazu, przez co dane na karcie stają się nieczytelne, a ich zeskanowanie niemożliwe.",
      title: "Wyczyść obiektyw aparatu",
    },
    card_number: {
      details:
        "Numer karty jest zwykle numerem 16-cyfrowym, chociaż może mieć od 12 do 19 cyfr. Powinien być wydrukowany lub wytłoczony wypukłymi cyframi na karcie. Może znajdować się na awersie lub odwrocie karty.",
      title: "Gdzie jest numer karty?",
    },
    done_btn: "Gotowe",
    lighting: {
      details:
        "Unikaj bezpośredniego, ostrego światła, ponieważ odbija się ono od karty i może uniemożliwić jej odczytanie. Jeśli nie możesz odczytać danych z karty, nie będą one również widoczne dla aparatu.",
      title: "Uważaj na silne światło",
    },
    next_btn: "Dalej",
    occlusion: {
      details:
        "Sprawdź, czy nie zakrywasz palcem części karty, w tym dolnych linii. Uważaj również na odbicia holograficzne, które pojawiają się na polach kart.",
      title: "Wszystkie pola powinny być widoczne",
    },
  },
  onboarding_modal: {
    btn: "Rozpocznij skanowanie",
    details:
      "Numer karty to zazwyczaj numer składający się z 16 cyfr. Powinien być wydrukowany lub wytłoczony wypukłymi cyframi na karcie. Upewnij się, że karta jest dobrze oświetlona i wszystkie szczegóły są widoczne.",
    details_desktop:
      "Numer karty składa się zazwyczaj z 16 cyfr. Powinien być nadrukowany lub wytłoczony na jej powierzchni. Upewnij się, że obiektyw aparatu jest czysty, karta dobrze oświetlona, a wszystkie szczegóły są widoczne.",
    title: "Najpierw zeskanuj numer karty",
  },
  timeout_modal: {
    cancel_btn: "Anuluj",
    details: "Nie można odczytać karty. Spróbuj ponownie.",
    retry_btn: "Spróbuj ponownie",
    title: "Nieudane skanowanie",
  },
} as const;
