/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for it.
 */
export default {
  feedback_messages: {
    blur_detected: "Tieni fermi il telefono e la carta",
    blur_detected_desktop: "Tieni fermi il dispositivo e la carta",
    camera_angle_too_steep: "Tenere la carta parallela al telefono",
    camera_angle_too_steep_desktop: "Tieni la carta parallela allo schermo",
    card_number_scanned: "Perfetto! Lato con numero carta scansionato",
    card_scanned: "Perfetto! Carta scansionata",
    document_too_close_to_edge: "Spostati più lontano",
    flip_card: "Capovolgi la carta",
    flip_to_back_side: "Capovolgi la carta",
    move_closer: "Avvicinati",
    move_farther: "Spostati più lontano",
    occluded: "Fare in modo che la carta sia interamente visibile",
    scan_the_back_side: "Scansiona l'altro lato della carta",
    scan_the_front_side: "Scansiona il numero della carta",
  },
  help_button: { aria_label: "Aiuto", tooltip: "Ti serve aiuto?" },
  help_modal: {
    aria: "Aiuto per la scansione",
    back_btn: "Indietro",
    blur: {
      details:
        "Cerca di tenere fermi il telefono e la scheda durante la scansione. Muoverli può rendere l'immagine sfocata e i dati sulla scheda illeggibili.",
      details_desktop:
        "Cerca di tenere fermi il dispositivo e la carta durante la scansione. Muoverli può sfocare l'immagine e rendere illeggibili i dati della carta.",
      title: "Resta immobile durante la scansione",
    },
    camera_lens: {
      details:
        "Controlla che la lente della fotocamera sia priva di macchie o polvere. Una lente sporca sfoca l'immagine finale, rendendo illeggibili le informazioni della carta e impedendo la corretta scansione dei dati.",
      title: "Pulisci la lente della fotocamera",
    },
    card_number: {
      details:
        "Il numero della carta è in genere un numero di 16 cifre, ma potrebbe contenere da 12 a 19 cifre. Dovrebbe essere stampato o impresso in rilievo sulla carta. Potrebbe essere sul fronte o sul retro della carta.",
      title: "Dov'è il numero della carta?",
    },
    done_btn: "Fatto",
    done_btn_aria: "Riprendi scansione",
    lighting: {
      details:
        "Evita la luce intensa diretta, perché questa si riflette sulla scheda e può rendere illeggibili alcune sue parti. Se non riesci a leggere i dati sulla scheda, neanche la fotocamera potrà vederli.",
      title: "Attenzione alla luce intensa",
    },
    next_btn: "Avanti",
    occlusion: {
      details:
        "Controlla di non stare coprendo parte della scheda, comprese le ultime righe, con un dito. Fai attenzione anche ai riflessi olografici situati sui campi della scheda.",
      title: "Fai in modo tutti i campi siano visibili",
    },
  },
  onboarding_modal: {
    aria: "Istruzioni per la scansione",
    btn: "Avvia scansione",
    details:
      "Il numero della carta è in genere un numero di 16 cifre. Dovrebbe essere stampato o impresso in rilievo sulla carta. Assicurati che la carta sia ben illuminata e che tutti i dati siano visibili.",
    details_desktop:
      "Il numero della carta è in genere un numero di 16 cifre. Dovrebbe essere stampato o impresso in rilievo sulla carta. Assicurati che la lente della fotocamera sia pulita, che carta sia ben illuminata e che tutte le informazioni siano visibili.",
    title: "Prima scansiona il numero della carta",
  },
  sdk_aria: "Schermata di scansione della carta",
  timeout_modal: {
    cancel_btn: "Annulla",
    details: "Impossibile leggere la carta. Riprova.",
    retry_btn: "Riprova",
    title: "Scansione non riuscita",
  },
} as const;
