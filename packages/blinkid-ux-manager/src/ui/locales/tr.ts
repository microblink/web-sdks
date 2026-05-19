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
  error_modal: { cancel_btn: "İptal", retry_btn: "Tekrar dene" },
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
    keep_still: "Sabit tutun",
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
    scan_the_barcode_side: "Belgenin barkodlu tarafını tarayın",
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
    barcode_only: {
      blur: {
        details:
          "Tarama sırasında telefonu ve barkodu sabit tutmaya özen gösterin. Herhangi birinin hareket etmesi görüntüyü bulanıklaştırıp barkodun okunmasını zorlaştırabilir.",
        details_desktop:
          "Tarama yaparken sabit durmaya çalışın. Hareket etmek görüntüyü bulanıklaştırabilir ve barkodun okunmasını zorlaştırabilir.",
        title: "Tarama sırasında hareketsiz kal",
        title_desktop: "Tarama sırasında hareketsiz kal",
      },
      camera_lens: {
        details_desktop:
          "Kamera lensinizde leke veya toz olup olmadığını kontrol edin. Kirli bir lens görüntünün bulanıklaşmasına neden olarak barkodu okunmaz hale getirir ve verinin başarıyla taranmasını engeller.",
        title_desktop: "Kamera lenslerinizi temizleyin",
      },
      lighting: {
        details:
          "Doğrudan ve yoğun ışıktan kaçının; bu durum barkodun üzerinde parlama yaparak taranmasını zorlaştırır. Eğer barkod gözünüze net görünmüyorsa, büyük ihtimalle kamera da okuyamayacaktır.",
        details_desktop:
          "Doğrudan ve yoğun ışıktan kaçının; bu durum barkodun üzerinde parlama yaparak taranmasını zorlaştırır. Eğer barkod gözünüze net görünmüyorsa, büyük ihtimalle kamera da okuyamayacaktır.",
        title: "Sert ışığa dikkat et",
        title_desktop: "Sert ışığa dikkat et",
      },
      visibility: {
        details:
          "Barkodun hiçbir bölümünü parmağınızla kapatmadığınızdan emin olun. Ayrıca, barkodun üzerinde parlayarak okunmasını engelleyebilecek ışık yansımalarına da dikkat edin.",
        details_desktop:
          "Barkodun hiçbir bölümünü parmağınızla kapatmadığınızdan emin olun. Ayrıca, barkodun üzerinde parlayarak okunmasını engelleyebilecek ışık yansımalarına da dikkat edin.",
        title: "Barkodun görünür olduğundan emin olun",
        title_desktop: "Barkodun görünür olduğundan emin olun",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "Tarama sırasında telefonu ve belgeyi sabit tutmaya çalış. Telefon veya belgenin hareket etmesi görüntüyü bulanıklaştırabilir ve belgedeki verileri okunmaz hâle getirebilir.",
        details_desktop:
          "Tarama sırasında cihazı sabit tutmaya çalışın. Hareket ettirmek görüntüyü bulanıklaştırarak belgedeki bilgilerin okunmasını zorlaştırabilir.",
        title: "Tarama sırasında hareketsiz kal",
        title_desktop: "Tarama sırasında hareketsiz kal",
      },
      camera_lens: {
        details_desktop:
          "Kamera lensinizin lekeli veya tozlu olup olmadığını kontrol edin. Lens kirliyse görüntü bulanık çıkar; bu da belge üzerindeki bilgilerin okunamamasına ve verilerin başarıyla taranamamasına yol açar.",
        title_desktop: "Kamera lenslerinizi temizleyin",
      },
      lighting: {
        details:
          "Doğrudan gelen sert ışık belgeden yansıyarak belgenin bazı kısımlarını okunmaz hâle getirebileceği için bu tür ışık kullanmaktan kaçın. Belgedeki verileri okuyamıyorsan bu veriler kamerada da görünmeyecektir.",
        details_desktop:
          "Doğrudan gelen sert ışık belgeden yansıyarak belgenin bazı kısımlarını okunmaz hâle getirebileceği için bu tür ışık kullanmaktan kaçın. Belgedeki verileri okuyamıyorsan bu veriler kamerada da görünmeyecektir.",
        title: "Sert ışığa dikkat et",
        title_desktop: "Sert ışığa dikkat et",
      },
      visibility: {
        details:
          "Barkodun hiçbir bölümünü parmağınızla kapatmadığınızdan emin olun. Ayrıca, barkodun üzerinde parlayarak okunmasını engelleyebilecek ışık yansımalarına da dikkat edin.",
        details_desktop:
          "Barkodun hiçbir bölümünü parmağınızla kapatmadığınızdan emin olun. Ayrıca, barkodun üzerinde parlayarak okunmasını engelleyebilecek ışık yansımalarına da dikkat edin.",
        title: "Barkodun görünür olduğundan emin olun",
        title_desktop: "Barkodun görünür olduğundan emin olun",
      },
    },
    done_btn: "Bitti",
    done_btn_aria: "Taramaya devam et",
    full_document: {
      blur: {
        details:
          "Tarama sırasında telefonu ve belgeyi sabit tutmaya çalış. Telefon veya belgenin hareket etmesi görüntüyü bulanıklaştırabilir ve belgedeki verileri okunmaz hâle getirebilir.",
        details_desktop:
          "Tarama sırasında cihazı sabit tutmaya çalışın. Hareket ettirmek görüntüyü bulanıklaştırarak belgedeki bilgilerin okunmasını zorlaştırabilir.",
        title: "Tarama sırasında hareketsiz kal",
        title_desktop: "Tarama sırasında hareketsiz kal",
      },
      camera_lens: {
        details_desktop:
          "Kamera lensinizin lekeli veya tozlu olup olmadığını kontrol edin. Lens kirliyse görüntü bulanık çıkar; bu da belge üzerindeki bilgilerin okunamamasına ve verilerin başarıyla taranamamasına yol açar.",
        title_desktop: "Kamera lenslerinizi temizleyin",
      },
      lighting: {
        details:
          "Doğrudan gelen sert ışık belgeden yansıyarak belgenin bazı kısımlarını okunmaz hâle getirebileceği için bu tür ışık kullanmaktan kaçın. Belgedeki verileri okuyamıyorsan bu veriler kamerada da görünmeyecektir.",
        details_desktop:
          "Doğrudan gelen sert ışık belgeden yansıyarak belgenin bazı kısımlarını okunmaz hâle getirebileceği için bu tür ışık kullanmaktan kaçın. Belgedeki verileri okuyamıyorsan bu veriler kamerada da görünmeyecektir.",
        title: "Sert ışığa dikkat et",
        title_desktop: "Sert ışığa dikkat et",
      },
      visibility: {
        details:
          "Alt satırlar da dâhil olmak üzere, belgenin hiçbir bölümünü parmağınla kapatmadığından emin ol. Ayrıca, belge alanlarının üzerini kapatan hologram yansımalarına da dikkat et.",
        details_desktop:
          "Alt satırlar da dâhil olmak üzere, belgenin hiçbir bölümünü parmağınla kapatmadığından emin ol. Ayrıca, belge alanlarının üzerini kapatan hologram yansımalarına da dikkat et.",
        title: "Tüm alanları görünür hâlde tut",
        title_desktop: "Tüm alanları görünür hâlde tut",
      },
    },
    next_btn: "Sonraki",
  },
  onboarding_modal: {
    aria: "Tarama Talimatları",
    barcode_only: {
      details:
        "Bir barkod (yan yana siyah çizgiler veya bir karekod) bulun. Kameranızı barkoda doğru tutup sabit bekleyin; tarama otomatik olarak yapılacaktır.",
      details_desktop:
        "Bir barkod (siyah çizgilerden oluşan bir dizi veya bir karekod) arayın. Kamera lensinizin temiz ve barkodun iyi aydınlatılmış olduğundan emin olun.",
      title: "Barkodu bulun ve tarayın",
      title_desktop: "Kamera lensinizi temizleyin ve barkodu bulun",
    },
    btn: "Taramayı Başlat",
    document_with_barcode: {
      details:
        "Farklı kimlik türlerinin barkod formatları ve konumları değişiklik gösterebilir. Barkod için kimliğin ön ve arka yüzüne bakın.",
      details_desktop:
        "Kimliğin ön ve arka yüzünde barkod olup olmadığını kontrol edin. Kamera lensinizin temiz ve belgenin iyi aydınlatılmış olduğundan emin olun.",
      title: "Kimlik üzerindeki barkodu bulun",
      title_desktop: "Kamera lensinizi temizleyin ve barkodu bulun",
    },
    full_document: {
      details:
        "Belgenin iyi aydınlatıldığından emin ol. Tüm belge alanları kamera ekranında görünür olmalıdır.",
      details_desktop:
        "Kamera lensinizin temiz olduğundan ve belgenin iyi aydınlatıldığından emin olun. Belgenin her yeri kamera ekranında görünür olmalıdır.",
      title: "Tüm ayrıntıları görünür hâlde tut",
      title_desktop: "Taramaya hazırlanın",
    },
  },
  sdk_aria: "Belge tarama ekranı",
  timeout_modal: {
    details: "Belge okunamıyor. Lütfen tekrar dene.",
    title: "Tarama başarısız",
  },
} as const;
