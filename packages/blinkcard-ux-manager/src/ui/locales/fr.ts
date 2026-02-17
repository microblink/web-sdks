/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for fr.
 */
export default {
  feedback_messages: {
    blur_detected: "Gardez la carte et le téléphone immobiles",
    blur_detected_desktop: "Gardez la carte et l’appareil immobiles",
    camera_angle_too_steep: "Maintenez la carte parallèle au téléphone.",
    camera_angle_too_steep_desktop: "Maintenez la carte parallèle à l’écran",
    card_number_scanned: "Numéro de carte scanné au verso avec succès !",
    card_scanned: "Carte scannée avec succès !",
    document_too_close_to_edge: "Éloignez-vous",
    flip_card: "Retourner la carte",
    flip_to_back_side: "Retourner la carte",
    move_closer: "Rapprochez-vous",
    move_farther: "Éloignez-vous",
    occluded: "La carte doit rester entièrement visible",
    scan_the_back_side: "Scannez l'autre côté de la carte.",
    scan_the_front_side: "Numériser le numéro de carte",
  },
  help_button: { aria_label: "Aide", tooltip: "Besoin d'aide ?" },
  help_modal: {
    back_btn: "Retour",
    blur: {
      details:
        "Essayez de garder le téléphone et la cartes immobiles pendant la numérisation. Tout mouvement de l'un ou l'autre peut brouiller l'image et rendre les données de la carte illisibles.",
      details_desktop:
        "Essayez de garder l’appareil et la carte immobiles pendant la numérisation. Tout mouvement peut brouiller l’image et rendre les données de la carte illisibles.",
      title: "Restez immobile pendant la numérisation",
    },
    camera_lens: {
      details:
        "Vérifiez que l’objectif de votre appareil photo ne présente aucune trace ni poussière. Un objectif sale rend l’image finale floue, ce qui empêche la lecture des informations de la carte et la numérisation des données.",
      title: "Nettoyez l’objectif de votre appareil photo",
    },
    card_number: {
      details:
        "Le numéro de carte est généralement un numéro à 16 chiffres, même s'il peut comporter entre 12 et 19 chiffres. En général, il est imprimé ou gravé en relief sur toute la surface de la carte. Il peut figurer au recto ou au verso de votre carte.",
      title: "À quel endroit le numéro de carte figure-t-il ?",
    },
    done_btn: "Terminé",
    lighting: {
      details:
        "Évitez toute lumière directe et vive, car elle se reflète sur la carte et peut rendre certaines parties de la carte illisibles. Si les données ne sont pas lisibles sur la carte, elles ne le seront pas non plus pour la caméra.",
      title: "Faites attention aux lumières trop vives",
    },
    next_btn: "Suivant",
    occlusion: {
      details:
        "Veillez à ne pas recouvrir certaines parties de la carte avec un doigt, notamment les lignes de fond. Faites également attention aux reflets de l'hologramme qui recouvrent les champs de la carte.",
      title: "Gardez tous les champs visibles",
    },
  },
  onboarding_modal: {
    btn: "Commencer à numériser",
    details:
      "Le numéro de carte est généralement un numéro à 16 chiffres. En général, il est imprimé ou gravé en relief sur toute la surface de la carte. Assurez-vous que la carte est suffisamment éclairée et que tous les détails sont visibles.",
    details_desktop:
      "Le numéro de carte est généralement un numéro à 16 chiffres qui est imprimé ou gravé en relief sur toute la surface de la carte. Assurez-vous que l’objectif de votre appareil photo est propre, que la carte est suffisamment éclairée et que tous les détails sont visibles.",
    title: "Numérisez d'abord le numéro de carte",
  },
  timeout_modal: {
    cancel_btn: "Annuler",
    details: "Impossible de lire la carte. Veuillez réessayer.",
    retry_btn: "Réessayez",
    title: "Numérisation infructueuse",
  },
} as const;
