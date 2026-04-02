/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for it.
 */
export default {
  document_filtered_modal: {
    details: "Prova a scansionare un documento diverso.",
    title: "Documento non accettato",
  },
  document_not_recognized_modal: {
    details: "Scansiona il lato anteriore di un documento supportato.",
    title: "Documento non riconosciuto",
  },
  feedback_messages: {
    blur_detected: "Tieni immobili il documento e il telefono",
    camera_angle_too_steep: "Tieni il documento parallelo al telefono",
    document_scanned_aria: "Perfetto! Documento scansionato",
    document_too_close_to_edge: "Spostati più lontano",
    face_photo_not_fully_visible:
      "Mantenere la foto del viso completamente visibile",
    flip_document: "Girare il documento",
    flip_to_back_side: "Capovolgi il documento",
    front_side_scanned_aria: "Perfetto! Fronte scansionato",
    glare_detected: "Inclina o muovi il documento per eliminare il riflesso",
    keep_document_parallel: "Tieni il documento parallelo allo schermo",
    keep_document_still: "Tieni fermi il dispositivo e il documento",
    move_closer: "Avvicinati",
    move_farther: "Spostati più lontano",
    move_left: "Muovi sulla pagina alla sinistra",
    move_right: "Passa alla pagina a destra",
    move_top: "Muovi sulla pagina in alto",
    occluded: "Fai in modo che il documento sia completamente visibile",
    scan_data_page: "Scansiona la pagina dei dati del documento",
    scan_last_page_barcode: "Scansiona codice a barre dall'ultima pagina",
    scan_left_page: "Scansiona la pagina a sinistra",
    scan_right_page: "Scansiona la pagina a destra",
    scan_the_back_side: "Scansiona il retro del documento",
    scan_the_barcode: "Scansiona il codice a barre",
    scan_the_front_side: "Scansiona il fronte \\ndi un documento",
    scan_top_page: "Scansiona la pagina in alto",
    too_bright: "Sposta in un punto meno illuminato",
    too_dark: "Sposta in un punto più illuminato",
    wrong_left: "Muovi alla pagina di sinistra",
    wrong_right: "Muovi alla pagina di destra",
    wrong_top: "Muovi alla pagina in alto",
  },
  help_button: { aria_label: "Aiuto", tooltip: "Ti serve aiuto?" },
  help_modal: {
    aria: "Aiuto per la scansione",
    back_btn: "Indietro",
    blur: {
      details:
        "Cerca di tenere fermi il telefono e il documento durante la scansione. Muoverli può rendere l'immagine sfocata e i dati sul documento illeggibili.",
      details_desktop:
        "Cerca di tenere fermi il dispositivo e il documento durante la scansione. Muoverli può sfocare l'immagine e rendere illeggibili i dati riportati sul documento.",
      title: "Resta immobile durante la scansione",
    },
    camera_lens: {
      details:
        "Controlla che la lente della fotocamera sia priva di macchie o polvere. Una lente sporca sfoca l'immagine finale, rendendo illeggibili le informazioni riportate sul documento e impedendo la corretta scansione dei dati.",
      title: "Pulisci la lente della fotocamera",
    },
    done_btn: "Fatto",
    done_btn_aria: "Riprendi scansione",
    lighting: {
      details:
        "Evita la luce intensa diretta, perché questa si riflette sul documento e può rendere illeggibili alcune sue parti. Se non riesci a leggere i dati sul documento, neanche la fotocamera potrà vederli.",
      title: "Attenzione alla luce intensa",
    },
    next_btn: "Avanti",
    visibility: {
      details:
        "Controlla di non stare coprendo parte del documento, comprese le ultime righe, con un dito. Fai attenzione anche ai riflessi olografici situati sui campi del documento.",
      title: "Fai in modo tutti i campi siano visibili",
    },
  },
  onboarding_modal: {
    aria: "Istruzioni per la scansione",
    btn: "Avvia scansione",
    details:
      "Controlla che il documento sia ben illuminato. Tutti i campi del documento devono essere visibili sullo schermo della fotocamera.",
    details_desktop:
      "Controlla che la lente della fotocamera sua pulita e che il documento sia ben illuminato. Tutti i campi del documento devono essere visibili sullo schermo della fotocamera.",
    title: "Fai in modo tutti i dati siano visibili",
    title_desktop: "Preparati per la scansione",
  },
  sdk_aria: "Schermata di scansione del documento",
  timeout_modal: {
    cancel_btn: "Annulla",
    details: "Impossibile leggere il documento. Riprova.",
    retry_btn: "Riprova",
    title: "Scansione non riuscita",
  },
} as const;
