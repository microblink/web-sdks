/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for cs.
 */
export default {
  feedback_messages: {
    blur_detected: "Držte kartu a telefon v klidu",
    blur_detected_desktop: "Držte kartu a zařízení v klidu",
    camera_angle_too_steep: "Ponechat kartu paralelně s telefonem",
    camera_angle_too_steep_desktop: "Držte kartu rovnoběžně s obrazovkou",
    card_number_scanned: "Úspěch! Strana s číslem karty byla naskenována",
    card_scanned: "Úspěch! Karta byla naskenována",
    document_too_close_to_edge: "Kousek dál",
    flip_card: "Otočte kartu",
    flip_to_back_side: "Otočte kartu",
    move_closer: "Kousek blíž",
    move_farther: "Kousek dál",
    occluded: "Kartu udržujte plně viditelnou",
    scan_the_back_side: "Naskenujte druhou stranu karty",
    scan_the_front_side: "Naskenujte číslo karty",
  },
  help_button: { aria_label: "Nápověda", tooltip: "Potřebujete pomoct?" },
  help_modal: {
    aria: "Nápověda pro skenování",
    back_btn: "Zpět",
    blur: {
      details:
        "Při skenování se snažte držet telefon a kartu v klidu. Pohyb může obraz rozmazat a způsobit, že údaje na kartě nebudou čitelné.",
      details_desktop:
        "Při skenování se snažte držet zařízení a kartu v klidu. Pohyb může obraz rozmazat a způsobit, že údaje na kartě nebudou čitelné.",
      title: "Při skenování se nehýbejte",
    },
    camera_lens: {
      details:
        "Zkontrolujte, zda na objektivu fotoaparátu nejsou šmouhy nebo prach. Špinavý objektiv způsobuje rozmazání výsledného obrazu, což znemožňuje přečtení údajů na kartě a úspěšné naskenování dat.",
      title: "Vyčistěte objektiv fotoaparátu",
    },
    card_number: {
      details:
        "Číslo karty je obvykle 16místné, může však mít 12 až 19 číslic. Mělo by být buď vytištěno, nebo vyraženo reliéfními číslicemi podél karty. Může být na přední nebo zadní straně karty.",
      title: "Kde je číslo karty?",
    },
    done_btn: "Hotovo",
    done_btn_aria: "Pokračovat ve skenování",
    lighting: {
      details:
        "Vyhněte se přímému ostrému světlu, protože se odráží od karty a může způsobit, že její části nebudou čitelné. Pokud nelze údaje na kartě přečíst, nebudou viditelné ani pro fotoaparát.",
      title: "Dávejte pozor na ostré světlo",
    },
    next_btn: "Další",
    occlusion: {
      details:
        "Ujistěte se, že prstem nezakrýváte části karty, včetně spodních řádků. Dávejte si také pozor na hologramové odlesky, které přesahují pole karty.",
      title: "Všechna pole musejí být ve viditelném stavu",
    },
  },
  onboarding_modal: {
    aria: "Pokyny pro skenování",
    btn: "Spustit skenování",
    details:
      "Číslo karty je obvykle 16místné. Mělo by být buď vytištěno, nebo vyraženo reliéfními číslicemi podél karty. Ujistěte se, že je karta dobře osvětlená a všechny údaje jsou viditelné.",
    details_desktop:
      "Číslo karty je obvykle 16místné. Mělo by být buď vytištěno, nebo vyraženo reliéfními číslicemi podél karty. Ujistěte se, že objektiv fotoaparátu je čistý, karta je dobře osvětlená a všechny údaje jsou viditelné.",
    title: "Nejprve naskenujte číslo karty",
  },
  sdk_aria: "Obrazovka skenování karty",
  timeout_modal: {
    cancel_btn: "Storno",
    details: "Kartu nelze načíst. Zkuste to znovu.",
    retry_btn: "Opakovat",
    title: "Skenování neúspěšné",
  },
} as const;
