/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for uz.
 */
export default {
  feedback_messages: {
    blur_detected: "Karta va telefonni qimirlatmang",
    blur_detected_desktop: "Karta va qurilmani qimirlatmang",
    camera_angle_too_steep: "Kartani telefonga baravar ushlang",
    camera_angle_too_steep_desktop: "Kartani ekranga baravar ushlang",
    card_number_scanned: "Muvaffaqiyatli! Kartaning raqam tomoni skanerlandi",
    card_scanned: "Muvaffaqiyatli! Karta skanerlandi",
    document_too_close_to_edge: "Uzoqlashtiring",
    flip_card: "Kartani boshqa tomoniga aylantiring",
    flip_to_back_side: "Kartani boshqa tomoniga aylantiring",
    move_closer: "Yaqinlashtiring",
    move_farther: "Uzoqlashtiring",
    occluded: "Karta toʻliq koʻrinsin",
    scan_the_back_side: "Kartaning boshqa tomonini skanerlang",
    scan_the_front_side: "Karta raqamini skanerlang",
  },
  help_button: { aria_label: "Yordam", tooltip: "Yordam kerakmi?" },
  help_modal: {
    aria: "Skanerlashda yordam",
    back_btn: "Ortga",
    blur: {
      details:
        "Skanerlaganda telefon va kartani qimirlatmang. Ulardan istalgan birining qimirlashi rasm xira olinishiga va karta maʼlumotlari tushunarsiz chiqishiga sabab boʻlishi mumkin.",
      details_desktop:
        "Skanerlaganda qurilma va kartani qimirlatmang. Ulardan istalgan birining qimirlashi rasm xira olinishiga va karta maʼlumotlari tushunarsiz chiqishiga sabab boʻlishi mumkin.",
      title: "Skanerlayotganda qimirlatmang",
    },
    camera_lens: {
      details:
        "Kamerangiz obyektivida dogʻ yoki chang yoʻqligini tekshiring. Obyektiv toza boʻlmasa, yakuniy rasm xira olinib, karta tafsilotlari tushunarsiz chiqishi va maʼlumotlarni skanerlashga xalal berishi mumkin.",
      title: "Kamerangiz obyektivini tozalang",
    },
    card_number: {
      details:
        "Karta raqami odatda 16 ta raqamdan iborat, ammo 12–19 ta raqamli boʻlishi ham mumkin. U kartada bosma yoki boʻrtma shaklda tushirilgan boʻlishi kerak. U kartaning old yoki orqa tomonida joylashgan boʻlishi mumkin.",
      title: "Karta raqami qayerda?",
    },
    done_btn: "Tayyor",
    done_btn_aria: "Skanerlashni davom etish",
    lighting: {
      details:
        "Yorqin yorugʻlik bevosita tushmasin, chunki u kartada aks etadi va kartaning ayrim qismlari tushunarsiz boʻlib qolishi mumkin. Karta maʼlumotlarini oʻqish imkoni boʻlmasa, ular kamerada ham koʻrinmaydi.",
      title: "Kuchli yorugʻlik tushmasin",
    },
    next_btn: "Keyingisi",
    occlusion: {
      details:
        "Barmogʻingiz kartaning ayrim qismlarini, jumladan, pastki qatorlarni berkitib qoʻymasin. Karta maydoni boʻylab oʻtadigan gologramma aks etishiga ham diqqat qarating.",
      title: "Barcha maydonlar koʻrinib tursin",
    },
  },
  onboarding_modal: {
    aria: "Skanerlash yo‘riqnomasi",
    btn: "Skanerlashni boshlash",
    details:
      "Karta raqami odatda 16 ta raqamdan iborat. U kartada bosma yoki boʻrtma shaklda tushirilgan boʻlishi kerak. Skanerlaganda yorugʻlik yetarlicha boʻlsin va barcha tafsilotlari koʻrinsin.",
    details_desktop:
      "Karta raqami odatda 16 ta raqamdan iborat. U kartada bosma yoki boʻrtma shaklda tushirilgan boʻlishi kerak. Kamerangiz obyektivi toza, karta yetarlicha yoritilgan boʻlsin va barcha tafsilotlari koʻrinsin.",
    title: "Avval karta raqamini skanerlang",
  },
  sdk_aria: "Karta skanerlash ekrani",
  timeout_modal: {
    cancel_btn: "Bekor qilish",
    details: "Kartani oʻqish imkonsiz. Qayta urining.",
    retry_btn: "Qayta urining",
    title: "Skanerlandi",
  },
} as const;
