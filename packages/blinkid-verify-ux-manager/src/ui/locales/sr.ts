/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for sr.
 */
export default {
  document_filtered_modal: {
    details: "Pokušajte da skenirate drugi dokument.",
    title: "Dokument nije prihvaćen",
  },
  document_not_recognized_modal: {
    details: "Skenirajte prednju stranu podržanog dokumenta.",
    title: "Документ није препознат",
  },
  feedback_messages: {
    blur_detected: "Držite mirno dokument i telefon",
    camera_angle_too_steep: "Držite dokument paralelno sa telefonom",
    document_scanned_aria: "Uspeh! Dokument skeniran",
    document_too_close_to_edge: "Udaljite",
    face_photo_not_fully_visible: "Neka slika lica bude u potpunosti vidljiva",
    flip_document: "Preokrenite dokument",
    flip_to_back_side: "Preokrenite dokument",
    front_side_scanned_aria: "Uspeh! Prednja strana skenirana",
    glare_detected: "Nagnite ili pomerite dokument kako biste uklonili odsjaj",
    keep_document_parallel: "Držite dokument paralelno s ekranom",
    keep_document_still: "Držite mirno dokument i ure]aj",
    move_closer: "Približite",
    move_farther: "Udaljite",
    move_left: "Pređite na stranicu sa leve strane",
    move_right: "Premesti se na stranicu sa desne strane",
    move_top: "Pređite na stranicu na vrhu",
    occluded: "Neka dokument bude u potpunosti vidljiv",
    scan_data_page: "Skenirajte stranicu sa podacima dokumenta",
    scan_last_page_barcode: "Skenirajte barkod sa zadnje stranice",
    scan_left_page: "Skenirajte levu stranicu",
    scan_right_page: "Skenirajte desnu stranicu",
    scan_the_back_side: "Skenirajte zadnju stranu dokumenta",
    scan_the_barcode: "Skenirajte bar kod",
    scan_the_front_side: "Skenirajte prednju stranu\\ndokumenta",
    scan_top_page: "Skenirajte gornju stranicu",
    too_bright: "Pomerite se na mesto sa manje svetla",
    too_dark: "Pomerite se na svetlije mesto",
    wrong_left: "Pređite na levu stranicu",
    wrong_right: "Pređite na desnu stranicu",
    wrong_top: "Pređite na gornju stranicu",
  },
  help_button: { aria_label: "Pomoć", tooltip: "Potrebna vam je pomoć?" },
  help_modal: {
    aria: "Pomoć za skeniranje",
    back_btn: "Nazad",
    blur: {
      details:
        "Pokušajte da telefon i dokument budu mirni tokom skeniranja. Pomeranje bilo koje od njih može zamutiti sliku i učiniti podatke na dokumentu nečitljivim.",
      details_desktop:
        "Pokušajte da uređaj  i dokument budu mirni tokom skeniranja. Pomeranje bilo koje od njih može zamutiti sliku i učiniti podatke na dokumentu nečitljivim.",
      title: "Ostanite mirni dok skenirate",
    },
    camera_lens: {
      details:
        "Proverite da li na sočivu kamere ima mrlja ili prašine. Prljavo sočivo može zamutiti konačnu sliku, zbog čega detalji na dokumentu postaju nečitljivi i onemogućavaju uspešno skeniranje podataka.",
      title: "Očistite sočiva kamere",
    },
    done_btn: "Završeno",
    done_btn_aria: "Nastavi skeniranje",
    lighting: {
      details:
        "Izbegavajte direktnu oštru svetlost jer se odbija od dokumenta i može učiniti delove dokumenta nečitljivim. Ako ne možete da pročitate podatke na dokumentu, neće biti vidljivi ni kameri.",
      title: "Pazite na oštro svetlo",
    },
    next_btn: "Sledeći",
    visibility: {
      details:
        "Uverite se da ne prekrivate delove dokumenta prstom, uključujući donje redove. Takođe, pazite na hologramske refleksije koje prelaze preko polja dokumenta.",
      title: "Neka sva polja budu vidljiva",
    },
  },
  onboarding_modal: {
    aria: "Uputstva za skeniranje",
    btn: "Pokreni skeniranje",
    details:
      "Uverite se da je dokument dobro osvetljen. Sva polja dokumenta treba da budu vidljiva na ekranu kamere.",
    details_desktop:
      "Uverite se da je sočivo kamere čisto i dobro osvetljeno. Sva polja dokumenta treba da budu vidljiva na ekranu kamere.",
    title: "Neka svi detalji budu vidljivi",
    title_desktop: "Pripremite se za skeniranje",
  },
  sdk_aria: "Ekran skeniranja dokumenta",
  timeout_modal: {
    cancel_btn: "Otkaži",
    details: "Nije moguće pročitati dokument. Molimo Vas, pokušajte ponovo.",
    retry_btn: "Pokušaj ponovo",
    title: "Skeniranje neuspešno",
  },
} as const;
