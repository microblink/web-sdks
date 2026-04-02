/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for fr.
 */
export default {
  document_filtered_modal: {
    details: "Essayez de scanner un autre document.",
    title: "Document rejeté",
  },
  document_not_recognized_modal: {
    details: "Numérisez le recto d'un document pris en charge.",
    title: "Document non reconnu",
  },
  feedback_messages: {
    blur_detected: "Maintenir le document et le téléphone immobiles",
    camera_angle_too_steep: "Maintenir le document parallèle au téléphone",
    document_scanned_aria: "Document scanné avec succès !",
    document_too_close_to_edge: "Éloignez-vous",
    face_photo_not_fully_visible:
      "La photo de face doit être entièrement visible",
    flip_document: "Retourner le document",
    flip_to_back_side: "Retournez le document",
    front_side_scanned_aria: "Face avant scannée avec succès !",
    glare_detected:
      "Incliner ou déplacer le document afin d'éliminer les reflets",
    keep_document_parallel: "Maintenez le document parallèle à l’écran",
    keep_document_still: "Gardez le document et l’appareil immobiles",
    move_closer: "Rapprochez-vous",
    move_farther: "Éloignez-vous",
    move_left: "Aller à la page de gauche",
    move_right: "Passer à la page de droite",
    move_top: "Aller à la page supérieure",
    occluded: "Gardez le document entièrement visible",
    scan_data_page: "Numériser la page de données du document",
    scan_last_page_barcode: "Scanner le code-barres de la dernière page",
    scan_left_page: "Numériser la page de gauche",
    scan_right_page: "Numériser la page de droite",
    scan_the_back_side: "Scanner le verso du document",
    scan_the_barcode: "Scanner le code-barres",
    scan_the_front_side: "Numérisez le recto\\nd'un document",
    scan_top_page: "Numériser la première page",
    too_bright: "Se déplacer vers un endroit moins éclairé",
    too_dark: "Déplacer le document vers un endroit plus lumineux",
    wrong_left: "Aller à la page de gauche",
    wrong_right: "Aller à la page de droite",
    wrong_top: "Aller à la première page",
  },
  help_button: { aria_label: "Aide", tooltip: "Besoin d'aide ?" },
  help_modal: {
    aria: "Aide à la numérisation",
    back_btn: "Retour",
    blur: {
      details:
        "Essayez de garder le téléphone et le document immobiles pendant la numérisation. Tout mouvement de l'un ou l'autre peut brouiller l'image et rendre les données du document illisibles.",
      details_desktop:
        "Essayez de garder l’appareil et le document immobiles pendant la numérisation. Tout mouvement peut brouiller l’image et rendre les données du document illisibles.",
      title: "Restez immobile pendant la numérisation",
    },
    camera_lens: {
      details:
        "Vérifiez que l’objectif de votre appareil photo ne présente aucune trace ni poussière. Un objectif sale rend l’image finale floue, ce qui empêche la lecture des informations du document ainsi que la numérisation des données.",
      title: "Nettoyez l’objectif de votre appareil photo",
    },
    done_btn: "Terminé",
    done_btn_aria: "Reprendre la numérisation",
    lighting: {
      details:
        "Évitez toute lumière directe et vive, car elle se reflète sur le document et peut rendre certaines parties du document illisibles. Si les données ne sont pas lisibles sur le document, elles ne le seront pas non plus pour la caméra.",
      title: "Faites attention aux lumières trop vives",
    },
    next_btn: "Suivant",
    visibility: {
      details:
        "Veillez à ne pas recouvrir certaines parties du document avec un doigt, notamment les lignes de fond. Faites également attention aux reflets de l'hologramme qui recouvrent les champs du document.",
      title: "Gardez tous les champs visibles",
    },
  },
  onboarding_modal: {
    aria: "Instructions relatives à la numérisation",
    btn: "Commencer à numériser",
    details:
      "Prenez soin de garder le document bien éclairé. Tous les champs du document doivent être visibles sur l'écran de la caméra.",
    details_desktop:
      "Assurez-vous que l’objectif de votre caméra est propre et que le document est bien éclairé. Tous les champs du document doivent être visibles sur l’écran de la caméra.",
    title: "Gardez tous les détails visibles",
    title_desktop: "Préparez-vous à la numérisation",
  },
  sdk_aria: "Écran de numérisation du document",
  timeout_modal: {
    cancel_btn: "Annuler",
    details: "Impossible de lire le document. Veuillez réessayer.",
    retry_btn: "Réessayez",
    title: "Numérisation infructueuse",
  },
} as const;
