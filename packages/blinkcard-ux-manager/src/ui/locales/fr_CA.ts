/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for fr_CA.
 */
export default {
  feedback_messages: {
    blur_detected: "Gardez la carte et le téléphone immobiles",
    blur_detected_desktop: "Gardez la carte et l'appareil immobiles",
    camera_angle_too_steep: "Maintenez la carte parallèle au téléphone",
    camera_angle_too_steep_desktop:
      "Veuillez maintenir la carte parallèle à l'écran",
    card_number_scanned: "Réussite ! Côté du numéro de la carte numérisé",
    card_scanned: "Réussite ! Carte numérisée",
    document_too_close_to_edge: "Éloignez-vous",
    flip_card: "Veuillez retourner la carte",
    flip_to_back_side: "Veuillez retourner la carte",
    move_closer: "Rapprochez-vous",
    move_farther: "Éloignez-vous",
    occluded: "Gardez la carte entièrement visible",
    scan_the_back_side: "Scanner l'autre côté de la carte",
    scan_the_front_side: "Numérisez le numéro de la carte.",
  },
  help_button: { aria_label: "Aide", tooltip: "Besoin d'aide?" },
  help_modal: {
    back_btn: "Retour",
    blur: {
      details:
        "Essayez de maintenir le téléphone et la carte immobiles pendant la numérisation. Tout mouvement peut rendre l'image floue et les données illisibles.",
      details_desktop:
        "Essayez de maintenir l'appareil et la carte immobiles pendant la numérisation. Tout mouvement peut rendre l'image floue et rendre les données de la carte illisibles.",
      title: "Restez immobile pendant le scan.",
    },
    camera_lens: {
      details:
        "Vérifiez que l'objectif de votre appareil photo ne présente pas de trace ou de poussière. Un objectif sale rend l'image finale floue, les détails de la carte illisibles et empêche la bonne numérisation des données.",
      title: "Nettoyez l'objectif de votre appareil photo",
    },
    card_number: {
      details:
        "Le numéro de carte est généralement composé de 16 chiffres, mais il peut en comporter entre 12 et 19. Il doit être imprimé ou gravé en relief sur la carte. Il peut se trouver au recto ou au verso de votre carte.",
      title: "Où se trouve le numéro de la carte?",
    },
    done_btn: "Terminé",
    lighting: {
      details:
        "Évitez la lumière directe et intense, car elle se reflète sur la carte et peut rendre certaines parties illisibles. Si vous ne parvenez pas à lire les données sur la carte, elles ne seront pas non plus visibles pour la caméra.",
      title: "Faites attention à la lumière vive",
    },
    next_btn: "Suivant",
    occlusion: {
      details:
        "Veuillez vous assurer de ne pas couvrir certaines parties de la carte avec votre doigt, y compris les lignes du bas. Veuillez également faire attention aux reflets holographiques qui peuvent apparaître sur les champs de la carte.",
      title: "Veillez à ce que tous les champs soient visibles.",
    },
  },
  onboarding_modal: {
    btn: "Commencer le balayage",
    details:
      "Le numéro de la carte est généralement un numéro à 16 chiffres. Il doit être imprimé ou gravé en relief sur la carte. Assurez-vous que la carte est bien éclairée et que tous les détails sont visibles.",
    details_desktop:
      "Le numéro de carte comporte généralement 16 chiffres. Il doit être imprimé ou gravé en relief sur la carte. Assurez-vous que l'objectif de votre appareil photo est propre, que la carte est bien éclairée et que tous les détails sont visibles.",
    title: "Veuillez d'abord numériser le numéro de la carte",
  },
  timeout_modal: {
    cancel_btn: "Annuler",
    details: "Impossible de lire la carte. Veuillez réessayer.",
    retry_btn: "Réessayer",
    title: "Échec de la numérisation",
  },
} as const;
