/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for fr_CA.
 */
export default {
  document_filtered_modal: {
    details: "Veuillez essayer de numériser un autre document.",
    title: "Document non accepté",
  },
  document_not_recognized_modal: {
    details: "Numérisez le recto d'un document pris en charge.",
    title: "Document non reconnu",
  },
  error_modal: { cancel_btn: "Annuler", retry_btn: "Réessayer" },
  feedback_messages: {
    blur_detected: "Veuillez maintenir le document et le téléphone immobiles.",
    camera_angle_too_steep: "Maintenez le document parallèle au téléphone",
    document_scanned_aria: "Succès ! Document numérisé",
    document_too_close_to_edge: "Éloignez-vous",
    face_photo_not_fully_visible:
      "Veuillez vous assurer que la photo du visage est entièrement visible.",
    flip_document: "Veuillez retourner le document.",
    flip_to_back_side: "Retournez le document",
    front_side_scanned_aria: "Succès ! Face avant numérisée",
    glare_detected:
      "Veuillez incliner ou déplacer le document pour éliminer les reflets.",
    keep_document_parallel: "Maintenez le document parallèle à l'écran",
    keep_still: "Restez immobile",
    move_closer: "Rapprochez-vous",
    move_farther: "Éloignez-vous",
    move_left: "Veuillez passer à la page de gauche.",
    move_right: "Veuillez passer à la page de droite.",
    move_top: "Veuillez passer à la page supérieure.",
    occluded: "Veillez à ce que le document soit entièrement visible.",
    scan_data_page: "Numérisez la page de données du document",
    scan_last_page_barcode: "Scanner le code-barres de la dernière page.",
    scan_left_page: "Veuillez numériser la page de gauche.",
    scan_right_page: "Veuillez numériser la page de droite.",
    scan_the_back_side: "Scannez le verso du document.",
    scan_the_barcode: "Scannez le code-barres.",
    scan_the_barcode_side:
      "Numérisez la face du document sur laquelle se trouve le code-barres",
    scan_the_front_side: "Numérisez le recto du document",
    scan_the_mrz_side:
      "Numérisez la face du document sur laquelle se trouve la ZLA",
    scan_top_page: "Veuillez numériser la page supérieure.",
    too_bright: "Veuillez vous déplacer vers un endroit moins éclairé.",
    too_dark: "Veuillez vous déplacer vers un endroit plus éclairé.",
    wrong_left: "Veuillez passer à la page de gauche.",
    wrong_right: "Veuillez passer à la page de droite.",
    wrong_top: "Veuillez passer à la page supérieure.",
  },
  help_button: { aria_label: "Aide", tooltip: "Besoin d'aide?" },
  help_modal: {
    aria: "Aide à la numérisation",
    back_btn: "Retour",
    barcode_only: {
      blur: {
        details:
          "Essayez de maintenir le téléphone et le code-barres immobiles pendant la numérisation. Tout mouvement peut rendre l'image floue et le code-barres difficile à lire.",
        details_desktop:
          "Essayez de rester immobile pendant la numérisation. Tout mouvement peut rendre l'image floue et le code-barres difficile à lire.",
        title: "Restez immobile pendant le scan.",
        title_desktop: "Restez immobile pendant le scan.",
      },
      camera_lens: {
        details_desktop:
          "Vérifiez que l'objectif de votre appareil photo ne présente pas de trace ou de poussière. Un objectif sale rend le code-barres illisible et empêche la bonne numérisation des données.",
        title_desktop: "Nettoyez l'objectif de votre appareil photo",
      },
      lighting: {
        details:
          "Évitez la lumière directe et intense, car elle peut créer des reflets sur le code-barres et le rendre difficile à numériser. Si le code-barres n'est pas clairement visible pour vous, il se peut que l'appareil photo ne parvienne pas non plus à le lire.",
        details_desktop:
          "Évitez la lumière directe et intense, car elle peut créer des reflets sur le code-barres et le rendre difficile à numériser. Si le code-barres n'est pas clairement visible pour vous, il se peut que l'appareil photo ne parvienne pas non plus à le lire.",
        title: "Faites attention à la lumière vive",
        title_desktop: "Faites attention à la lumière vive",
      },
      visibility: {
        details:
          "Assurez-vous de ne pas couvrir certaines parties du code-barres avec un doigt. Faites également attention aux reflets qui pourraient se refléter sur le code-barres et le rendre illisible.",
        details_desktop:
          "Assurez-vous de ne pas couvrir certaines parties du code-barres avec un doigt. Faites également attention aux reflets qui pourraient se refléter sur le code-barres et le rendre illisible.",
        title: "Gardez le code-barres visible",
        title_desktop: "Gardez le code-barres visible",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "Essayez de maintenir le téléphone et le document immobiles pendant la numérisation. Tout mouvement peut rendre l'image floue et les données du document illisibles.",
        details_desktop:
          "Essayez de rester immobile pendant la numérisation. Tout mouvement peut rendre l'image floue et les données du document illisibles.",
        title: "Restez immobile pendant le scan.",
        title_desktop: "Restez immobile pendant le scan.",
      },
      camera_lens: {
        details_desktop:
          "Vérifiez que l'objectif de votre appareil photo ne présente pas de trace ou de poussière. Un objectif sale rend l'image finale floue, les détails du document illisibles et empêche la bonne numérisation des données.",
        title_desktop: "Nettoyez l'objectif de votre appareil photo",
      },
      lighting: {
        details:
          "Évitez la lumière directe et intense, car elle se reflète sur le document et peut rendre certaines parties illisibles. Si vous ne pouvez pas lire les données sur le document, elles ne seront pas visibles non plus pour l'appareil photo.",
        details_desktop:
          "Évitez la lumière directe et intense, car elle se reflète sur le document et peut rendre certaines parties illisibles. Si vous ne pouvez pas lire les données sur le document, elles ne seront pas visibles non plus pour l'appareil photo.",
        title: "Faites attention à la lumière vive",
        title_desktop: "Faites attention à la lumière vive",
      },
      visibility: {
        details:
          "Assurez-vous de ne pas couvrir certaines parties du code-barres avec un doigt. Faites également attention aux reflets qui pourraient se refléter sur le code-barres et le rendre illisible.",
        details_desktop:
          "Assurez-vous de ne pas couvrir certaines parties du code-barres avec un doigt. Faites également attention aux reflets qui pourraient se refléter sur le code-barres et le rendre illisible.",
        title: "Gardez le code-barres visible",
        title_desktop: "Gardez le code-barres visible",
      },
    },
    document_with_mrz: {
      blur: {
        details:
          "Essayez de maintenir le téléphone et le document immobiles pendant la numérisation. Tout mouvement peut rendre l'image floue et les données du document illisibles.",
        details_desktop:
          "Essayez de rester immobile pendant la numérisation. Tout mouvement peut rendre l'image floue et les données du document illisibles.",
        title: "Restez immobile pendant le scan.",
        title_desktop: "Restez immobile pendant le scan.",
      },
      camera_lens: {
        details_desktop:
          "Vérifiez que l'objectif de votre appareil photo ne présente pas de trace ou de poussière. Un objectif sale rend l'image finale floue, les détails du document illisibles et empêche la bonne numérisation des données.",
        title_desktop: "Nettoyez l'objectif de votre appareil photo",
      },
      lighting: {
        details:
          "Évitez la lumière directe et intense, car elle se reflète sur le document et peut rendre certaines parties illisibles. Si vous ne pouvez pas lire les données sur le document, elles ne seront pas visibles non plus pour l'appareil photo.",
        details_desktop:
          "Évitez la lumière directe et intense, car elle se reflète sur le document et peut rendre certaines parties illisibles. Si vous ne pouvez pas lire les données sur le document, elles ne seront pas visibles non plus pour l'appareil photo.",
        title: "Faites attention à la lumière vive",
        title_desktop: "Faites attention à la lumière vive",
      },
      visibility: {
        details:
          "Assurez-vous de ne pas couvrir certaines parties de la ZLA avec un doigt. Faites également attention aux reflets qui pourraient apparaître sur le code-barres et le rendre illisible.",
        details_desktop:
          "Assurez-vous de ne pas couvrir certaines parties de la ZLA avec un doigt. Faites également attention aux reflets qui pourraient apparaître sur le code-barres et le rendre illisible.",
        title: "Gardez la ZLA visible",
        title_desktop: "Gardez la ZLA visible",
      },
    },
    done_btn: "Terminé",
    done_btn_aria: "Reprendre la numérisation",
    full_document: {
      blur: {
        details:
          "Essayez de maintenir le téléphone et le document immobiles pendant la numérisation. Tout mouvement peut rendre l'image floue et les données du document illisibles.",
        details_desktop:
          "Essayez de rester immobile pendant la numérisation. Tout mouvement peut rendre l'image floue et les données du document illisibles.",
        title: "Restez immobile pendant le scan.",
        title_desktop: "Restez immobile pendant le scan.",
      },
      camera_lens: {
        details_desktop:
          "Vérifiez que l'objectif de votre appareil photo ne présente pas de trace ou de poussière. Un objectif sale rend l'image finale floue, les détails du document illisibles et empêche la bonne numérisation des données.",
        title_desktop: "Nettoyez l'objectif de votre appareil photo",
      },
      lighting: {
        details:
          "Évitez la lumière directe et intense, car elle se reflète sur le document et peut rendre certaines parties illisibles. Si vous ne pouvez pas lire les données sur le document, elles ne seront pas visibles non plus pour l'appareil photo.",
        details_desktop:
          "Évitez la lumière directe et intense, car elle se reflète sur le document et peut rendre certaines parties illisibles. Si vous ne pouvez pas lire les données sur le document, elles ne seront pas visibles non plus pour l'appareil photo.",
        title: "Faites attention à la lumière vive",
        title_desktop: "Faites attention à la lumière vive",
      },
      visibility: {
        details:
          "Assurez-vous de ne pas couvrir certaines parties du document avec votre doigt, y compris les lignes du bas. Faites également attention aux reflets holographiques qui apparaissent sur les champs du document.",
        details_desktop:
          "Assurez-vous de ne pas couvrir certaines parties du document avec votre doigt, y compris les lignes du bas. Faites également attention aux reflets holographiques qui apparaissent sur les champs du document.",
        title: "Veillez à ce que tous les champs soient visibles.",
        title_desktop: "Veillez à ce que tous les champs soient visibles.",
      },
    },
    next_btn: "Suivant",
  },
  onboarding_modal: {
    aria: "Instructions de numérisation",
    barcode_only: {
      details:
        "Recherchez un code-barres (une série de lignes noires ou un code carré). Dirigez votre appareil photo vers celui-ci et restez parfaitement immobile : la numérisation se fera automatiquement.",
      details_desktop:
        "Recherchez un code-barres (une série de lignes noires ou un code carré). Assurez-vous que l'objectif de votre appareil photo est propre et le code-barres bien éclairé.",
      title: "Localisez et numérisez le code-barres",
      title_desktop: "Nettoyez votre objectif et localisez le code-barres",
    },
    btn: "Commencer le balayage",
    document_with_barcode: {
      details:
        "Les différents types de document peuvent posséder des formats et des emplacements de code-barres distincts. Vérifiez la présence d'un code-barres au recto et au verso du document.",
      details_desktop:
        "Assurez-vous que recto ou le verso du document comporte un code-barres. Vérifiez que l'objectif de votre appareil photo est propre et le document bien éclairé.",
      title: "Localisez le code-barres sur le document",
      title_desktop: "Nettoyez votre objectif et localisez le code-barres",
    },
    document_with_mrz: {
      details:
        "Vous trouverez une longue suite de caractères au bas de la première ou de la dernière page du document, répartie sur deux ou trois lignes et séparée par des flèches (<< ou >>).",
      details_desktop:
        "Vérifiez la présence d'une ZLA au recto et au verso du document. Recherchez 2 à 3 lignes de caractères et des flèches (<<) au bas du document. Veillez à ce que l'objectif de votre appareil photo soit propre et que le document soit bien éclairé.",
      title: "Localisez la ZLA sur le document",
      title_desktop: "Nettoyez votre objectif et localisez la ZLA",
    },
    full_document: {
      details:
        "Assurez-vous que le document est bien éclairé. Tous les champs du document doivent être visibles sur l'écran de l'appareil photo.",
      details_desktop:
        "Assurez-vous que l'objectif de votre caméra est propre et que le document est bien éclairé. Tous les champs du document doivent être visibles sur l'écran de l'appareil photo.",
      title: "Veillez à ce que tous les détails soient visibles.",
      title_desktop: "Préparez-vous à la numérisation",
    },
  },
  sdk_aria: "Écran de numérisation du document",
  timeout_modal: {
    details:
      "Vérifiez que le document est bien éclairé, entièrement visible et exempt de reflets.",
    details_desktop:
      "Assurez-vous que l'objectif de votre appareil photo est propre et que le document est entièrement visible, net et bien éclairé.",
    title: "Impossible de lire le document",
  },
} as const;
