/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for uz.
 */
export default {
  document_filtered_modal: {
    details: "Boshqa hujjatni skanerlab koʻring",
    title: "Hujjat qabul qilinmadi",
  },
  document_not_recognized_modal: {
    details: "Dastaklanadigan hujjatning old tomonini skanerlang",
    title: "Hujjat aniqlanmadi",
  },
  feedback_messages: {
    blur_detected: "Hujjat va telefonni qimirlatmang",
    camera_angle_too_steep: "Hujjatni telefonga baravar ushlang",
    document_scanned_aria: "Muvaffaqiyat! Hujjat skanerlandi",
    document_too_close_to_edge: "Uzoqlashtiring",
    face_photo_not_fully_visible: "Yuz surati toʻliq koʻrinib tursin",
    flip_document: "Hujjatni boshqa tomonga aylantiring",
    flip_to_back_side: "Orqa tomonga aylantiring",
    front_side_scanned_aria: "Muvaffaqiyat! Old tomon skanerlandi",
    glare_detected:
      "Akslanishni olib tashlash uchun hujjatni eging yoki siljiting",
    keep_document_parallel: "Hujjatni ekranga parallel ushlang",
    keep_document_still: "Hujjat va qurilmani qimirlatmang",
    move_closer: "Yaqinlashtiring",
    move_farther: "Uzoqlashtiring",
    move_left: "Chapdagi sahifaga oʻting",
    move_right: "Oʻngdagi sahifaga oʻting",
    move_top: "Tepadagi sahifaga oʻting",
    occluded: "Hujjat toʻliq koʻrinsin",
    scan_data_page: "Hujjatning maʼlumotlar sahifasini skanerlang",
    scan_last_page_barcode: "Oxirgi sahifadan shtrix-kodni skanerlang",
    scan_left_page: "Chap sahifani skanerlang",
    scan_right_page: "Oʻng sahifani skanerlang",
    scan_the_back_side: "Hujjatning orqa tomonini skanerlang",
    scan_the_barcode: "Shtrix-kodni skanerlash",
    scan_the_front_side: "Hujjatning old tomonini skanerlang",
    scan_top_page: "Yuqori sahifani skanerlang",
    too_bright: "Yorugʻligi kamroq joyga oling",
    too_dark: "Yorugʻroq joyga oling",
    wrong_left: "Chap sahifaga oʻting",
    wrong_right: "Oʻng sahifaga oʻting",
    wrong_top: "Yuqori sahifaga oʻting",
  },
  help_button: { aria_label: "Yordam", tooltip: "Yordam kerakmi?" },
  help_modal: {
    aria: "Skanerlashda yordam",
    back_btn: "Ortga",
    blur: {
      details:
        "Skanerlaganda telefon va hujjatni qimirlatmang. Ulardan istalgan birining qimirlashi rasm xira olinishiga va hujjatdagi maʼlumotlar tushunarsiz chiqishiga sabab boʻlishi mumkin.",
      details_desktop:
        "Skanerlash paytida qurilma va hujjatni imkon qadar qimirlatmang. Qimirlab ketish tasvirni xiralashtirishi va hujjatdagi ma’lumotlarni o‘qib bo‘lmaydigan qilib qo‘yishi mumkin.",
      title: "Skanerlayotganda qimirlatmang",
    },
    camera_lens: {
      details:
        "Kamera linzasida dog‘ yoki chang yo‘qligini tekshiring. Kirlangan linza yakuniy tasvirni xiralashtiradi, bu hujjatdagi maʼlumotlarni o‘qib bo‘lmaydigan qiladi va ma’lumotlarni muvaffaqiyatli skanerlashga to‘sqinlik qiladi.",
      title: "Kamerangiz obyektivini tozalang",
    },
    done_btn: "Tayyor",
    done_btn_aria: "Skanerlashni davom etish",
    lighting: {
      details:
        "Yorqin yorugʻlik bevosita tushmasin, chunki u hujjatda aks etadi va hujjatning ayrim qismlari tushunarsiz boʻlib qolishi mumkin. Hujjatdagi maʼlumotlarni oʻqish imkoni boʻlmasa, ular kamerada ham koʻrinmaydi.",
      title: "Kuchli yorugʻlik tushmasin",
    },
    next_btn: "Keyingisi",
    visibility: {
      details:
        "Barmogʻingiz hujjatning ayrim qismlarini, jumladan, pastki qatorlarni berkitib qoʻymasin. Hujjat maydoni boʻylab oʻtadigan gologramma aks etishiga ham diqqat qarating.",
      title: "Barcha maydonlar koʻrinib tursin",
    },
  },
  onboarding_modal: {
    aria: "Skanerlash yo‘riqnomasi",
    btn: "Skanerlashni boshlash",
    details:
      "Hujjat yetarlicha yoritilganiga ishonch hosil qiling. Hujjatning barcha maydonlari kamera ekranida koʻrinishi kerak.",
    details_desktop:
      "Kamera linzasi tozaligiga, hujjat esa yaxshi yoritilganligiga ishonch hosil qiling. Kamera ekranida barcha hujjat satrlari ko‘rinib turishi kerak.",
    title: "Barcha tafsilotlar koʻrinib tursin",
    title_desktop: "Skanerlashga tayyorlaning",
  },
  sdk_aria: "Hujjat skanerlash ekrani",
  timeout_modal: {
    cancel_btn: "Bekor qilish",
    details: "Hujjatni oʻqish imkonsiz. Qayta urining.",
    retry_btn: "Qayta urining",
    title: "Skanerlandi",
  },
} as const;
