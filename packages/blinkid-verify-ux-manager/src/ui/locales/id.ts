/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for id.
 */
export default {
  document_filtered_modal: {
    details: "Coba pindai dokumen yang berbeda.",
    title: "Dokumen tidak diterima",
  },
  document_not_recognized_modal: {
    details: "Pindai sisi depan dokumen yang didukung.",
    title: "Dokumen tak dikenali",
  },
  feedback_messages: {
    blur_detected: "Jaga agar dokumen dan ponsel tidak bergerak",
    camera_angle_too_steep: "Atur agar dokumen tetap sejajar dengan ponsel",
    document_scanned_aria: "Berhasil! Dokumen dipindai",
    document_too_close_to_edge: "Mohon jauhkan",
    face_photo_not_fully_visible:
      "Atur agar foto wajah tetap terlihat sepenuhnya",
    flip_document: "Balik dokumen",
    flip_to_back_side: "Balik dokumen",
    front_side_scanned_aria: "Berhasil! Sisi depan dipindai",
    glare_detected:
      "Miringkan atau pindahkan dokumen untuk menghilangkan pantulan",
    keep_document_parallel: "Pastikan dokumen sejajar dengan layar",
    keep_document_still: "Pastikan dokumen dan perangkat tidak goyang",
    move_closer: "Mohon dekatkan",
    move_farther: "Mohon jauhkan",
    move_left: "Pindah ke halaman di sebelah kiri",
    move_right: "Pindah ke halaman di sebelah kanan",
    move_top: "Pindah ke halaman di atas",
    occluded: "Pastikan dokumen tetap terlihat sepenuhnya",
    scan_data_page: "Memindai halaman data dokumen",
    scan_last_page_barcode: "Pindai kode batang dari halaman terakhir",
    scan_left_page: "Pindai halaman kiri",
    scan_right_page: "Pindai halaman kanan",
    scan_the_back_side: "Pindai sisi belakang dokumen",
    scan_the_barcode: "Pindai kode batang",
    scan_the_front_side: "Pindai sisi depan\\ndokumen.",
    scan_top_page: "Pindai halaman atas",
    too_bright: "Pindah ke tempat dengan pencahayaan yang lebih sedikit",
    too_dark: "Pindah ke tempat yang lebih terang",
    wrong_left: "Pindah ke halaman kiri",
    wrong_right: "Pindah ke halaman kanan",
    wrong_top: "Pindah ke halaman atas",
  },
  help_button: { aria_label: "Bantuan", tooltip: "Perlu bantuan?" },
  help_modal: {
    aria: "Bantuan pemindaian",
    back_btn: "Kembali",
    blur: {
      details:
        "Pastikan ponsel dan dokumen tidak bergerak saat pemindaian. Jika bergerak, gambar bisa kabur atau data di dokumen tidak terbaca.",
      details_desktop:
        "Pastikan perangkat dan dokumen tidak goyang saat pemindaian. Jika bergerak, gambar bisa kabur atau data di dokumen tidak terbaca.",
      title: "Pastikan dokumen tidak bergerak saat pemindaian",
    },
    camera_lens: {
      details:
        "Pastikan tidak ada noda atau debu pada lensa kamera. Jika lensa kotor, hasil gambar menjadi buram. Akibatnya, detail dokumen tidak dapat terbaca dan data gagal dipindai.",
      title: "Bersihkan lensa kamera",
    },
    done_btn: "Selesai",
    done_btn_aria: "Lanjutkan pemindaian",
    lighting: {
      details:
        "Hindari sorot cahaya tajam karena dapat memantul dari dokumen dan menyebabkan bagian dokumen tidak terbaca. Akibatnya, data di dokumen juga tidak akan terlihat di kamera.",
      title: "Waspadai cahaya tajam",
    },
    next_btn: "Berikutnya",
    visibility: {
      details:
        "Pastikan jari Anda tidak menutupi bagian mana pun dari dokumen, termasuk baris paling bawah. Waspadai juga pantulan hologram yang menerpa bagian dokumen.",
      title: "Pastikan semua bagian terlihat",
    },
  },
  onboarding_modal: {
    aria: "Petunjuk Pemindaian",
    btn: "Mulai Pemindaian",
    details:
      "Pastikan dokumen cukup diterangi cahaya. Semua bagian dokumen harus terlihat di layar kamera.",
    details_desktop:
      "Pastikan lensa kamera bersih dan dokumen cukup terang. Semua bagian dokumen harus terlihat di layar kamera.",
    title: "Pastikan semua detail terlihat",
    title_desktop: "Bersiap memindai",
  },
  sdk_aria: "Layar pemindaian dokumen",
  timeout_modal: {
    cancel_btn: "Batal",
    details: "Tak dapat membaca dokumen. Silakan coba lagi.",
    retry_btn: "Coba Lagi",
    title: "Pemindaian gagal",
  },
} as const;
