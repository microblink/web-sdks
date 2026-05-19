/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for sk.
 */
export default {
  document_filtered_modal: {
    details: "Skúste naskenovať iný dokument.",
    title: "Dokument nebol prijatý",
  },
  document_not_recognized_modal: {
    details: "Naskenujte prednú stranu podporovaného dokumentu.",
    title: "Dokument nebol rozpoznaný",
  },
  error_modal: { cancel_btn: "Zrušiť", retry_btn: "Skúsiť znova" },
  feedback_messages: {
    blur_detected: "Držte dokument a telefón v jednej polohe",
    camera_angle_too_steep: "Udržujte dokument paralelne s telefónom",
    document_scanned_aria: "Úspech! Doklad bol naskenovaný",
    document_too_close_to_edge: "Posuňte sa ďalej",
    face_photo_not_fully_visible: "Ponechajte fotku tváre plne viditeľnú",
    flip_document: "Otočte dokument",
    flip_to_back_side: "Otočte preukaz",
    front_side_scanned_aria: "Úspech! Naskenovaná predná strana",
    glare_detected: "Nakloňte alebo posuňte dokument, aby ste odstránili odraz",
    keep_document_parallel: "Držte dokument paralelne s obrazovkou",
    keep_document_still: "Držte dokument a zariadenie v pokoji",
    keep_still: "Nehýbte sa",
    move_closer: "Posuňte sa bližšie",
    move_farther: "Posuňte sa ďalej",
    move_left: "Prejdite na stránku vľavo",
    move_right: "Prejdite na stránku vpravo",
    move_top: "Prejdite na stránku hore",
    occluded: "Dokument musí byť úplne viditeľný",
    scan_data_page: "Naskenujte stranu dokumentu s údajmi",
    scan_last_page_barcode: "Naskenujte čiarový kód z poslednej strany",
    scan_left_page: "Oskenujte stránku vľavo",
    scan_right_page: "Oskenujte stránku vpravo",
    scan_the_back_side: "Nasnímajte zadnú stranu dokumentu",
    scan_the_barcode: "Naskenovať čiarový kód",
    scan_the_barcode_side: "Naskenujte čiarový kód dokumentu",
    scan_the_front_side: "Naskenujte prednú stranu \\n preukazu",
    scan_top_page: "Oskenujte stránku hore",
    too_bright: "Presuňte sa na miesto s menším osvetlením",
    too_dark: "Presuňte sa na svetlejšie miesto",
    wrong_left: "Prejdite na stránku vľavo",
    wrong_right: "Prejdite na stránku vpravo",
    wrong_top: "Prejdite na stránku hore",
  },
  help_button: { aria_label: "Pomoc", tooltip: "Potrebujete pomoc?" },
  help_modal: {
    aria: "Pomocník skenovania",
    back_btn: "Späť",
    barcode_only: {
      blur: {
        details:
          "Počas snímania sa snažte nehýbať telefónom a čiarovým kódom. Pohyb môže rozmazať obraz a spôsobiť, že sa čiarový kód nebude dať prečítať.",
        details_desktop:
          "Počas snímania sa snažte nehýbať. Pohyb môže rozmazať obraz a spôsobiť, že sa čiarový kód nebude dať prečítať.",
        title: "Počas snímania zostaňte v pokoji",
        title_desktop: "Počas snímania zostaňte v pokoji",
      },
      camera_lens: {
        details_desktop:
          "Skontrolujte, či na objektíve kamery nie sú šmuhy alebo prach. Ak je objektív znečistený, výsledný obraz bude rozmazaný, čiarový kód nečitateľný a snímanie údajov sa nepodarí.",
        title_desktop: "Vyčistite objektív kamery",
      },
      lighting: {
        details:
          "Vyhnite sa priamemu ostrému svetlu, pretože môže na čiarovom kóde vytvoriť odlesky a sťažiť jeho snímanie. Ak vy nevidíte jasne čiarový kód, nebude ho vidieť ani kamera.",
        details_desktop:
          "Vyhnite sa priamemu ostrému svetlu, pretože môže na čiarovom kóde vytvoriť odlesky a sťažiť jeho snímanie. Ak vy nevidíte jasne čiarový kód, nebude ho vidieť ani kamera.",
        title: "Pozor na ostré svetlo",
        title_desktop: "Pozor na ostré svetlo",
      },
      visibility: {
        details:
          "Uistite sa, že časti čiarového kódu nezakrývate prstom. Dávajte si tiež pozor na odrazy, ktoré prechádzajú cez čiarový kód a môžu spôsobiť, že bude nečitateľný.",
        details_desktop:
          "Uistite sa, že časti čiarového kódu nezakrývate prstom. Dávajte si tiež pozor na odrazy, ktoré prechádzajú cez čiarový kód a môžu spôsobiť, že bude nečitateľný.",
        title: "Udržujte čiarový kód viditeľný",
        title_desktop: "Udržujte čiarový kód viditeľný",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "Skúste počas snímania ponechať telefón a dokument v pokoji. Pohyb môže rozmazať obraz a spôsobiť, že údaje v dokumente budú nečitateľné.",
        details_desktop:
          "Počas snímania sa snažte nehýbať. Pohyb môže rozmazať obraz a spôsobiť nečitateľnosť údajov na dokumente.",
        title: "Počas snímania zostaňte v pokoji",
        title_desktop: "Počas snímania zostaňte v pokoji",
      },
      camera_lens: {
        details_desktop:
          "Skontrolujte, či na objektíve kamery nie sú šmuhy alebo prach. Ak je objektív znečistený, výsledný obraz bude rozmazaný, údaje na dokumente sa nebudú dať prečítať a skenovanie údajov sa nepodarí.",
        title_desktop: "Vyčistite objektív kamery",
      },
      lighting: {
        details:
          "Vyhnite sa priamemu ostrému svetlu, pretože sa odráža od dokumentu a môže spôsobiť, že časti dokumentu budú nečitateľné. Ak vy nedokážete čítať údaje v dokumente, neuvidí ich ani fotoaparát.",
        details_desktop:
          "Vyhnite sa priamemu ostrému svetlu, pretože sa odráža od dokumentu a môže spôsobiť, že časti dokumentu budú nečitateľné. Ak vy nedokážete čítať údaje v dokumente, neuvidí ich ani fotoaparát.",
        title: "Pozor na ostré svetlo",
        title_desktop: "Pozor na ostré svetlo",
      },
      visibility: {
        details:
          "Uistite sa, že časti čiarového kódu nezakrývate prstom. Dávajte si tiež pozor na odrazy, ktoré prechádzajú cez čiarový kód a môžu spôsobiť, že bude nečitateľný.",
        details_desktop:
          "Uistite sa, že časti čiarového kódu nezakrývate prstom. Dávajte si tiež pozor na odrazy, ktoré prechádzajú cez čiarový kód a môžu spôsobiť, že bude nečitateľný.",
        title: "Udržujte čiarový kód viditeľný",
        title_desktop: "Udržujte čiarový kód viditeľný",
      },
    },
    done_btn: "Hotovo",
    done_btn_aria: "Obnoviť skenovanie",
    full_document: {
      blur: {
        details:
          "Skúste počas snímania ponechať telefón a dokument v pokoji. Pohyb môže rozmazať obraz a spôsobiť, že údaje v dokumente budú nečitateľné.",
        details_desktop:
          "Počas snímania sa snažte nehýbať. Pohyb môže rozmazať obraz a spôsobiť nečitateľnosť údajov na dokumente.",
        title: "Počas snímania zostaňte v pokoji",
        title_desktop: "Počas snímania zostaňte v pokoji",
      },
      camera_lens: {
        details_desktop:
          "Skontrolujte, či na objektíve kamery nie sú šmuhy alebo prach. Ak je objektív znečistený, výsledný obraz bude rozmazaný, údaje na dokumente sa nebudú dať prečítať a skenovanie údajov sa nepodarí.",
        title_desktop: "Vyčistite objektív kamery",
      },
      lighting: {
        details:
          "Vyhnite sa priamemu ostrému svetlu, pretože sa odráža od dokumentu a môže spôsobiť, že časti dokumentu budú nečitateľné. Ak vy nedokážete čítať údaje v dokumente, neuvidí ich ani fotoaparát.",
        details_desktop:
          "Vyhnite sa priamemu ostrému svetlu, pretože sa odráža od dokumentu a môže spôsobiť, že časti dokumentu budú nečitateľné. Ak vy nedokážete čítať údaje v dokumente, neuvidí ich ani fotoaparát.",
        title: "Pozor na ostré svetlo",
        title_desktop: "Pozor na ostré svetlo",
      },
      visibility: {
        details:
          "Uistite sa, že nezakrývate časti dokumentu prstom, vrátane spodných riadkov. Dávajte si tiež pozor na hologramové odrazy, ktoré prechádzajú cez polia dokumentu.",
        details_desktop:
          "Uistite sa, že nezakrývate časti dokumentu prstom, vrátane spodných riadkov. Dávajte si tiež pozor na hologramové odrazy, ktoré prechádzajú cez polia dokumentu.",
        title: "Udržujte všetky polia viditeľné",
        title_desktop: "Udržujte všetky polia viditeľné",
      },
    },
    next_btn: "Ďalej",
  },
  onboarding_modal: {
    aria: "Pokyny na skenovanie",
    barcode_only: {
      details:
        "Vyhľadajte čiarový kód (sériu čiernych čiar alebo štvorcový kód). Nasmerujte naň fotoaparát a nehýbte sa – snímanie prebehne automaticky.",
      details_desktop:
        "Vyhľadajte čiarový kód (sériu čiernych čiar alebo štvorcový kód). Uistite sa, že je objektív fotoaparátu čistý a čiarový kód dobre osvetlený.",
      title: "Nájdite čiarový kód a naskenujte ho",
      title_desktop: "Vyčistite objektív kamery a nájdite čiarový kód",
    },
    btn: "Spustiť skenovanie",
    document_with_barcode: {
      details:
        "Rôzne typy preukazov totožnosti môžu mať rôzne formáty čiarových kódov a rôzne umiestnenia. Pozrite sa na prednú a zadnú stranu preukazov totožnosti, kde nájdete čiarový kód.",
      details_desktop:
        "Skontrolujte, či je na prednej a zadnej strane preukazu totožnosti čiarový kód. Uistite sa, že je objektív fotoaparátu čistý a dokument dobre osvetlený.",
      title: "Nájdite na preukaze totožnosti čiarový kód",
      title_desktop: "Vyčistite objektív kamery a nájdite čiarový kód",
    },
    full_document: {
      details:
        "Uistite sa, že máte dokument dobre osvetlený. Všetky polia dokumentu by mali byť viditeľné na obrazovke fotoaparátu.",
      details_desktop:
        "Uistite sa, že je objektív fotoaparátu čistý a dokument dobre osvetlený. Všetky polia dokumentu by mali byť viditeľné na obrazovke fotoaparátu.",
      title: "Udržujte všetky detaily viditeľné",
      title_desktop: "Pripravte sa na skenovanie",
    },
  },
  sdk_aria: "Obrazovka skenovania dokumentu",
  timeout_modal: {
    details: "Dokument sa nepodarilo prečítať. Prosím, skúste znova.",
    title: "Skenovanie neúspešné",
  },
} as const;
