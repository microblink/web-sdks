/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for tr.
 */
export default {
  feedback_messages: {
    blur_detected: "Kartı ve telefonu sabit tutun.",
    blur_detected_desktop: "Kartı ve cihazı sabit tutun.",
    camera_angle_too_steep: "Kartı telefonla paralel tutun.",
    camera_angle_too_steep_desktop: "Kartı ekrana paralel tutun",
    card_number_scanned: "Başarılı! Kart numarasının bulunduğu taraf tarandı",
    card_scanned: "Başarılı! Kart tarandı",
    document_too_close_to_edge: "Uzaklaş",
    flip_card: "Kartı ters çevir",
    flip_to_back_side: "Kartı ters çevir",
    move_closer: "Yaklaş",
    move_farther: "Uzaklaş",
    occluded: "Kartın tamamını görünür şekilde tutun.",
    scan_the_back_side: "Kartın diğer tarafını tarayın",
    scan_the_front_side: "Kart numarasını tara",
  },
  help_button: { aria_label: "Yardım", tooltip: "Yardıma mı ihtiyacın var?" },
  help_modal: {
    aria: "Tarama yardımı",
    back_btn: "Geri",
    blur: {
      details:
        "Tarama sırasında telefonu ve kartı sabit tutmaya çalış. Telefon veya kartın hareket etmesi görüntüyü bulanıklaştırabilir ve karttaki verileri okunmaz hâle getirebilir.",
      details_desktop:
        "Tarama sırasında cihazı ve kartı mümkün olduğunca sabit tutmaya çalışın. Herhangi birinin hareket etmesi görüntünün bulanıklaşmasına ve kart üzerindeki bilgilerin okunamamasına neden olabilir.",
      title: "Tarama sırasında hareketsiz kal",
    },
    camera_lens: {
      details:
        "Kamera lensinizi leke veya toz açısından kontrol edin. Kirli bir lens, görüntünün bulanık çıkmasına neden olur; bu da kart üzerindeki bilgilerin okunamamasına ve verilerin başarıyla taranamamasına yol açar.",
      title: "Kamera lenslerinizi temizleyin",
    },
    card_number: {
      details:
        "Kart numarası, genellikle 16 haneli, ancak kimi zaman 12 ila 19 haneli de olabilen bir sayıdır. Kartın üzerinde kabartmalı rakamlarla basılı veya kabartmalı olmalıdır. Kartınızın ön veya arka yüzünde bulunabilir.",
      title: "Kart numarası nerede?",
    },
    done_btn: "Bitti",
    done_btn_aria: "Taramaya devam et",
    lighting: {
      details:
        "Doğrudan gelen sert ışık karttan yansıyarak kartın bazı kısımlarını okunmaz hâle getirebileceği için bu tür ışık kullanmaktan kaçın. Karttaki verileri okuyamıyorsan bu veriler kamerada da görünmeyecektir.",
      title: "Sert ışığa dikkat et",
    },
    next_btn: "Sonraki",
    occlusion: {
      details:
        "Alt satırlar da dâhil olmak üzere, kartın hiçbir bölümünü parmağınla kapatmadığından emin ol. Ayrıca, kart alanlarının üzerini kapatan hologram yansımalarına da dikkat et.",
      title: "Tüm alanları görünür hâlde tut",
    },
  },
  onboarding_modal: {
    aria: "Tarama Talimatları",
    btn: "Taramayı Başlat",
    details:
      "Kart numarası, genellikle 16 haneli bir sayıdır. Kartın üzerinde kabartmalı rakamlarla basılı veya kabartmalı olmalıdır. Kartın iyi aydınlatılmış ve tüm bilgilerin görünür olduğundan emin ol.",
    details_desktop:
      "Kart numarası genellikle 16 haneli bir sayıdır. Kartın üzerinde basılı olarak ya da kabartmalı (yükseltilmiş) rakamlarla yer alır. Kamera lensinizin temiz olduğundan, kartın yeterince aydınlatıldığından ve tüm bilgilerin net şekilde göründüğünden emin olun.",
    title: "Önce kart numarasını tara",
  },
  sdk_aria: "Kart tarama ekranı",
  timeout_modal: {
    cancel_btn: "İptal",
    details: "Kart okunamadı. Lütfen tekrar deneyin.",
    retry_btn: "Tekrar dene",
    title: "Tarama başarısız",
  },
} as const;
