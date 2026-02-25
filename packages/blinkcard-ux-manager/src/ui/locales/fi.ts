/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for fi.
 */
export default {
  feedback_messages: {
    blur_detected: "Pidä kortti ja puhelin paikallaan",
    blur_detected_desktop: "Pidä kortti ja laite paikallaan",
    camera_angle_too_steep: "Pidä kortti samassa suunnassa puhelimen kanssa",
    camera_angle_too_steep_desktop: "Pidä kortti näytön suuntaisena",
    card_number_scanned: "Onnistui! Kortin numeropuoli on skannattu",
    card_scanned: "Onnistui! Kortti on skannattu",
    document_too_close_to_edge: "Siirry kauemmas",
    flip_card: "Käännä kortti ympäri",
    flip_to_back_side: "Käännä kortti ympäri",
    move_closer: "Siirry lähemmäs",
    move_farther: "Siirry kauemmas",
    occluded: "Pidä kortti täysin näkyvissä",
    scan_the_back_side: "Lue kortin toinen puoli",
    scan_the_front_side: "Skannaa kortin numero",
  },
  help_button: { aria_label: "Ohje", tooltip: "Tarvitsetko apua?" },
  help_modal: {
    aria: "Apua skannaukseen",
    back_btn: "Takaisin",
    blur: {
      details:
        "Yritä pitää puhelin ja kortti paikallaan skannauksen aikana. Jommankumman liikkuminen voi tehdä kuvasta epäselvän ja kortin tiedoista lukukelvottomia.",
      details_desktop:
        "Yritä pitää laite ja kortti paikallaan lukemisen aikana. Kumman tahansa liikuttaminen voi sumentaa kuvan ja tehdä kortin tiedot lukukelvottomiksi.",
      title: "Pysy paikallasi skannauksen aikana",
    },
    camera_lens: {
      details:
        "Tarkista kameran linssi tahrojen tai pölyn varalta. Likainen linssi aiheuttaa epätarkkuutta lopulliseen kuvaan, jolloin kortin yksityiskohdat eivät ole luettavissa ja tietojen skannaus ei onnistu.",
      title: "Puhdista kameran linssi",
    },
    card_number: {
      details:
        "Kortin numero sisältää tavallisesti 16 numeroa, mutta se voi myös olla 12–19 numeroa pitkä. Numeron tulisi olla painettuna tai kohokuvioituna kortin etu- tai kääntöpuolelle.",
      title: "Missä kortin numero on?",
    },
    done_btn: "Valmis",
    done_btn_aria: "Jatka skannausta",
    lighting: {
      details:
        "Vältä suoraa voimakasta valoa, koska se heijastuu kortista ja voi tehdä osan kortista lukukelvottomaksi. Jos et pysty lukemaan kortin tietoja, ne eivät näy myöskään kameralle.",
      title: "Varo voimakasta valoa",
    },
    next_btn: "Seuraava",
    occlusion: {
      details:
        "Varmista, ettet peitä sormella mitään kortin osia, myöskään alarivejä. Varo myös kortin kenttien päälle tulevia hologrammien heijastuksia.",
      title: "Pidä kaikki kentät näkyvissä",
    },
  },
  onboarding_modal: {
    aria: "Skannausohjeet",
    btn: "Aloita skannaus",
    details:
      "Kortin numero sisältää tavallisesti 16 numeroa, ja sen tulisi olla painettuna tai kohokuvioituna korttiin. Varmista, että kortti on hyvin valaistu ja että kaikki tiedot ovat näkyvissä.",
    details_desktop:
      "Kortin numero on yleensä 16-numeroinen. Sen pitäisi kulkea kortin poikki joko painettuna tai kohokuvioituina numeroina. Varmista, että kameran linssi on puhdas, kortti on hyvin valaistu ja kaikki yksityiskohdat näkyvät.",
    title: "Skannaa ensin kortin numero",
  },
  sdk_aria: "Kortin skannausnäyttö",
  timeout_modal: {
    cancel_btn: "Peruuta",
    details: "Korttia ei pystytä lukemaan. Yritä uudelleen.",
    retry_btn: "Yritä uudelleen",
    title: "Skannaus epäonnistui",
  },
} as const;
