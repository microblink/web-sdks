/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for id.
 */
export default {
  feedback_messages: {
    blur_detected: "Pastikan kartu dan ponsel tidak goyang",
    blur_detected_desktop: "Pastikan kartu dan perangkat tidak goyang",
    camera_angle_too_steep: "Jaga kartu tetap sejajar dengan ponsel",
    camera_angle_too_steep_desktop: "Pastikan kartu sejajar dengan layar",
    card_number_scanned: "Berhasil! Sisi nomor kartu sudah dipindai",
    card_scanned: "Berhasil! Kartu sudah dipindai",
    document_too_close_to_edge: "Mohon jauhkan",
    flip_card: "Balik kartu",
    flip_to_back_side: "Balik kartu",
    move_closer: "Mohon dekatkan",
    move_farther: "Mohon jauhkan",
    occluded: "Kartu harus terlihat sepenuhnya",
    scan_the_back_side: "Pindai sisi lain kartu",
    scan_the_front_side: "Pindai nomor kartu",
  },
  help_button: { aria_label: "Bantuan", tooltip: "Perlu bantuan?" },
  help_modal: {
    aria: "Bantuan pemindaian",
    back_btn: "Kembali",
    blur: {
      details:
        "Usahakan ponsel dan kartu tetap diam saat memindai. Menggerakkan ponsel dapat mengaburkan gambar dan membuat data di kartu tidak dapat dibaca.",
      details_desktop:
        "Usahakan perangkat dan kartu tidak goyang saat memindai. Jika goyang, hasil gambar menjadi buram dan data di kartu tidak dapat terbaca.",
      title: "Pastikan dokumen tidak bergerak saat pemindaian",
    },
    camera_lens: {
      details:
        "Pastikan tidak ada noda atau debu pada lensa kamera. Jika lensa kotor, hasil gambar menjadi buram. Akibatnya, detail kartu tidak dapat terbaca dan data gagal dipindai.",
      title: "Bersihkan lensa kamera",
    },
    card_number: {
      details:
        "Nomor kartu biasanya berupa angka 16 digit, meski mungkin antara 12 dan 19 digit. Nomor itu mestinya dicetak atau diembos dengan angka timbul di kartu. Pastikan kartu cukup terang dan semua detail terlihat.",
      title: "Di mana letak nomor kartu?",
    },
    done_btn: "Selesai",
    done_btn_aria: "Lanjutkan pemindaian",
    lighting: {
      details:
        "Hindari cahaya silau yang langsung karena memantul dari kartu dan akibatnya bagian kartu tidak terbaca. Jika Anda tidak dapat membaca data pada kartu, data juga tidak akan terlihat oleh kamera.",
      title: "Waspadai cahaya tajam",
    },
    next_btn: "Berikutnya",
    occlusion: {
      details:
        "Pastikan bagian kartu tidak tertutup jari, termasuk garis bawah. Perhatikan juga pantulan hologram yang melewati bidang kartu.",
      title: "Pastikan semua bagian terlihat",
    },
  },
  onboarding_modal: {
    aria: "Petunjuk Pemindaian",
    btn: "Mulai Pemindaian",
    details:
      "Nomor kartu biasanya berupa angka 16 digit. Nomor itu mestinya dicetak atau diembos dengan angka timbul di kartu. Pastikan kartu cukup terang dan semua detail terlihat.",
    details_desktop:
      "Nomor kartu biasanya berupa 16 digit angka cetak atau embos dengan angka timbul pada kartu. Pastikan lensa kamera bersih, kartu cukup terang, dan semua detailnya terlihat.",
    title: "Pindai nomor kartu terlebih dahulu",
  },
  sdk_aria: "Layar pemindaian kartu",
  timeout_modal: {
    cancel_btn: "Batal",
    details: "Kartu tidak dapat terbaca. Coba lagi.",
    retry_btn: "Coba Lagi",
    title: "Pemindaian gagal",
  },
} as const;
