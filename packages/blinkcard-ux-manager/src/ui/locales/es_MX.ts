/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for es_MX.
 */
export default {
  feedback_messages: {
    blur_detected: "Mantenga la tarjeta y el teléfono quietos",
    blur_detected_desktop: "Mantenga la tarjeta y el dispositivo quietos",
    camera_angle_too_steep: "Mantenga la tarjeta paralela al teléfono",
    camera_angle_too_steep_desktop:
      "Mantenga la tarjeta paralela a la pantalla",
    card_number_scanned: "¡Éxito! Se escaneó el número de la tarjeta",
    card_scanned: "¡Éxito! Tarjeta escaneada",
    document_too_close_to_edge: "Alejar más",
    flip_card: "Voltee la tarjeta",
    flip_to_back_side: "Voltee la tarjeta",
    move_closer: "Acercar más",
    move_farther: "Alejar más",
    occluded: "Mantenga la tarjeta completamente visible",
    scan_the_back_side: "Escanee el otro lado de la tarjeta",
    scan_the_front_side: "Escanee el número de la tarjeta",
  },
  help_button: { aria_label: "Ayuda", tooltip: "¿Necesitas ayuda?" },
  help_modal: {
    back_btn: "Anterior",
    blur: {
      details:
        "Intente mantener el teléfono y la tarjeta quietos mientras escanea. Si mueve cualquiera de los dos, la imagen puede salir borrosa y los datos de la tarjeta pueden resultar ilegibles.",
      details_desktop:
        "Intente mantener el dispositivo y la tarjeta quietos mientras escanea. Si se mueven, la imagen puede salir borrosa y los datos de la tarjeta pueden resultar ilegibles.",
      title: "No mover durante el escaneo",
    },
    camera_lens: {
      details:
        "Compruebe que la lente de la cámara no tenga manchas ni polvo. Si la lente está sucia, la imagen final saldrá borrosa, lo que hará que los datos de la tarjeta sean ilegibles y que no se puedan escanear correctamente.",
      title: "Limpie la lente de la cámara",
    },
    card_number: {
      details:
        "El número de la tarjeta suele ser un número de 16 dígitos, aunque puede tener entre 12 y 19 dígitos. Debe estar impreso o grabado en relieve en la tarjeta. Puede estar en el anverso o en el reverso de la tarjeta.",
      title: "¿Dónde está el número de la tarjeta?",
    },
    done_btn: "Finalizar",
    lighting: {
      details:
        "Evite la luz directa intensa, ya que se refleja en la tarjeta y puede hacer que algunas partes de la misma resulten ilegibles. Si usted no puede leer los datos de la tarjeta, tampoco serán visibles para la cámara.",
      title: "Atención al exceso de luz",
    },
    next_btn: "Siguiente",
    occlusion: {
      details:
        "Asegúrese de no tapar ninguna parte de la tarjeta con el dedo, incluidas las líneas inferiores. Además, tenga cuidado con los reflejos del holograma que se producen sobre los campos de la tarjeta.",
      title: "Mantener visibles todos los campos",
    },
  },
  onboarding_modal: {
    btn: "Comience a escanear",
    details:
      "El número de la tarjeta suele ser un número de 16 dígitos. Debe estar impreso o grabado en relieve en la tarjeta. Asegúrese que la tarjeta esté bien iluminada y que todos los detalles sean visibles.",
    details_desktop:
      "El número de la tarjeta suele ser un número de 16 dígitos. Debe estar impreso o grabado en relieve en la tarjeta. Asegúrese que la lente de la cámara esté limpia, que la tarjeta esté bien iluminada y que todos los detalles sean visibles.",
    title: "Escanee primero el número de la tarjeta",
  },
  timeout_modal: {
    cancel_btn: "Cancelar",
    details: "No se puede leer la tarjeta. Inténtelo de nuevo.",
    retry_btn: "Reintentar",
    title: "Error de escaneo",
  },
} as const;
