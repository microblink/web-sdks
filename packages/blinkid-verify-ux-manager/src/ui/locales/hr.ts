/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for hr.
 */
export default {
  document_filtered_modal: {
    details: "Pokušajte skenirati drugi dokument.",
    title: "Dokument nije prihvaćen",
  },
  document_not_recognized_modal: {
    details: "Skenirajte prednju stranu podržanog dokumenta.",
    title: "Dokument nije prepoznat",
  },
  feedback_messages: {
    blur_detected: "Držite dokument i telefon mirno",
    camera_angle_too_steep: "Držite dokument paralelno s telefonom",
    document_scanned_aria: "Uspjeh! Dokument skeniran",
    document_too_close_to_edge: "Udaljite dokument",
    face_photo_not_fully_visible: "Fotografija lica nije u potpunosti vidljiva",
    flip_document: "Okrenite dokument",
    flip_to_back_side: "Okrenite dokument",
    front_side_scanned_aria: "Uspjeh! Prednja strana skenirana",
    glare_detected:
      "Nagnite ili premjestite dokument kako biste uklonili refleksiju",
    keep_document_parallel: "Držite dokument paralelno sa zaslonom",
    keep_document_still: "Držite dokument i uređaj mirno",
    move_closer: "Približite dokument",
    move_farther: "Udaljite dokument",
    move_left: "Prijeđite na lijevu stranicu",
    move_right: "Prijeđite na desnu stranicu",
    move_top: "Prijeđite na gornju stranicu",
    occluded: "Držite dokument u potpunosti vidljivim",
    scan_data_page: "Skenirajte stranicu s podacima dokumenta",
    scan_last_page_barcode: "Skenirajte barkod sa zadnje stranice",
    scan_left_page: "Skenirajte lijevu stranicu",
    scan_right_page: "Skenirajte desnu stranicu",
    scan_the_back_side: "Skenirajte stražnju stranu dokumenta",
    scan_the_barcode: "Skenirajte barkod",
    scan_the_front_side: "Skenirajte prednju stranu dokumenta",
    scan_top_page: "Skenirajte gornju stranicu",
    too_bright: "Pomaknite se na slabije osvijetljeno mjesto",
    too_dark: "Pomaknite se na više osvijetljeno mjesto",
    wrong_left: "Prijeđite na lijevu stranicu",
    wrong_right: "Prijeđite na desnu stranicu",
    wrong_top: "Prijeđite na gornju stranicu",
  },
  help_button: { aria_label: "Pomoć", tooltip: "Trebate pomoć?" },
  help_modal: {
    aria: "Pomoć za skeniranje",
    back_btn: "Natrag",
    blur: {
      details:
        "Pokušajte za vrijeme skeniranja što mirnije držati telefon i dokument. Pomicanjem može doći do zamućenja slike zbog čega podaci postaju nečitljivi.",
      details_desktop:
        "Pokušajte za vrijeme skeniranja što mirnije držati uređaj i dokument. Pomicanjem može doći do zamućenja slike zbog čega podaci postaju nečitljivi.",
      title: "Mirno držite dokument",
    },
    camera_lens: {
      details:
        "Provjerite je li kamera čista. Prljava kamera uzrokuje zamućenje slike pa podaci na dokumentu postaju nečitljivi i nemoguće ih je uspješno skenirati.",
      title: "Očistite kameru",
    },
    done_btn: "OK",
    done_btn_aria: "Nastavi skeniranje",
    lighting: {
      details:
        "Izbjegavajte izravnu jaku svjetlost jer se reflektira s dokumenta i može učiniti dijelove dokumenta nečitljivima. Ako vi ne možete pročitati podatke na dokumentu, ni kamera ih neće moći vidjeti.",
      title: "Pazite na direktno osvjetljenje",
    },
    next_btn: "Dalje",
    visibility: {
      details:
        "Pripazite kako držite dokument. Nemojte prekrivati dijelove dokumenta prstom, uključujući donje linije. Također, pazite na refleksije holograma koje prelaze preko polja dokumenta.",
      title: "Pazite da su sva polja vidljiva",
    },
  },
  onboarding_modal: {
    aria: "Upute za skeniranje",
    btn: "Započnite skeniranje",
    details:
      "Pripazite da dokument bude dovoljno osvijetljen. Svi podaci s dokumenta trebaju biti vidljivi na ekranu vašeg uređaja.",
    details_desktop:
      "Pripazite da kamera bude čista i dokument dovoljno osvijetljen. Svi podaci s dokumenta trebaju biti vidljivi na ekranu vašeg uređaja.",
    title: "Pazite da su svi detalji vidljivi",
    title_desktop: "Pripremite se za skeniranje",
  },
  sdk_aria: "Zaslon za skeniranje dokumenta",
  timeout_modal: {
    cancel_btn: "Odustani",
    details: "Dokument nije moguće očitati. Molimo pokušajte ponovo.",
    retry_btn: "U redu",
    title: "Skeniranje nije uspjelo",
  },
} as const;
