/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for fi.
 */
export default {
  document_filtered_modal: {
    details: "Yritä skannata toinen asiakirja.",
    title: "Asiakirjaa ei hyväksytty",
  },
  document_not_recognized_modal: {
    details: "Skannaa tuetun asiakirjan etupuoli.",
    title: "Asiakirjaa ei tunnistettu",
  },
  feedback_messages: {
    blur_detected: "Pidä asiakirja ja puhelin paikallaan",
    camera_angle_too_steep: "Pidä asiakirja puhelimen suuntaisena",
    document_scanned_aria: "Onnistui! Asiakirja skannattu",
    document_too_close_to_edge: "Siirry kauemmas",
    face_photo_not_fully_visible: "Pidä kasvokuva täysin näkyvissä",
    flip_document: "Käännä asiakirja ympäri",
    flip_to_back_side: "Käännä taustapuoli näkyviin",
    front_side_scanned_aria: "Onnistui! Etupuoli skannattu",
    glare_detected: "Kallista tai siirrä asiakirjaa heijastuksen poistamiseksi",
    keep_document_parallel: "Pidä asiakirja näytön suuntaisena",
    keep_document_still: "Pidä asiakirja ja laite paikoillaan",
    move_closer: "Siirry lähemmäs",
    move_farther: "Siirry kauemmas",
    move_left: "Siirry vasemmalla olevalle sivulle",
    move_right: "Siirry oikealla olevalle sivulle",
    move_top: "Siirry yläpuolella olevalle sivulle",
    occluded: "Pidä asiakirja täysin näkyvissä",
    scan_data_page: "Skannaa asiakirjan tietosivu",
    scan_last_page_barcode: "Lue viivakoodi viimeiseltä sivulta",
    scan_left_page: "Skannaa vasen sivu",
    scan_right_page: "Skannaa oikea sivu",
    scan_the_back_side: "Skannaa asiakirjan taustapuoli",
    scan_the_barcode: "Skannaa viivakoodi",
    scan_the_front_side: "Skannaa asiakirjan etupuoli",
    scan_top_page: "Skannaa yläsivu",
    too_bright: "Siirry himmeämmin valaistuun paikkaan",
    too_dark: "Siirry kirkkaampaan paikkaan",
    wrong_left: "Siirry vasemmalle sivulle",
    wrong_right: "Siirry oikealle sivulle",
    wrong_top: "Siirry yläsivulle",
  },
  help_button: { aria_label: "Ohje", tooltip: "Tarvitsetko apua?" },
  help_modal: {
    aria: "Apua skannaukseen",
    back_btn: "Takaisin",
    blur: {
      details:
        "Yritä pitää puhelin ja asiakirja paikallaan skannauksen aikana. Jommankumman liikkuminen voi tehdä kuvasta epäselvän ja asiakirjan tiedoista lukukelvottomia.",
      details_desktop:
        "Yritä pitää laite ja asiakirja paikoillaan skannauksen aikana. Jommankumman liikkuminen voi sumentaa kuvaa ja tehdä asiakirjan tiedoista lukukelvottomia.",
      title: "Pysy paikallasi skannauksen aikana",
    },
    camera_lens: {
      details:
        "Tarkista kameran linssi tahrojen tai pölyn varalta. Likainen linssi aiheuttaa lopullisen kuvan sumenemista ja tekee asiakirjan tiedoista lukukelvottomia, jolloin tietojen skannaus ei onnistu.",
      title: "Puhdista kameran linssi",
    },
    done_btn: "Valmis",
    done_btn_aria: "Jatka skannausta",
    lighting: {
      details:
        "Vältä suoraa voimakasta valoa, koska se heijastuu asiakirjasta ja voi tehdä osia siitä lukukelvottomiksi. Jos et pysty lukemaan asiakirjan tietoja, ne eivät näy myöskään kameralle.",
      title: "Varo voimakasta valoa",
    },
    next_btn: "Seuraava",
    visibility: {
      details:
        "Varmista, ettet peitä sormella mitään asiakirjan osia, myöskään alarivejä. Varo myös asiakirjan kenttien päälle tulevia hologrammien heijastuksia.",
      title: "Pidä kaikki kentät näkyvissä",
    },
  },
  onboarding_modal: {
    aria: "Skannausohjeet",
    btn: "Aloita skannaus",
    details:
      "Varmista, että asiakirja on hyvin valaistu. Kaikkien asiakirjan kenttien tulee näkyä kameran näytöllä.",
    details_desktop:
      "Varmista, että pidät kameran linssin puhtaana ja että asiakirja on hyvin valaistu. Kaikkien asiakirjan kenttien on näyttävä kameran näytössä.",
    title: "Pidä kaikki tiedot näkyvissä",
    title_desktop: "Valmistaudu skannaukseen",
  },
  sdk_aria: "Asiakirjan skannausnäyttö",
  timeout_modal: {
    cancel_btn: "Peruuta",
    details: "Asiakirjan lukeminen ei onnistu. Yritä uudelleen.",
    retry_btn: "Yritä uudelleen",
    title: "Skannaus epäonnistui",
  },
} as const;
