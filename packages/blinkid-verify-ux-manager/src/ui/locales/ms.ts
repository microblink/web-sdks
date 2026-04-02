/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for ms.
 */
export default {
  document_filtered_modal: {
    details: "Cuba imbas dokumen yang berbeza.",
    title: "Dokumen tidak diterima",
  },
  document_not_recognized_modal: {
    details: "Imbas bahagian hadapan dokumen yang disokong.",
    title: "Dokumen tidak dikenali",
  },
  feedback_messages: {
    blur_detected: "Pastikan dokumen dan telefon tidak bergegar",
    camera_angle_too_steep: "Pastikan dokumen sentiasa selari dengan telefon",
    document_scanned_aria: "Berjaya! Dokumen telah diimbas",
    document_too_close_to_edge: "Jauhkan lagi",
    face_photo_not_fully_visible:
      "Pastikan gambar muka dapat dilihat sepenuhnya",
    flip_document: "Putar dokumen",
    flip_to_back_side: "Balikkan dokumen",
    front_side_scanned_aria: "Berjaya! Bahagian hadapan telah diimbas",
    glare_detected:
      "Sengetkan atau gerakkan dokumen untuk mengelakkan pantulan cahaya",
    keep_document_parallel: "Pastikan dokumen sentiasa selari dengan skrin",
    keep_document_still: "Pastikan dokumen dan peranti tidak bergegar",
    move_closer: "Dekatkan lagi",
    move_farther: "Jauhkan lagi",
    move_left: "Beralih ke halaman di sebelah kiri",
    move_right: "Pergi ke halaman di sebelah kanan",
    move_top: "Beralih ke halaman di sebelah atas",
    occluded: "Sentiasa pastikan dokumen dapat dilihat sepenuhnya",
    scan_data_page: "Imbas halaman data dokumen",
    scan_last_page_barcode: "Imbas kod bar daripada halaman terakhir",
    scan_left_page: "Imbas halaman sebelah kiri",
    scan_right_page: "Imbas halaman sebelah kanan",
    scan_the_back_side: "Imbas bahagian belakang dokumen",
    scan_the_barcode: "Imbas kod bar",
    scan_the_front_side: "Imbas bahagian hadapan\\ndokumen",
    scan_top_page: "Imbas halaman sebelah atas",
    too_bright: "Beralih ke tempat yang kurang pencahayaan",
    too_dark: "Beralih ke tempat yang lebih cerah",
    wrong_left: "Beralih ke halaman sebelah kiri",
    wrong_right: "Beralih ke halaman sebelah kanan",
    wrong_top: "Beralih ke halaman sebelah atas",
  },
  help_button: { aria_label: "Bantuan", tooltip: "Perlukan bantuan?" },
  help_modal: {
    aria: "Bantuan mengimbas",
    back_btn: "Kembali",
    blur: {
      details:
        "Cuba kekalkan kedudukan telefon dan dokumen semasa mengimbas. Menggerakkan kedua-duanya boleh mengaburkan imej dan menjadikan data dalam dokumen tidak dapat dibaca.",
      details_desktop:
        "Cuba kekalkan kedudukan peranti dan dokumen semasa mengimbas. Menggerakkan kedua-duanya boleh mengaburkan imej dan menjadikan data dalam dokumen tidak dapat dibaca.",
      title: "Kekalkan kedudukan semasa mengimbas",
    },
    camera_lens: {
      details:
        "Periksa lensa kamera anda untuk memastikan tiada kesan kotoran atau habuk. Lensa yang kotor akan menyebabkan imej akhir menjadi kabur, menyebabkan butiran dokumen sukar dibaca dan imbasan data gagal.",
      title: "Bersihkan lensa kamera anda",
    },
    done_btn: "Siap",
    done_btn_aria: "Sambung mengimbas",
    lighting: {
      details:
        "Jauhi cahaya yang boleh menyilaukan mata kerana cahaya tersebut dipantulkan daripada dokumen dan boleh membuatkan sebahagian daripada dokumen tersebut tidak dapat dibaca. Jika anda tidak dapat membaca data dalam dokumen, data tersebut juga tidak akan kelihatan pada kamera.",
      title: "Jaga-jaga dengan cahaya yang menyilaukan mata",
    },
    next_btn: "Seterusnya",
    visibility: {
      details:
        "Pastikan anda tidak menutup sebahagian daripada dokumen dengan jari, termasuk baris bawah. Di samping itu, berhati-hati dengan pantulan hologram yang melintasi medan dokumen.",
      title: "Pastikan semua medan kelihatan",
    },
  },
  onboarding_modal: {
    aria: "Arahan Mengimbas",
    btn: "Mula Mengimbas",
    details:
      "Pastikan dokumen anda menerima pencahayaan yang cukup. Semua medan dokumen hendaklah kelihatan pada skrin kamera.",
    details_desktop:
      "Pastikan lensa kamera anda bersih dan dokumen anda menerima pencahayaan yang cukup. Semua medan dokumen hendaklah kelihatan pada skrin kamera.",
    title: "Pastikan semua butiran kelihatan",
    title_desktop: "Sedia untuk imbas",
  },
  sdk_aria: "Skrin mengimbas dokumen",
  timeout_modal: {
    cancel_btn: "Batal",
    details: "Tidak dapat membaca dokumen. Sila cuba semula.",
    retry_btn: "Cuba semula",
    title: "Pengimbasan tidak berjaya",
  },
} as const;
