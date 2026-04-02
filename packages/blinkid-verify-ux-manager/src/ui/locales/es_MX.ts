/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for es_MX.
 */
export default {
  document_filtered_modal: {
    details: "Prueba a escanear otro documento.",
    title: "No se acepta este documento",
  },
  document_not_recognized_modal: {
    details: "Escanea la parte delantera de un documento compatible.",
    title: "Documento no reconocido",
  },
  feedback_messages: {
    blur_detected: "No mover el documento ni el celular",
    camera_angle_too_steep: "Mantener el documento en paralelo al celular",
    document_scanned_aria: "¡Completado! Documento escaneado",
    document_too_close_to_edge: "Alejar más",
    face_photo_not_fully_visible: "Mantener visible toda la foto",
    flip_document: "Voltear el documento",
    flip_to_back_side: "Voltear hacia la parte trasera",
    front_side_scanned_aria: "¡Completado! Lado frontal escaneado",
    glare_detected: "Inclinar o mover el documento para evitar reflejos",
    keep_document_parallel: "Mantén el documento paralelo a la pantalla.",
    keep_document_still: "Mantén el documento y el dispositivo quietos.",
    move_closer: "Acercar más",
    move_farther: "Alejar más",
    move_left: "Mover a la página de la izquierda",
    move_right: "Mover a la página de la derecha",
    move_top: "Mover a la página principal",
    occluded: "Mantener visible todo el documento",
    scan_data_page: "Escanear la página de datos del documento",
    scan_last_page_barcode: "Escanear el código de barras de la última página",
    scan_left_page: "Escanear la página izquierda",
    scan_right_page: "Escanear la página derecha",
    scan_the_back_side: "Escanear la parte trasera del documento",
    scan_the_barcode: "Escanear el código de barras",
    scan_the_front_side: "Escanear la parte delantera del documento",
    scan_top_page: "Escanear la página principal",
    too_bright: "Mover a un sitio con menos luz",
    too_dark: "Mover a un sitio con más luz",
    wrong_left: "Mover a la página izquierda",
    wrong_right: "Mover a la página derecha",
    wrong_top: "Mover a la página principal",
  },
  help_button: { aria_label: "Ayuda", tooltip: "¿Necesitas ayuda?" },
  help_modal: {
    aria: "Ayuda para escanear",
    back_btn: "Anterior",
    blur: {
      details:
        "Trata de no mover el celular ni el documento mientras se esté escaneando. Si se mueven, puede desenfocarse la imagen y provocar que el documento no pueda leerse.",
      details_desktop:
        "Intenta mantener el dispositivo y el documento quietos mientras escaneas. Si se mueven, la imagen puede salir borrosa y los datos del documento pueden ser ilegibles.",
      title: "No mover durante el escaneo",
    },
    camera_lens: {
      details:
        "Revisa si hay manchas o polvo en la lente de la cámara. Si la lente está sucia, la imagen final saldrá borrosa, por lo que los detalles del documento serán ilegibles y no se podrán escanear los datos correctamente.",
      title: "Limpie la lente de la cámara",
    },
    done_btn: "Finalizar",
    done_btn_aria: "Escaneo de currículums",
    lighting: {
      details:
        "Evita el exceso de luz directa, ya que se refleja en el documento y puede provocar que algunas partes no puedan leerse. Si no alcanzas a leer los datos del documento, tampoco serán visibles para la cámara.",
      title: "Atención al exceso de luz",
    },
    next_btn: "Siguiente",
    visibility: {
      details:
        "Asegúrate de no cubrir partes del documento con un dedo, incluso las líneas inferiores. Asimismo, presta atención a los reflejos de hologramas que hay en los campos del documento.",
      title: "Mantener visibles todos los campos",
    },
  },
  onboarding_modal: {
    aria: "Instrucciones para escanear",
    btn: "Comience a escanear",
    details:
      "Asegúrate de que el documento esté bien iluminado. Deberán verse todos los campos del documento en la pantalla de la cámara.",
    details_desktop:
      "Asegúrate de mantener limpia la lente de la cámara y de que el documento esté bien iluminado. Todos los campos del documento deben ser visibles en la pantalla de la cámara.",
    title: "Mantener visibles todos los detalles",
    title_desktop: "Prepárate para escanear",
  },
  sdk_aria: "Pantalla para escanear documentos",
  timeout_modal: {
    cancel_btn: "Cancelar",
    details: "No se puede leer el documento. Inténtalo de nuevo.",
    retry_btn: "Reintentar",
    title: "Error de escaneo",
  },
} as const;
