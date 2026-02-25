/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for hr.
 */
export default {
  feedback_messages: {
    blur_detected: "Držite karticu i telefon mirno",
    blur_detected_desktop: "Držite karticu i uređaj mirno",
    camera_angle_too_steep: "Držite karticu paralelno s telefonom",
    camera_angle_too_steep_desktop: "Držite karticu paralelno s ekranom",
    card_number_scanned: "Uspjeh! Strana s brojem kartice skenirana",
    card_scanned: "Uspjeh! Kartica skenirana",
    document_too_close_to_edge: "Udaljite dokument",
    flip_card: "Okrenite karticu",
    flip_to_back_side: "Okrenite karticu",
    move_closer: "Približite dokument",
    move_farther: "Udaljite dokument",
    occluded: "Drži karticu u potpunosti vidljivom",
    scan_the_back_side: "Skenirajte drugu stranu kartice",
    scan_the_front_side: "Skeniraj broj kartice",
  },
  help_button: { aria_label: "Pomoć", tooltip: "Trebate pomoć?" },
  help_modal: {
    aria: "Pomoć za skeniranje",
    back_btn: "Natrag",
    blur: {
      details:
        "Pokušajte za vrijeme skeniranja što mirnije držati telefon i karticu. Pomicanjem može doći do zamućenja slike zbog čega podaci postaju nečitljivi.",
      details_desktop:
        "Pokušajte za vrijeme skeniranja što mirnije držati uređaj i karticu. Pomicanjem može doći do zamućenja slike zbog čega podaci postaju nečitljivi.",
      title: "Mirno držite dokument",
    },
    camera_lens: {
      details:
        "Provjerite je li kamera čista. Prljava kamera uzrokuje zamućenje slike pa podaci na kartici postaju nečitljivi i nemoguće ih je uspješno skenirati.",
      title: "Očistite kameru",
    },
    card_number: {
      details:
        "Broj kartice obično se sastoji od 16 znamenki, iako ih može imati između 12 i 19. Broj je otisnut ili urezan reljefnim brojkama na kartici i može se nalaziti na prednjoj ili stražnjoj strani kartice.",
      title: "Gdje se nalazi broj kartice?",
    },
    done_btn: "OK",
    done_btn_aria: "Nastavi skeniranje",
    lighting: {
      details:
        "Izbjegavajte izravnu jaku svjetlost jer se reflektira s kartice i može učiniti dijelove kartice nečitljivima. Ako vi ne možete pročitati podatke na kartici, ni kamera ih neće moći vidjeti.",
      title: "Pazite na direktno osvjetljenje",
    },
    next_btn: "Dalje",
    occlusion: {
      details:
        "Pripazite kako držite karticu. Nemojte prekrivati dijelove kartice prstom, uključujući donje linije. Također, pazite na refleksije holograma koje prelaze preko polja kartice.",
      title: "Pazite da su sva polja vidljiva",
    },
  },
  onboarding_modal: {
    aria: "Upute za skeniranje",
    btn: "Započnite skeniranje",
    details:
      "Broj kartice obično se sastoji od 16 znamenki i nalazi se otisnut ili urezan reljefnim brojkama na kartici. Provjerite je li kartica dobro osvijetljena i jesu li svi detalji jasno vidljivi.",
    details_desktop:
      "Broj kartice obično se sastoji od 16 znamenki. Broj je otisnut ili urezan reljefnim brojkama na kartici. Provjerite je li kamera čista, kartica dobro osvijetljena i svi detalji jasno vidljivi.",
    title: "Prvo skenirajte broj kartice",
  },
  sdk_aria: "Zaslon za skeniranje kartice",
  timeout_modal: {
    cancel_btn: "Odustani",
    details: "Karticu nije moguće očitati. Molimo pokušajte ponovo.",
    retry_btn: "U redu",
    title: "Skeniranje nije uspjelo",
  },
} as const;
