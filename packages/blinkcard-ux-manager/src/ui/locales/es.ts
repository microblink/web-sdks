/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for es.
 */
export default {
  feedback_messages: {
    blur_detected: "No muevas ni la tarjeta ni el teléfono",
    blur_detected_desktop: "No muevas ni la tarjeta ni el dispositivo",
    camera_angle_too_steep: "Mantenga la tarjeta paralela al teléfono",
    camera_angle_too_steep_desktop: "Mantén la tarjeta paralela a la pantalla",
    card_number_scanned:
      "¡Perfecto! Lado con el número de la tarjeta escaneado",
    card_scanned: "¡Perfecto! Tarjeta escaneada",
    document_too_close_to_edge: "Alejarse",
    flip_card: "Dele la vuelta a la tarjeta",
    flip_to_back_side: "Dele la vuelta a la tarjeta",
    move_closer: "Acercarse",
    move_farther: "Alejarse",
    occluded: "Mantenga la tarjeta completamente visible",
    scan_the_back_side: "Escanee el otro lado de la tarjeta",
    scan_the_front_side: "Escanee el número de la tarjeta",
  },
  help_button: { aria_label: "Ayuda", tooltip: "¿Necesitas ayuda?" },
  help_modal: {
    aria: "Ayuda para escanear",
    back_btn: "Atrás",
    blur: {
      details:
        "Intente mantener el teléfono y la tarjeta quietos mientras escanea. Mover cualquiera de los dos puede difuminar la imagen y hacer que los datos de la tarjeta sean ilegibles.",
      details_desktop:
        "Intenta mantener el dispositivo y la tarjeta quietos mientras escaneas. Si los mueves, la imagen se puede difuminar y hacer que los datos de la tarjeta sean ilegibles.",
      title: "No se mueva mientras escanea",
    },
    camera_lens: {
      details:
        "Revisa que no haya manchas ni polvo en la lente de la cámara. Una lente sucia hace que la imagen final salga borrosa, lo que hace que los datos de la tarjeta sean ilegibles e impide escanear la información correctamente.",
      title: "Limpia la lente de la cámara",
    },
    card_number: {
      details:
        "El número de la tarjeta suele tener 16 dígitos, aunque puede tener entre 12 y 19 dígitos. Debe estar impreso o grabado en relieve a lo largo de la tarjeta. Puede estar en el anverso o en el reverso de la tarjeta.",
      title: "¿Dónde está el número de la tarjeta?",
    },
    done_btn: "Hecho",
    done_btn_aria: "Reanudar escaneo",
    lighting: {
      details:
        "Evite la luz intensa directa porque se refleja en la tarjeta y puede hacer que algunas partes de la tarjeta sean ilegibles. Si no puede leer los datos de la tarjeta, tampoco serán visibles para la cámara.",
      title: "Cuidado con la luz intensa",
    },
    next_btn: "Siguiente",
    occlusion: {
      details:
        "Asegúrese de que no está cubriendo partes de la tarjeta con el dedo, incluidas las líneas inferiores. Además, tenga cuidado con los reflejos de los hologramas que sobrepasan los campos de la tarjeta.",
      title: "Mantenga todos los campos visibles",
    },
  },
  onboarding_modal: {
    aria: "Instrucciones para escanear",
    btn: "Empezar a escanear",
    details:
      "El número de la tarjeta suele tener 16 dígitos. Debe estar impreso o grabado en relieve a lo largo de la tarjeta. Asegúrese de que la tarjeta esté bien iluminada y de que todos los datos sean visibles.",
    details_desktop:
      "El número de la tarjeta suele tener 16 dígitos. Debe estar impreso o grabado en relieve a lo largo de la tarjeta. Asegúrate de que la lente de la cámara esté limpia, de que la tarjeta esté bien iluminada y de que todos los datos sean visibles.",
    title: "Primero escanee el número de la tarjeta",
  },
  sdk_aria: "Pantalla de escaneo de tarjetas",
  timeout_modal: {
    cancel_btn: "Cancelar",
    details: "No se ha podido leer la tarjeta. Inténtalo de nuevo.",
    retry_btn: "Reintentar",
    title: "Escaneo fallido",
  },
} as const;
