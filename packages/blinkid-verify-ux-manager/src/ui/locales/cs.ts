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
    keep_document_still: "Držte dokument a zařízení v klidu",
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
    scan_the_front_side: "Naskenujte přední\\nstranu dokumentu.",
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
    blur: {
      details:
        "Při skenování se snažte držet telefon a dokument v klidu. Pohyb může obraz rozmazat a způsobit, že data na dokumentu nebudou čitelná.",
      details_desktop:
        "Při skenování se snažte držet zařízení a dokument v klidu. Pohyb může obraz rozmazat a způsobit, že data na dokumentu nebudou čitelná.",
      title: "Při skenování se nehýbejte",
    },
    camera_lens: {
      details:
        "Zkontrolujte, zda na objektivu fotoaparátu nejsou šmouhy nebo prach. Špinavý objektiv způsobuje rozmazání výsledného obrazu, což znemožňuje přečtení údajů v dokumentu a úspěšné naskenování dat.",
      title: "Vyčistěte objektiv fotoaparátu",
    },
    done_btn: "Hotovo",
    done_btn_aria: "Pokračovat ve skenování",
    lighting: {
      details:
        "Vyhněte se přímému ostrému světlu, protože se odráží od dokumentu a může způsobit, že části dokumentu nebudou čitelné. Pokud nelze údaje na dokumentu přečíst, nebudou viditelné ani pro fotoaparát.",
      title: "Dávejte pozor na ostré světlo",
    },
    next_btn: "Další",
    visibility: {
      details:
        "Ujistěte se, že prstem nezakrýváte části dokumentu, včetně spodních řádků. Dávejte si také pozor na hologramové odlesky, které přesahují pole dokumentu.",
      title: "Všechna pole musejí být ve viditelném stavu",
    },
  },
  onboarding_modal: {
    aria: "Pokyny pro skenování",
    btn: "Spustit skenování",
    details:
      "Ujistěte se, že je dokument dobře osvětlen. Na obrazovce fotoaparátu by měla být vidět všechna pole dokumentu.",
    details_desktop:
      "Ujistěte se, že je objektiv fotoaparátu čistý a dokument je dobře osvětlen. Na obrazovce fotoaparátu by měla být vidět všechna pole dokumentu.",
    title: "Všechny detaily musejí být ve viditelném stavu",
    title_desktop: "Připravte se na skenování",
  },
  sdk_aria: "Obrazovka skenování dokumentu",
  timeout_modal: {
    cancel_btn: "Storno",
    details: "Dokument se nepodařilo přečíst. Zkuste to znovu.",
    retry_btn: "Opakovat",
    title: "Skenování neúspěšné",
  },
} as const;
