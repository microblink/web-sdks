/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for es.
 */
export default {
  document_filtered_modal: {
    details: "Intente escanear otro documento.",
    title: "Documento no aceptado",
  },
  document_not_recognized_modal: {
    details: "Escanee la parte frontal de un documento compatible.",
    title: "Documento no reconocido",
  },
  feedback_messages: {
    blur_detected: "No mueva ni el documento ni el teléfono",
    camera_angle_too_steep: "Mantenga el documento en paralelo al teléfono",
    document_scanned_aria: "¡Bien! Documento escaneado",
    document_too_close_to_edge: "Alejarse",
    face_photo_not_fully_visible:
      "Mantenga la foto del rostro completamente visible",
    flip_document: "Dar la vuelta al documento",
    flip_to_back_side: "Dele la vuelta al documento",
    front_side_scanned_aria: "¡Bien! Cara frontal escaneada",
    glare_detected: "Incline o mueva el documento para evitar los reflejos",
    keep_document_parallel: "Mantén el documento paralelo a la pantalla",
    keep_document_still: "No muevas ni el documento ni el dispositivo",
    move_closer: "Acercarse",
    move_farther: "Alejarse",
    move_left: "Ir a la página de la izquierda",
    move_right: "Vaya a la página de la derecha.",
    move_top: "Ir a la página superior",
    occluded: "Mantenga el documento visible en su totalidad",
    scan_data_page: "Escanea la página de datos del documento.",
    scan_last_page_barcode: "Escanee el código de barras de la última página",
    scan_left_page: "Escanear la página de la izquierda",
    scan_right_page: "Escanear la página de la derecha",
    scan_the_back_side: "Escanea la parte de atrás del documento",
    scan_the_barcode: "Escanea el código de barras",
    scan_the_front_side: "Escaneo de la parte frontal\\nde un documento",
    scan_top_page: "Escanear la página superior",
    too_bright: "Muévase a un lugar con menos luz",
    too_dark: "Muévase a un lugar con más luz",
    wrong_left: "Ir a la página de la izquierda",
    wrong_right: "Ir a la página de la derecha",
    wrong_top: "Ir a la página superior",
  },
  help_button: { aria_label: "Ayuda", tooltip: "¿Necesitas ayuda?" },
  help_modal: {
    aria: "Ayuda para escanear",
    back_btn: "Atrás",
    blur: {
      details:
        "Intente mantener el teléfono y el documento quietos mientras escanea. Mover cualquiera de los dos puede difuminar la imagen y hacer que los datos del documento sean ilegibles.",
      details_desktop:
        "Intente mantener el dispositivo y el documento quietos mientras escanea. Mover cualquiera de los dos puede difuminar la imagen y hacer que los datos del documento sean ilegibles.",
      title: "No se mueva mientras escanea",
    },
    camera_lens: {
      details:
        "Revisa que no haya manchas ni polvo en la lente de la cámara. Una lente sucia hace que la imagen final salga borrosa, lo que hace que los datos del documento sean ilegibles e impide escanear la información correctamente.",
      title: "Limpia la lente de la cámara",
    },
    done_btn: "Hecho",
    done_btn_aria: "Reanudar escaneo",
    lighting: {
      details:
        "Evite la luz intensa directa porque se refleja en el documento y puede hacer que algunas partes del documento sean ilegibles. Si no puede leer los datos del documento, tampoco serán visibles para la cámara.",
      title: "Cuidado con la luz intensa",
    },
    next_btn: "Siguiente",
    visibility: {
      details:
        "Asegúrese de que no está cubriendo partes del documento con el dedo, incluidas las líneas inferiores. Además, tenga cuidado con los reflejos de los hologramas que sobrepasan los campos del documento.",
      title: "Mantenga todos los campos visibles",
    },
  },
  onboarding_modal: {
    aria: "Instrucciones para escanear",
    btn: "Empezar a escanear",
    details:
      "Asegúrese de mantener el documento bien iluminado. Todos los campos del documento deben ser visibles en la pantalla de la cámara.",
    details_desktop:
      "Asegúrate de mantener limpia la lente de la cámara y de que el documento esté bien iluminado. Todos los campos del documento deben ser visibles en la pantalla de la cámara.",
    title: "Mantenga todos los detalles visibles",
    title_desktop: "Prepárate para escanear",
  },
  sdk_aria: "Pantalla de escaneo de documentos",
  timeout_modal: {
    cancel_btn: "Cancelar",
    details: "No se puede leer el documento. Por favor, inténtelo de nuevo.",
    retry_btn: "Reintentar",
    title: "Escaneo fallido",
  },
} as const;
