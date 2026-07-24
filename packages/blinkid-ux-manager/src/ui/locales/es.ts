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
  error_modal: { cancel_btn: "Cancelar", retry_btn: "Reintentar" },
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
    keep_still: "No lo muevas",
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
    scan_the_barcode_side:
      "Escanea el reverso del documento con el código de barras",
    scan_the_front_side: "Escaneo de la parte frontal\\nde un documento",
    scan_the_mrz_side: "Escanea el lado del MRZ de un documento",
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
    barcode_only: {
      blur: {
        details:
          "Intenta mantener el teléfono y el código de barras estables mientras escaneas. Si se mueve alguno de los dos, la imagen puede salir borrosa y el código de barras podría no leerse correctamente.",
        details_desktop:
          "Intenta no mover el documento mientras escaneas. Si se mueve, la imagen puede salir borrosa y el código de barras podría no leerse correctamente.",
        title: "No se mueva mientras escanea",
        title_desktop: "No se mueva mientras escanea",
      },
      camera_lens: {
        details_desktop:
          "Revisa que no haya manchas ni polvo en la lente de la cámara. Si está sucia, la imagen puede salir borrosa, lo que puede impedir que el código de barras se lea correctamente y que se escanee la información.",
        title_desktop: "Limpia la lente de la cámara",
      },
      lighting: {
        details:
          "Evita la luz directa fuerte, ya que puede generar reflejos en el código de barras y dificultar el escaneo. Si no ves el código de barras con claridad, es posible que la cámara tampoco pueda leerlo.",
        details_desktop:
          "Evita la luz directa fuerte, ya que puede generar reflejos en el código de barras y dificultar el escaneo. Si no ves el código de barras con claridad, es posible que la cámara tampoco pueda leerlo.",
        title: "Cuidado con la luz intensa",
        title_desktop: "Cuidado con la luz intensa",
      },
      visibility: {
        details:
          "Asegúrate de no cubrir partes del código de barras con el dedo. También ten cuidado con los reflejos que puedan cubrirlo y hacerlo ilegible.",
        details_desktop:
          "Asegúrate de no cubrir partes del código de barras con el dedo. También ten cuidado con los reflejos que puedan cubrirlo y hacerlo ilegible.",
        title: "Mantén el código de barras visible",
        title_desktop: "Mantén el código de barras visible",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "Intente mantener el teléfono y el documento quietos mientras escanea. Mover cualquiera de los dos puede difuminar la imagen y hacer que los datos del documento sean ilegibles.",
        details_desktop:
          "Intenta no mover el documento mientras escaneas. Si se mueve, la imagen puede salir borrosa y los datos del documento podrían no leerse correctamente.",
        title: "No se mueva mientras escanea",
        title_desktop: "No se mueva mientras escanea",
      },
      camera_lens: {
        details_desktop:
          "Revisa que no haya manchas ni polvo en la lente de la cámara. Una lente sucia hace que la imagen final salga borrosa, lo que hace que los datos del documento sean ilegibles e impide escanear la información correctamente.",
        title_desktop: "Limpia la lente de la cámara",
      },
      lighting: {
        details:
          "Evite la luz intensa directa porque se refleja en el documento y puede hacer que algunas partes del documento sean ilegibles. Si no puede leer los datos del documento, tampoco serán visibles para la cámara.",
        details_desktop:
          "Evite la luz intensa directa porque se refleja en el documento y puede hacer que algunas partes del documento sean ilegibles. Si no puede leer los datos del documento, tampoco serán visibles para la cámara.",
        title: "Cuidado con la luz intensa",
        title_desktop: "Cuidado con la luz intensa",
      },
      visibility: {
        details:
          "Asegúrate de no cubrir partes del código de barras con el dedo. También ten cuidado con los reflejos que puedan cubrirlo y hacerlo ilegible.",
        details_desktop:
          "Asegúrate de no cubrir partes del código de barras con el dedo. También ten cuidado con los reflejos que puedan cubrirlo y hacerlo ilegible.",
        title: "Mantén el código de barras visible",
        title_desktop: "Mantén el código de barras visible",
      },
    },
    document_with_mrz: {
      blur: {
        details:
          "Intente mantener el teléfono y el documento quietos mientras escanea. Mover cualquiera de los dos puede difuminar la imagen y hacer que los datos del documento sean ilegibles.",
        details_desktop:
          "Intenta no mover el documento mientras escaneas. Si se mueve, la imagen puede salir borrosa y los datos del documento podrían no leerse correctamente.",
        title: "No se mueva mientras escanea",
        title_desktop: "No se mueva mientras escanea",
      },
      camera_lens: {
        details_desktop:
          "Revisa que no haya manchas ni polvo en la lente de la cámara. Una lente sucia hace que la imagen final salga borrosa, lo que hace que los datos del documento sean ilegibles e impide escanear la información correctamente.",
        title_desktop: "Limpia la lente de la cámara",
      },
      lighting: {
        details:
          "Evite la luz intensa directa porque se refleja en el documento y puede hacer que algunas partes del documento sean ilegibles. Si no puede leer los datos del documento, tampoco serán visibles para la cámara.",
        details_desktop:
          "Evite la luz intensa directa porque se refleja en el documento y puede hacer que algunas partes del documento sean ilegibles. Si no puede leer los datos del documento, tampoco serán visibles para la cámara.",
        title: "Cuidado con la luz intensa",
        title_desktop: "Cuidado con la luz intensa",
      },
      visibility: {
        details:
          "Asegúrate de no cubrir partes del MRZ con el dedo. También ten cuidado con los reflejos que puedan cubrirlo y hacerlo ilegible.",
        details_desktop:
          "Asegúrate de no cubrir partes del MRZ con el dedo. También ten cuidado con los reflejos que puedan cubrirlo y hacerlo ilegible.",
        title: "Mantén el MRZ visible",
        title_desktop: "Mantén el MRZ visible",
      },
    },
    done_btn: "Hecho",
    done_btn_aria: "Reanudar escaneo",
    full_document: {
      blur: {
        details:
          "Intente mantener el teléfono y el documento quietos mientras escanea. Mover cualquiera de los dos puede difuminar la imagen y hacer que los datos del documento sean ilegibles.",
        details_desktop:
          "Intenta no mover el documento mientras escaneas. Si se mueve, la imagen puede salir borrosa y los datos del documento podrían no leerse correctamente.",
        title: "No se mueva mientras escanea",
        title_desktop: "No se mueva mientras escanea",
      },
      camera_lens: {
        details_desktop:
          "Revisa que no haya manchas ni polvo en la lente de la cámara. Una lente sucia hace que la imagen final salga borrosa, lo que hace que los datos del documento sean ilegibles e impide escanear la información correctamente.",
        title_desktop: "Limpia la lente de la cámara",
      },
      lighting: {
        details:
          "Evite la luz intensa directa porque se refleja en el documento y puede hacer que algunas partes del documento sean ilegibles. Si no puede leer los datos del documento, tampoco serán visibles para la cámara.",
        details_desktop:
          "Evite la luz intensa directa porque se refleja en el documento y puede hacer que algunas partes del documento sean ilegibles. Si no puede leer los datos del documento, tampoco serán visibles para la cámara.",
        title: "Cuidado con la luz intensa",
        title_desktop: "Cuidado con la luz intensa",
      },
      visibility: {
        details:
          "Asegúrese de que no está cubriendo partes del documento con el dedo, incluidas las líneas inferiores. Además, tenga cuidado con los reflejos de los hologramas que sobrepasan los campos del documento.",
        details_desktop:
          "Asegúrese de que no está cubriendo partes del documento con el dedo, incluidas las líneas inferiores. Además, tenga cuidado con los reflejos de los hologramas que sobrepasan los campos del documento.",
        title: "Mantenga todos los campos visibles",
        title_desktop: "Mantenga todos los campos visibles",
      },
    },
    next_btn: "Siguiente",
  },
  onboarding_modal: {
    aria: "Instrucciones para escanear",
    barcode_only: {
      details:
        "Busca un código de barras (una serie de líneas negras o un código cuadrado). Apunta con la cámara hacia él y no muevas el teléfono: el escaneo se realizará automáticamente.",
      details_desktop:
        "Busca un código de barras (una serie de líneas negras o un código cuadrado). Asegúrate de que la lente de la cámara esté limpia y de que el código de barras esté bien iluminado.",
      title: "Busca y escanea el código de barras",
      title_desktop: "Limpia la lente y busca el código de barras",
    },
    btn: "Empezar a escanear",
    document_with_barcode: {
      details:
        "Cada tipo de documento puede tener un formato y una ubicación del código de barras diferente. Busca el código de barras tanto en la parte frontal como en el reverso del documento.",
      details_desktop:
        "Comprueba el anverso y el reverso del documento en busca de un código de barras. Asegúrate de que la lente de la cámara esté limpia y de que el documento esté bien iluminado.",
      title: "Localiza el código de barras en el documento",
      title_desktop: "Limpia la lente y busca el código de barras",
    },
    document_with_mrz: {
      details:
        "En la parte inferior de la parte frontal o del reverso del documento encontrarás una larga cadena de caracteres dividida en 2 o 3 líneas y separada por flechas (<< o >>).",
      details_desktop:
        "Comprueba si hay un MRZ en el anverso y el reverso del documento. Busca entre 2 y 3 líneas de caracteres y símbolos de flecha (<<) en la parte inferior del documento. Asegúrate de que la lente de la cámara esté limpia y de que el documento esté bien iluminado.",
      title: "Localiza el MRZ en el documento",
      title_desktop: "Limpia la lente y busca el MRZ",
    },
    full_document: {
      details:
        "Asegúrese de mantener el documento bien iluminado. Todos los campos del documento deben ser visibles en la pantalla de la cámara.",
      details_desktop:
        "Asegúrate de mantener limpia la lente de la cámara y de que el documento esté bien iluminado. Todos los campos del documento deben ser visibles en la pantalla de la cámara.",
      title: "Mantenga todos los detalles visibles",
      title_desktop: "Prepárate para escanear",
    },
  },
  sdk_aria: "Pantalla de escaneo de documentos",
  timeout_modal: {
    details:
      "Asegúrate de que el documento esté bien iluminado, se vea completamente y no haya reflejos.",
    details_desktop:
      "Asegúrate de que la lente de la cámara esté limpia y de que el documento se vea completamente, esté enfocado y bien iluminado.",
    title: "No se ha podido leer el documento",
  },
} as const;
