/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for ms.
 */
export default {
  feedback_messages: {
    blur_detected: "Pastikan kad dan telefon tidak bergerak",
    blur_detected_desktop: "Pastikan kad dan peranti tidak bergerak",
    camera_angle_too_steep: "Pastikan kad selari dengan telefon",
    camera_angle_too_steep_desktop: "Pastikan kad selari dengan skrin",
    card_number_scanned: "Berjaya! Sebelah nombor kad diimbas",
    card_scanned: "Berjaya! Kad diimbas",
    document_too_close_to_edge: "Jauhkan lagi",
    flip_card: "Balikkan kad",
    flip_to_back_side: "Balikkan kad",
    move_closer: "Dekatkan lagi",
    move_farther: "Jauhkan lagi",
    occluded: "Pastikan kad jelas kelihatan",
    scan_the_back_side: "Imbas bahagian kad yang sebelah lagi",
    scan_the_front_side: "Imbas nombor kad",
  },
  help_button: { aria_label: "Bantuan", tooltip: "Perlukan bantuan?" },
  help_modal: {
    back_btn: "Kembali",
    blur: {
      details:
        "Cuba kekalkan kedudukan telefon dan kad semasa mengimbas. Menggerakkan kedua-duanya boleh mengaburkan imej dan menjadikan data dalam kad tidak dapat dibaca.",
      details_desktop:
        "Cuba pastikan peranti dan kad tidak bergerak semasa pengimbasan. Pergerakan salah satunya boleh menyebabkan imej menjadi kabur dan data pada kad tidak dapat dibaca.",
      title: "Kekalkan kedudukan semasa mengimbas",
    },
    camera_lens: {
      details:
        "Periksa lensa kamera anda untuk memastikan tiada kesan kotoran atau habuk. Lensa yang kotor akan menyebabkan imej akhir menjadi kabur, menyebabkan butiran kad sukar dibaca dan imbasan data gagal.",
      title: "Bersihkan lensa kamera anda",
    },
    card_number: {
      details:
        "Nombor kad biasanya mempunyai nombor 16 digit, walaupun ia mungkin mempunyai nombor antara 12 hingga 19 digit. Ia hendaklah sama ada dicetak atau dicetak timbul dengan nombor berganda di sepanjang kad. Nombor tersebut boleh berada di bahagian hadapan atau belakang kad anda.",
      title: "Di manakah nombor kad?",
    },
    done_btn: "Siap",
    lighting: {
      details:
        "Jauhi cahaya yang boleh menyilaukan mata kerana cahaya tersebut dipantulkan daripada kad dan boleh membuatkan sebahagian daripada kad tersebut tidak dapat dibaca. Jika anda tidak dapat membaca data dalam kad, data tersebut juga tidak akan kelihatan pada kamera.",
      title: "Jaga-jaga dengan cahaya yang menyilaukan mata",
    },
    next_btn: "Seterusnya",
    occlusion: {
      details:
        "Pastikan anda tidak menutup sebahagian daripada kad dengan jari, termasuk baris bawah. Di samping itu, berhati-hati dengan pantulan hologram yang melintasi medan kad.",
      title: "Pastikan semua medan kelihatan",
    },
  },
  onboarding_modal: {
    btn: "Mula Mengimbas",
    details:
      "Nombor kad biasanya mempunyai nombor 16 digit. Ia hendaklah sama ada dicetak atau dicetak timbul dengan nombor berganda di sepanjang kad. Pastikan kad tersebut menerima pencahayaan yang cukup dan semua butiran dapat dilihat dengan jelas.",
    details_desktop:
      "Nombor pada kad lazimnya mempunyai 16 digit. Nombor ini hendaklah dicetak atau diembos sebagai nombor timbul pada permukaan kad. Pastikan lensa kamera anda bersih, pencahayaan yang mencukupi, dan semua butiran jelas kelihatan.",
    title: "Imbas nombor kad terlebih dahulu",
  },
  timeout_modal: {
    cancel_btn: "Batal",
    details: "Tidak dapat membaca kad. Sila cuba semula.",
    retry_btn: "Cuba semula",
    title: "Pengimbasan tidak berjaya",
  },
} as const;
