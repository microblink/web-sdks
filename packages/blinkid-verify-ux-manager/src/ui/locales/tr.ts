/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for tr.
 */
export default {
  document_filtered_modal: {
    details: "Farklı bir belge taramayı dene.",
    title: "Belge kabul edilmedi",
  },
  document_not_recognized_modal: {
    details: "Desteklenen bir belgenin ön tarafını tara.",
    title: "Belge tanınmadı",
  },
  feedback_messages: {
    blur_detected: "Belgeyi ve telefonu sabit tut",
    camera_angle_too_steep: "Belgeyi telefona paralel tut",
    document_scanned_aria: "Başarılı! Belge tarandı",
    document_too_close_to_edge: "Uzaklaş",
    face_photo_not_fully_visible:
      "Yüz fotoğrafının tam olarak görünür şekilde tut",
    flip_document: "Belgeyi çevir",
    flip_to_back_side: "Arka tarafa çevir",
    front_side_scanned_aria: "Başarılı! Ön taraf tarandı",
    glare_detected: "Yansımayı gidermek için belgeyi eğ veya hareket ettir",
    keep_document_parallel: "Belgeyi ekrana paralel tutun",
    keep_document_still: "Belgeyi ve cihazı sabit tutun",
    move_closer: "Yaklaş",
    move_farther: "Uzaklaş",
    move_left: "Soldaki sayfaya geç",
    move_right: "Sağdaki sayfaya geç",
    move_top: "Sayfanın en üstüne git",
    occluded: "Belgeyi tamamen görünür şekilde tut",
    scan_data_page: "Belgenin veri sayfasını tara.",
    scan_last_page_barcode: "Son sayfadaki barkodu tara",
    scan_left_page: "Soldaki sayfayı tara",
    scan_right_page: "Sağdaki sayfayı tara",
    scan_the_back_side: "Belgenin arka tarafını tara",
    scan_the_barcode: "Barkodu tara",
    scan_the_front_side: "Belgenin ön tarafını tara",
    scan_top_page: "En üst sayfayı tara",
    too_bright: "Daha az ışık olan bir noktaya geç",
    too_dark: "Daha aydınlık bir noktaya geç",
    wrong_left: "Soldaki sayfaya geç",
    wrong_right: "Sağdaki sayfaya geç",
    wrong_top: "En üst sayfaya geç",
  },
  help_button: { aria_label: "Yardım", tooltip: "Yardıma mı ihtiyacın var?" },
  help_modal: {
    aria: "Tarama yardımı",
    back_btn: "Geri",
    blur: {
      details:
        "Tarama sırasında telefonu ve belgeyi sabit tutmaya çalış. Telefon veya belgenin hareket etmesi görüntüyü bulanıklaştırabilir ve belgedeki verileri okunmaz hâle getirebilir.",
      details_desktop:
        "Tarama sırasında cihazı ve belgeyi mümkün olduğunca sabit tutmaya çalışın. Herhangi birinin hareket etmesi görüntünün bulanıklaşmasına ve belge üzerindeki bilgilerin okunamamasına neden olabilir.",
      title: "Tarama sırasında hareketsiz kal",
    },
    camera_lens: {
      details:
        "Kamera lensinizin lekeli veya tozlu olup olmadığını kontrol edin. Lens kirliyse görüntü bulanık çıkar; bu da belge üzerindeki bilgilerin okunamamasına ve verilerin başarıyla taranamamasına yol açar.",
      title: "Kamera lenslerinizi temizleyin",
    },
    done_btn: "Bitti",
    done_btn_aria: "Taramaya devam et",
    lighting: {
      details:
        "Doğrudan gelen sert ışık belgeden yansıyarak belgenin bazı kısımlarını okunmaz hâle getirebileceği için bu tür ışık kullanmaktan kaçın. Belgedeki verileri okuyamıyorsan bu veriler kamerada da görünmeyecektir.",
      title: "Sert ışığa dikkat et",
    },
    next_btn: "Sonraki",
    visibility: {
      details:
        "Alt satırlar da dâhil olmak üzere, belgenin hiçbir bölümünü parmağınla kapatmadığından emin ol. Ayrıca, belge alanlarının üzerini kapatan hologram yansımalarına da dikkat et.",
      title: "Tüm alanları görünür hâlde tut",
    },
  },
  onboarding_modal: {
    aria: "Tarama Talimatları",
    btn: "Taramayı Başlat",
    details:
      "Belgenin iyi aydınlatıldığından emin ol. Tüm belge alanları kamera ekranında görünür olmalıdır.",
    details_desktop:
      "Kamera lensinizin temiz olduğundan ve belgenin iyi aydınlatıldığından emin olun. Belgenin her yeri kamera ekranında görünür olmalıdır.",
    title: "Tüm ayrıntıları görünür hâlde tut",
    title_desktop: "Taramaya hazırlanın",
  },
  sdk_aria: "Belge tarama ekranı",
  timeout_modal: {
    cancel_btn: "İptal",
    details: "Belge okunamıyor. Lütfen tekrar dene.",
    retry_btn: "Tekrar dene",
    title: "Tarama başarısız",
  },
} as const;
