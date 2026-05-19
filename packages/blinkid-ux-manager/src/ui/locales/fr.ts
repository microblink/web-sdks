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
  error_modal: { cancel_btn: "Annuler", retry_btn: "Réessayez" },
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
    keep_still: "Restez immobile",
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
    scan_the_barcode_side: "Numériser le code-barres d’un document",
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
    barcode_only: {
      blur: {
        details:
          "Essayez de garder le téléphone et le code-barres immobiles pendant la numérisation. Tout mouvement peut brouiller l’image ou rendre le code-barres difficile à lire.",
        details_desktop:
          "Essayez de rester immobile pendant la numérisation. Tout mouvement peut brouiller l’image et rendre le code-barres difficile à lire.",
        title: "Restez immobile pendant la numérisation",
        title_desktop: "Restez immobile pendant la numérisation",
      },
      camera_lens: {
        details_desktop:
          "Vérifiez que l’objectif de votre appareil photo ne présente aucune trace ni poussière. Un objectif sale rend l’image finale floue, ce qui empêche la lecture du code-barres et la numérisation des données.",
        title_desktop: "Nettoyez l’objectif de votre appareil photo",
      },
      lighting: {
        details:
          "Évitez la lumière directe et puissante, car celle-ci peut créer des reflets sur le code-barres et rendre sa lecture difficile. Si le code-barres n’est pas clairement visible, l’appareil photo risque de ne pas pouvoir le lire non plus.",
        details_desktop:
          "Évitez la lumière directe et puissante, car celle-ci peut créer des reflets sur le code-barres et rendre sa lecture difficile. Si le code-barres n’est pas clairement visible, l’appareil photo risque de ne pas pouvoir le lire non plus.",
        title: "Faites attention aux lumières trop vives",
        title_desktop: "Faites attention aux lumières trop vives",
      },
      visibility: {
        details:
          "Veillez à ce que votre doigt ne recouvre pas certaines parties du code-barres. Faites également attention aux reflets qui masquent le code-barres et peuvent le rendre illisible.",
        details_desktop:
          "Veillez à ce que votre doigt ne recouvre pas certaines parties du code-barres. Faites également attention aux reflets qui masquent le code-barres et peuvent le rendre illisible.",
        title: "Gardez le code-barres visible",
        title_desktop: "Gardez le code-barres visible",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "Essayez de garder le téléphone et le document immobiles pendant la numérisation. Tout mouvement de l'un ou l'autre peut brouiller l'image et rendre les données du document illisibles.",
        details_desktop:
          "Essayez de rester immobile pendant la numérisation. Tout mouvement peut brouiller l’image et rendre les données du document illisibles.",
        title: "Restez immobile pendant la numérisation",
        title_desktop: "Restez immobile pendant la numérisation",
      },
      camera_lens: {
        details_desktop:
          "Vérifiez que l’objectif de votre appareil photo ne présente aucune trace ni poussière. Un objectif sale rend l’image finale floue, ce qui empêche la lecture des informations du document ainsi que la numérisation des données.",
        title_desktop: "Nettoyez l’objectif de votre appareil photo",
      },
      lighting: {
        details:
          "Évitez toute lumière directe et vive, car elle se reflète sur le document et peut rendre certaines parties du document illisibles. Si les données ne sont pas lisibles sur le document, elles ne le seront pas non plus pour la caméra.",
        details_desktop:
          "Évitez toute lumière directe et vive, car elle se reflète sur le document et peut rendre certaines parties du document illisibles. Si les données ne sont pas lisibles sur le document, elles ne le seront pas non plus pour la caméra.",
        title: "Faites attention aux lumières trop vives",
        title_desktop: "Faites attention aux lumières trop vives",
      },
      visibility: {
        details:
          "Veillez à ce que votre doigt ne recouvre pas certaines parties du code-barres. Faites également attention aux reflets qui masquent le code-barres et peuvent le rendre illisible.",
        details_desktop:
          "Veillez à ce que votre doigt ne recouvre pas certaines parties du code-barres. Faites également attention aux reflets qui masquent le code-barres et peuvent le rendre illisible.",
        title: "Gardez le code-barres visible",
        title_desktop: "Gardez le code-barres visible",
      },
    },
    done_btn: "Terminé",
    done_btn_aria: "Reprendre la numérisation",
    full_document: {
      blur: {
        details:
          "Essayez de garder le téléphone et le document immobiles pendant la numérisation. Tout mouvement de l'un ou l'autre peut brouiller l'image et rendre les données du document illisibles.",
        details_desktop:
          "Essayez de rester immobile pendant la numérisation. Tout mouvement peut brouiller l’image et rendre les données du document illisibles.",
        title: "Restez immobile pendant la numérisation",
        title_desktop: "Restez immobile pendant la numérisation",
      },
      camera_lens: {
        details_desktop:
          "Vérifiez que l’objectif de votre appareil photo ne présente aucune trace ni poussière. Un objectif sale rend l’image finale floue, ce qui empêche la lecture des informations du document ainsi que la numérisation des données.",
        title_desktop: "Nettoyez l’objectif de votre appareil photo",
      },
      lighting: {
        details:
          "Évitez toute lumière directe et vive, car elle se reflète sur le document et peut rendre certaines parties du document illisibles. Si les données ne sont pas lisibles sur le document, elles ne le seront pas non plus pour la caméra.",
        details_desktop:
          "Évitez toute lumière directe et vive, car elle se reflète sur le document et peut rendre certaines parties du document illisibles. Si les données ne sont pas lisibles sur le document, elles ne le seront pas non plus pour la caméra.",
        title: "Faites attention aux lumières trop vives",
        title_desktop: "Faites attention aux lumières trop vives",
      },
      visibility: {
        details:
          "Veillez à ne pas recouvrir certaines parties du document avec un doigt, notamment les lignes de fond. Faites également attention aux reflets de l'hologramme qui recouvrent les champs du document.",
        details_desktop:
          "Veillez à ne pas recouvrir certaines parties du document avec un doigt, notamment les lignes de fond. Faites également attention aux reflets de l'hologramme qui recouvrent les champs du document.",
        title: "Gardez tous les champs visibles",
        title_desktop: "Gardez tous les champs visibles",
      },
    },
    next_btn: "Suivant",
  },
  onboarding_modal: {
    aria: "Instructions relatives à la numérisation",
    barcode_only: {
      details:
        "Cherchez un code-barres (une série de lignes noires ou un code carré). Pointez votre appareil photo vers l’objet et restez immobile, la numérisation se fera de façon automatique.",
      details_desktop:
        "Cherchez un code-barres (une série de lignes noires ou un code carré). Assurez-vous que l’objectif de votre appareil photo est propre et que le code-barres est bien éclairé.",
      title: "Localiser et numériser le code-barres",
      title_desktop: "Nettoyez votre objectif et localisez le code-barres",
    },
    btn: "Commencer à numériser",
    document_with_barcode: {
      details:
        "Les différents types de pièces d’identité peuvent avoir des formats et des emplacements de codes-barres différents. Examinez le recto et le verso de la pièce d’identité à la recherche d’un code-barres.",
      details_desktop:
        "Cherchez un code-barres au recto et au verso de la pièce d’identité. Assurez-vous que l’objectif de votre appareil photo est propre et que le document est bien éclairé.",
      title: "Localiser le code-barres sur la pièce d’identité",
      title_desktop: "Nettoyez votre objectif et localisez le code-barres",
    },
    full_document: {
      details:
        "Prenez soin de garder le document bien éclairé. Tous les champs du document doivent être visibles sur l'écran de la caméra.",
      details_desktop:
        "Assurez-vous que l’objectif de votre caméra est propre et que le document est bien éclairé. Tous les champs du document doivent être visibles sur l’écran de la caméra.",
      title: "Gardez tous les détails visibles",
      title_desktop: "Préparez-vous à la numérisation",
    },
  },
  sdk_aria: "Écran de numérisation du document",
  timeout_modal: {
    details: "Impossible de lire le document. Veuillez réessayer.",
    title: "Numérisation infructueuse",
  },
} as const;
