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
  error_modal: { cancel_btn: "Peruuta", retry_btn: "Yritä uudelleen" },
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
    keep_still: "Pysy liikkumatta",
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
    scan_the_barcode_side: "Skannaa asiakirjan viivakoodipuoli",
    scan_the_front_side: "Skannaa asiakirjan etupuoli",
    scan_the_mrz_side: "Lue asiakirjan MRZ-puoli",
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
    barcode_only: {
      blur: {
        details:
          "Yritä pitää puhelin ja viivakoodi paikallaan skannauksen aikana. Jommankumman liikuttaminen voi sumentaa kuvaa ja vaikeuttaa viivakoodin lukemista.",
        details_desktop:
          "Yritä pysyä liikkumatta skannauksen aikana. Liikkuminen voi sumentaa kuvaa ja vaikeuttaa viivakoodin lukemista.",
        title: "Pysy paikallasi skannauksen aikana",
        title_desktop: "Pysy paikallasi skannauksen aikana",
      },
      camera_lens: {
        details_desktop:
          "Tarkista kameran linssi tahrojen tai pölyn varalta. Likainen linssi voi sumentaa lopullista kuvaa, jolloin viivakoodi ei ole luettavissa ja tietojen skannaus ei onnistu.",
        title_desktop: "Puhdista kameran linssi",
      },
      lighting: {
        details:
          "Vältä suoraa voimakasta valoa, koska se voi heijastua viivakoodista ja vaikeuttaa skannausta. Jos et näe viivakoodia selvästi, myöskään kamerasi ei pysty välttämättä lukemaan sitä.",
        details_desktop:
          "Vältä suoraa voimakasta valoa, koska se voi heijastua viivakoodista ja vaikeuttaa skannausta. Jos et näe viivakoodia selvästi, myöskään kamerasi ei pysty välttämättä lukemaan sitä.",
        title: "Varo voimakasta valoa",
        title_desktop: "Varo voimakasta valoa",
      },
      visibility: {
        details:
          "Varmista, ettet peitä viivakoodia sormella. Varo myös, ettei viivakoodin päälle synny heijastuksia, jotka tekisivät siitä lukukelvottoman.",
        details_desktop:
          "Varmista, ettet peitä viivakoodia sormella. Varo myös, ettei viivakoodin päälle synny heijastuksia, jotka tekisivät siitä lukukelvottoman.",
        title: "Pidä viivakoodi näkyvissä",
        title_desktop: "Pidä viivakoodi näkyvissä",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "Yritä pitää puhelin ja asiakirja paikallaan skannauksen aikana. Jommankumman liikkuminen voi tehdä kuvasta epäselvän ja asiakirjan tiedoista lukukelvottomia.",
        details_desktop:
          "Yritä pysyä liikkumatta skannauksen aikana. Liikkuminen voi sumentaa kuvaa ja tehdä asiakirjan tiedoista lukukelvottomia.",
        title: "Pysy paikallasi skannauksen aikana",
        title_desktop: "Pysy paikallasi skannauksen aikana",
      },
      camera_lens: {
        details_desktop:
          "Tarkista kameran linssi tahrojen tai pölyn varalta. Likainen linssi aiheuttaa lopullisen kuvan sumenemista ja tekee asiakirjan tiedoista lukukelvottomia, jolloin tietojen skannaus ei onnistu.",
        title_desktop: "Puhdista kameran linssi",
      },
      lighting: {
        details:
          "Vältä suoraa voimakasta valoa, koska se heijastuu asiakirjasta ja voi tehdä osia siitä lukukelvottomiksi. Jos et pysty lukemaan asiakirjan tietoja, ne eivät näy myöskään kameralle.",
        details_desktop:
          "Vältä suoraa voimakasta valoa, koska se heijastuu asiakirjasta ja voi tehdä osia siitä lukukelvottomiksi. Jos et pysty lukemaan asiakirjan tietoja, ne eivät näy myöskään kameralle.",
        title: "Varo voimakasta valoa",
        title_desktop: "Varo voimakasta valoa",
      },
      visibility: {
        details:
          "Varmista, ettet peitä viivakoodia sormella. Varo myös, ettei viivakoodin päälle synny heijastuksia, jotka tekisivät siitä lukukelvottoman.",
        details_desktop:
          "Varmista, ettet peitä viivakoodia sormella. Varo myös, ettei viivakoodin päälle synny heijastuksia, jotka tekisivät siitä lukukelvottoman.",
        title: "Pidä viivakoodi näkyvissä",
        title_desktop: "Pidä viivakoodi näkyvissä",
      },
    },
    document_with_mrz: {
      blur: {
        details:
          "Yritä pitää puhelin ja asiakirja paikallaan skannauksen aikana. Jommankumman liikkuminen voi tehdä kuvasta epäselvän ja asiakirjan tiedoista lukukelvottomia.",
        details_desktop:
          "Yritä pysyä liikkumatta skannauksen aikana. Liikkuminen voi sumentaa kuvaa ja tehdä asiakirjan tiedoista lukukelvottomia.",
        title: "Pysy paikallasi skannauksen aikana",
        title_desktop: "Pysy paikallasi skannauksen aikana",
      },
      camera_lens: {
        details_desktop:
          "Tarkista kameran linssi tahrojen tai pölyn varalta. Likainen linssi aiheuttaa lopullisen kuvan sumenemista ja tekee asiakirjan tiedoista lukukelvottomia, jolloin tietojen skannaus ei onnistu.",
        title_desktop: "Puhdista kameran linssi",
      },
      lighting: {
        details:
          "Vältä suoraa voimakasta valoa, koska se heijastuu asiakirjasta ja voi tehdä osia siitä lukukelvottomiksi. Jos et pysty lukemaan asiakirjan tietoja, ne eivät näy myöskään kameralle.",
        details_desktop:
          "Vältä suoraa voimakasta valoa, koska se heijastuu asiakirjasta ja voi tehdä osia siitä lukukelvottomiksi. Jos et pysty lukemaan asiakirjan tietoja, ne eivät näy myöskään kameralle.",
        title: "Varo voimakasta valoa",
        title_desktop: "Varo voimakasta valoa",
      },
      visibility: {
        details:
          "Varmista, ettet peitä mitään MRZ-alueen osaa sormella. Kiinnitä lisäksi huomiota MRZ-alueella oleviin heijastuksiin, jotka voisivat estää sen lukemisen.",
        details_desktop:
          "Varmista, ettet peitä mitään MRZ-alueen osaa sormella. Kiinnitä lisäksi huomiota MRZ-alueella oleviin heijastuksiin, jotka voisivat estää sen lukemisen.",
        title: "Pidä MRZ näkyvissä",
        title_desktop: "Pidä MRZ näkyvissä",
      },
    },
    done_btn: "Valmis",
    done_btn_aria: "Jatka skannausta",
    full_document: {
      blur: {
        details:
          "Yritä pitää puhelin ja asiakirja paikallaan skannauksen aikana. Jommankumman liikkuminen voi tehdä kuvasta epäselvän ja asiakirjan tiedoista lukukelvottomia.",
        details_desktop:
          "Yritä pysyä liikkumatta skannauksen aikana. Liikkuminen voi sumentaa kuvaa ja tehdä asiakirjan tiedoista lukukelvottomia.",
        title: "Pysy paikallasi skannauksen aikana",
        title_desktop: "Pysy paikallasi skannauksen aikana",
      },
      camera_lens: {
        details_desktop:
          "Tarkista kameran linssi tahrojen tai pölyn varalta. Likainen linssi aiheuttaa lopullisen kuvan sumenemista ja tekee asiakirjan tiedoista lukukelvottomia, jolloin tietojen skannaus ei onnistu.",
        title_desktop: "Puhdista kameran linssi",
      },
      lighting: {
        details:
          "Vältä suoraa voimakasta valoa, koska se heijastuu asiakirjasta ja voi tehdä osia siitä lukukelvottomiksi. Jos et pysty lukemaan asiakirjan tietoja, ne eivät näy myöskään kameralle.",
        details_desktop:
          "Vältä suoraa voimakasta valoa, koska se heijastuu asiakirjasta ja voi tehdä osia siitä lukukelvottomiksi. Jos et pysty lukemaan asiakirjan tietoja, ne eivät näy myöskään kameralle.",
        title: "Varo voimakasta valoa",
        title_desktop: "Varo voimakasta valoa",
      },
      visibility: {
        details:
          "Varmista, ettet peitä sormella mitään asiakirjan osia, myöskään alarivejä. Varo myös asiakirjan kenttien päälle tulevia hologrammien heijastuksia.",
        details_desktop:
          "Varmista, ettet peitä sormella mitään asiakirjan osia, myöskään alarivejä. Varo myös asiakirjan kenttien päälle tulevia hologrammien heijastuksia.",
        title: "Pidä kaikki kentät näkyvissä",
        title_desktop: "Pidä kaikki kentät näkyvissä",
      },
    },
    next_btn: "Seuraava",
  },
  onboarding_modal: {
    aria: "Skannausohjeet",
    barcode_only: {
      details:
        "Etsi viivakoodi (sarja mustia viivoja tai neliönmuotoinen koodi). Osoita kamerasi sitä kohti ja pysy liikkumatta – skannaus tapahtuu automaattisesti.",
      details_desktop:
        "Etsi viivakoodi (sarja mustia viivoja tai neliönmuotoinen koodi). Varmista, että kameran linssi on puhdas ja viivakoodi hyvin valaistu.",
      title: "Etsi ja skannaa viivakoodi",
      title_desktop: "Puhdsta linssi ja etsi viivakoodi",
    },
    btn: "Aloita skannaus",
    document_with_barcode: {
      details:
        "Erityyppisten asiakirjojen viivakoodin muoto ja sijainti saattavat vaihdella. Etsi viivakoodi tarkistamalla asiakirjan etu- ja kääntöpuoli.",
      details_desktop:
        "Etsi viivakoodi tarkistamalla asiakirjan etu- ja kääntöpuoli. Varmista, että kameran linssi on puhdas ja asiakirja on hyvin valaistu.",
      title: "Etsi asiakirjan viivakoodi",
      title_desktop: "Puhdsta linssi ja etsi viivakoodi",
    },
    document_with_mrz: {
      details:
        "Löydät asiakirjan etu- tai kääntöpuolen alareunasta pitkän merkkijonon, joka on jaettu 2 tai 3 riville ja jonka osat on erotettu toisistaan nuolilla (<< tai >>).",
      details_desktop:
        "Etsi MRZ tarkistamalla asiakirjan etu- ja kääntöpuoli. MRZ on asiakirjan alareunassa oleva alue, jolla on 2–3 riviä merkkejä ja nuolisymboleja (<<). Varmista, että kameran linssi on puhdas ja asiakirja on hyvin valaistu.",
      title: "Etsi asiakirjan MRZ",
      title_desktop: "Puhdista linssi ja etsi MRZ",
    },
    full_document: {
      details:
        "Varmista, että asiakirja on hyvin valaistu. Kaikkien asiakirjan kenttien tulee näkyä kameran näytöllä.",
      details_desktop:
        "Varmista, että pidät kameran linssin puhtaana ja että asiakirja on hyvin valaistu. Kaikkien asiakirjan kenttien on näyttävä kameran näytössä.",
      title: "Pidä kaikki tiedot näkyvissä",
      title_desktop: "Valmistaudu skannaukseen",
    },
  },
  sdk_aria: "Asiakirjan skannausnäyttö",
  timeout_modal: {
    details:
      "Varmista, että asiakirja on hyvin valaistu, se näkyy kokonaisuudessaan eikä siinä ole heijastuksia.",
    details_desktop:
      "Varmista, että kameran linssi on puhdas ja että asiakirja näkyy kokonaisuudessaan, se on hyvin valaistu ja tarkennus on terävä.",
    title: "Asiakirjaa ei voitu lukea",
  },
} as const;
