/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for cs.
 */
export default {
  document_filtered_modal: {
    details: "Zkuste naskenovat jiný dokument.",
    title: "Dokument nebyl přijat",
  },
  document_not_recognized_modal: {
    details: "Naskenujte přední stranu podporovaného dokumentu.",
    title: "Dokument nebyl rozpoznán",
  },
  error_modal: { cancel_btn: "Storno", retry_btn: "Opakovat" },
  feedback_messages: {
    blur_detected: "Držte dokument a telefon v klidu",
    camera_angle_too_steep: "Držte dokument rovnoběžně s telefonem",
    document_scanned_aria: "Úspěch! Dokument byl naskenován",
    document_too_close_to_edge: "Kousek dál",
    face_photo_not_fully_visible:
      "Zachovejte úplnou viditelnost fotografie obličeje",
    flip_document: "Překlopit dokument",
    flip_to_back_side: "Otočte dokument",
    front_side_scanned_aria: "Úspěch! Čelní strana byla naskenována",
    glare_detected: "Nakloňte nebo přesuňte dokument pro odstranění odrazů",
    keep_document_parallel: "Držte dokument rovnoběžně s obrazovkou",
    keep_still: "Nehýbat",
    move_closer: "Kousek blíž",
    move_farther: "Kousek dál",
    move_left: "Přesuňte se na stránku vlevo",
    move_right: "Přesunout se na stránku vpravo",
    move_top: "Přesuňte se na stránku nahoře",
    occluded: "Ponechat dokument zcela viditelný",
    scan_data_page: "Naskenujte datovou stránku dokumentu",
    scan_last_page_barcode: "Naskenujte čárový kód z poslední stránky",
    scan_left_page: "Naskenujte levou stránku",
    scan_right_page: "Naskenujte pravou stránku",
    scan_the_back_side: "Naskenujte zadní stranu dokumentu",
    scan_the_barcode: "Naskenujte čárový kód",
    scan_the_barcode_side: "Naskenujte stranu dokumentu s čárovým kódem",
    scan_the_front_side: "Naskenujte přední\\nstranu dokumentu.",
    scan_the_mrz_side: "Naskenujte stranu dokumentu obsahující MRZ kód",
    scan_top_page: "Naskenujte horní stránku",
    too_bright: "Přesuňte se na méně osvětlené místo",
    too_dark: "Přesuňte se na lépe osvětlené místo",
    wrong_left: "Přesuňte se na levou stránku",
    wrong_right: "Přesuňte se na pravou stránku",
    wrong_top: "Přesuňte se na horní stránku",
  },
  help_button: { aria_label: "Nápověda", tooltip: "Potřebujete pomoct?" },
  help_modal: {
    aria: "Nápověda pro skenování",
    back_btn: "Zpět",
    barcode_only: {
      blur: {
        details:
          "Při skenování se snažte držet telefon a čárový kód v klidu. Pohyb může obraz rozmazat a způsobit, že čárový kód nebude čitelný.",
        details_desktop:
          "Při skenování se snažte nehýbat. Pohyb může obraz rozmazat a čárový kód pak může být obtížně čitelný.",
        title: "Při skenování se nehýbejte",
        title_desktop: "Při skenování se nehýbejte",
      },
      camera_lens: {
        details_desktop:
          "Zkontrolujte, zda na objektivu fotoaparátu nejsou šmouhy nebo prach. Špinavý objektiv způsobuje rozmazání výsledného obrazu, což znemožňuje přečtení čárového kódu a úspěšné naskenování dat.",
        title_desktop: "Vyčistěte objektiv fotoaparátu",
      },
      lighting: {
        details:
          "Vyhněte se přímému ostrému světlu, protože by mohlo způsobit odlesky na čárovém kódu a ztížit jeho naskenování. Pokud čárový kód dobře nevidíte, nemusí být dobře čitelný ani pro fotoaparát.",
        details_desktop:
          "Vyhněte se přímému ostrému světlu, protože by mohlo způsobit odlesky na čárovém kódu a ztížit jeho naskenování. Pokud čárový kód dobře nevidíte, nemusí být dobře čitelný ani pro fotoaparát.",
        title: "Dávejte pozor na ostré světlo",
        title_desktop: "Dávejte pozor na ostré světlo",
      },
      visibility: {
        details:
          "Zkontrolujte, zda část čárového kódu nezakrýváte prstem. Také dejte pozor na odlesky, které by mohly zapříčinit, že bude nečitelný.",
        details_desktop:
          "Zkontrolujte, zda část čárového kódu nezakrýváte prstem. Také dejte pozor na odlesky, které by mohly zapříčinit, že bude nečitelný.",
        title: "Nezakrývejte čárový kód",
        title_desktop: "Nezakrývejte čárový kód",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "Při skenování se snažte držet telefon a dokument v klidu. Pohyb může obraz rozmazat a způsobit, že data na dokumentu nebudou čitelná.",
        details_desktop:
          "Při skenování se snažte nebýhat. Pohyb může obraz rozmazat a způsobit, že data na dokumentu nebudou čitelná.",
        title: "Při skenování se nehýbejte",
        title_desktop: "Při skenování se nehýbejte",
      },
      camera_lens: {
        details_desktop:
          "Zkontrolujte, zda na objektivu fotoaparátu nejsou šmouhy nebo prach. Špinavý objektiv způsobuje rozmazání výsledného obrazu, což znemožňuje přečtení údajů v dokumentu a úspěšné naskenování dat.",
        title_desktop: "Vyčistěte objektiv fotoaparátu",
      },
      lighting: {
        details:
          "Vyhněte se přímému ostrému světlu, protože se odráží od dokumentu a může způsobit, že části dokumentu nebudou čitelné. Pokud nelze údaje na dokumentu přečíst, nebudou viditelné ani pro fotoaparát.",
        details_desktop:
          "Vyhněte se přímému ostrému světlu, protože se odráží od dokumentu a může způsobit, že části dokumentu nebudou čitelné. Pokud nelze údaje na dokumentu přečíst, nebudou viditelné ani pro fotoaparát.",
        title: "Dávejte pozor na ostré světlo",
        title_desktop: "Dávejte pozor na ostré světlo",
      },
      visibility: {
        details:
          "Zkontrolujte, zda část čárového kódu nezakrýváte prstem. Také dejte pozor na odlesky, které by mohly zapříčinit, že bude nečitelný.",
        details_desktop:
          "Zkontrolujte, zda část čárového kódu nezakrýváte prstem. Také dejte pozor na odlesky, které by mohly zapříčinit, že bude nečitelný.",
        title: "Nezakrývejte čárový kód",
        title_desktop: "Nezakrývejte čárový kód",
      },
    },
    document_with_mrz: {
      blur: {
        details:
          "Při skenování se snažte držet telefon a dokument v klidu. Pohyb může obraz rozmazat a způsobit, že data na dokumentu nebudou čitelná.",
        details_desktop:
          "Při skenování se snažte nebýhat. Pohyb může obraz rozmazat a způsobit, že data na dokumentu nebudou čitelná.",
        title: "Při skenování se nehýbejte",
        title_desktop: "Při skenování se nehýbejte",
      },
      camera_lens: {
        details_desktop:
          "Zkontrolujte, zda na objektivu fotoaparátu nejsou šmouhy nebo prach. Špinavý objektiv způsobuje rozmazání výsledného obrazu, což znemožňuje přečtení údajů v dokumentu a úspěšné naskenování dat.",
        title_desktop: "Vyčistěte objektiv fotoaparátu",
      },
      lighting: {
        details:
          "Vyhněte se přímému ostrému světlu, protože se odráží od dokumentu a může způsobit, že části dokumentu nebudou čitelné. Pokud nelze údaje na dokumentu přečíst, nebudou viditelné ani pro fotoaparát.",
        details_desktop:
          "Vyhněte se přímému ostrému světlu, protože se odráží od dokumentu a může způsobit, že části dokumentu nebudou čitelné. Pokud nelze údaje na dokumentu přečíst, nebudou viditelné ani pro fotoaparát.",
        title: "Dávejte pozor na ostré světlo",
        title_desktop: "Dávejte pozor na ostré světlo",
      },
      visibility: {
        details:
          "Zkontrolujte, zda část MRZ kódu nezakrýváte prstem. Také dejte pozor na odlesky, které by mohly zapříčinit, že bude nečitelný.",
        details_desktop:
          "Zkontrolujte, zda část MRZ kódu nezakrýváte prstem. Také dejte pozor na odlesky, které by mohly zapříčinit, že bude nečitelný.",
        title: "Nezakrývejte MRZ kód",
        title_desktop: "Nezakrývejte MRZ kód",
      },
    },
    done_btn: "Hotovo",
    done_btn_aria: "Pokračovat ve skenování",
    full_document: {
      blur: {
        details:
          "Při skenování se snažte držet telefon a dokument v klidu. Pohyb může obraz rozmazat a způsobit, že data na dokumentu nebudou čitelná.",
        details_desktop:
          "Při skenování se snažte nebýhat. Pohyb může obraz rozmazat a způsobit, že data na dokumentu nebudou čitelná.",
        title: "Při skenování se nehýbejte",
        title_desktop: "Při skenování se nehýbejte",
      },
      camera_lens: {
        details_desktop:
          "Zkontrolujte, zda na objektivu fotoaparátu nejsou šmouhy nebo prach. Špinavý objektiv způsobuje rozmazání výsledného obrazu, což znemožňuje přečtení údajů v dokumentu a úspěšné naskenování dat.",
        title_desktop: "Vyčistěte objektiv fotoaparátu",
      },
      lighting: {
        details:
          "Vyhněte se přímému ostrému světlu, protože se odráží od dokumentu a může způsobit, že části dokumentu nebudou čitelné. Pokud nelze údaje na dokumentu přečíst, nebudou viditelné ani pro fotoaparát.",
        details_desktop:
          "Vyhněte se přímému ostrému světlu, protože se odráží od dokumentu a může způsobit, že části dokumentu nebudou čitelné. Pokud nelze údaje na dokumentu přečíst, nebudou viditelné ani pro fotoaparát.",
        title: "Dávejte pozor na ostré světlo",
        title_desktop: "Dávejte pozor na ostré světlo",
      },
      visibility: {
        details:
          "Ujistěte se, že prstem nezakrýváte části dokumentu, včetně spodních řádků. Dávejte si také pozor na hologramové odlesky, které přesahují pole dokumentu.",
        details_desktop:
          "Ujistěte se, že prstem nezakrýváte části dokumentu, včetně spodních řádků. Dávejte si také pozor na hologramové odlesky, které přesahují pole dokumentu.",
        title: "Všechna pole musejí být ve viditelném stavu",
        title_desktop: "Všechna pole musejí být ve viditelném stavu",
      },
    },
    next_btn: "Další",
  },
  onboarding_modal: {
    aria: "Pokyny pro skenování",
    barcode_only: {
      details:
        "Najděte čárový kód (řadu černých čar nebo čtvercový kód). Nasměrujte na něj fotoaparát a nehýbejte s ním – skenování proběhne automaticky.",
      details_desktop:
        "Najděte čárový kód (řadu černých čar nebo čtvercový kód). Ujistěte se, že je objektiv fotoaparátu čistý a čárový kód je dobře osvětlený.",
      title: "Najděte a naskenujte čárový kód",
      title_desktop: "Vyčistěte objektiv a najděte čárový kód",
    },
    btn: "Spustit skenování",
    document_with_barcode: {
      details:
        "Různé typy dokumentů se mohou lišit formátem a umístěním čárového kódu. Kód může být jak na přední, tak na zadní straně dokumentu.",
      details_desktop:
        "Najděte čárový kód na přední nebo zadní straně dokumentu. Ujistěte se, že je objektiv fotoaparátu čistý a dokument je dobře osvětlený.",
      title: "Vyhledejte na dokumentu čárový kód",
      title_desktop: "Vyčistěte objektiv a najděte čárový kód",
    },
    document_with_mrz: {
      details:
        "Ve spodní části přední či zadní strany dokumentu najdete dlouhý řetězec znaků, který je rozdělený do 2 nebo 3 řádků a přerušovaný šipkami (<< nebo >>).",
      details_desktop:
        "Najděte MRZ kód na přední nebo zadní straně dokumentu. V dolní části dokumentu najděte 2–3 řádky znaků a symboly šipek (<<). Ujistěte se, že je objektiv fotoaparátu čistý a dokument je dobře osvětlený.",
      title: "Vyhledejte na dokumentu MRZ kód",
      title_desktop: "Vyčistěte objektiv a najděte MRZ kód",
    },
    full_document: {
      details:
        "Ujistěte se, že je dokument dobře osvětlen. Na obrazovce fotoaparátu by měla být vidět všechna pole dokumentu.",
      details_desktop:
        "Ujistěte se, že je objektiv fotoaparátu čistý a dokument je dobře osvětlen. Na obrazovce fotoaparátu by měla být vidět všechna pole dokumentu.",
      title: "Všechny detaily musejí být ve viditelném stavu",
      title_desktop: "Připravte se na skenování",
    },
  },
  sdk_aria: "Obrazovka skenování dokumentu",
  timeout_modal: {
    details:
      "Ujistěte se, že je dokument dobře osvětlený, zcela viditelný a bez odlesků.",
    details_desktop:
      "Ujistěte se, že je objektiv fotoaparátu čistý a že je dokument zcela viditelný, zaostřený a dobře osvětlený.",
    title: "Dokument nelze přečíst",
  },
} as const;
