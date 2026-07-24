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
  error_modal: { cancel_btn: "Cancelar", retry_btn: "Reintentar" },
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
    keep_still: "Manténgase quieto",
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
    scan_the_barcode_side:
      "Escanea el código de carras a un lado del documento",
    scan_the_front_side: "Escanear la parte delantera del documento",
    scan_the_mrz_side: "Escanee el lado del documento con la MRZ",
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
    barcode_only: {
      blur: {
        details:
          "Trate de mantener el teléfono y el código de barras quietos mientras escanea. Mover cualquiera de los dos puede hacer que la imagen se vea borrosa y esto dificultara la lectura del código de barras.",
        details_desktop:
          "Intente mantenerse quieto mientras escanea. Al moverse puede hacer que la imagen se vea borrosa y esto dificultará la lectura del código de barras.",
        title: "No mover durante el escaneo",
        title_desktop: "No mover durante el escaneo",
      },
      camera_lens: {
        details_desktop:
          "Revise el lente de su cámara por manchones o polvo. Los lentes sucios provocan que la imagen final esté borrosa.",
        title_desktop: "Limpie la lente de la cámara",
      },
      lighting: {
        details:
          "Evite luz intensa de manera directa, ya que esto puede provocar reflejos en el código de barras y esto dificultara su lectura. Si el código de barras no es visible para usted, la cámara tampoco será capaz de leerlo.",
        details_desktop:
          "Evite luz intensa de manera directa, ya que esto puede provocar reflejos en el código de barras y esto dificultara su lectura. Si el código de barras no es visible para usted, la cámara tampoco será capaz de leerlo.",
        title: "Atención al exceso de luz",
        title_desktop: "Atención al exceso de luz",
      },
      visibility: {
        details:
          "Asegúrese de que no esté cubriendo partes del código de barras con un dedo. También, asegúrese que ningún reflejo se proyecte sobre el código de barras que pueda hacerlo ilegible.",
        details_desktop:
          "Asegúrese de que no esté cubriendo partes del código de barras con un dedo. También, asegúrese que ningún reflejo se proyecte sobre el código de barras que pueda hacerlo ilegible.",
        title: "Mantenga su código de barras visible",
        title_desktop: "Mantenga su código de barras visible",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "Trata de no mover el celular ni el documento mientras se esté escaneando. Si se mueven, puede desenfocarse la imagen y provocar que el documento no pueda leerse.",
        details_desktop:
          "Trate de mantenerse quieto mientras escanea. Al moverse puede hacer que la imagen se vea borrosa y esto hará que los datos del documento sean ilegibles.",
        title: "No mover durante el escaneo",
        title_desktop: "No mover durante el escaneo",
      },
      camera_lens: {
        details_desktop:
          "Revisa si hay manchas o polvo en la lente de la cámara. Si la lente está sucia, la imagen final saldrá borrosa, por lo que los detalles del documento serán ilegibles y no se podrán escanear los datos correctamente.",
        title_desktop: "Limpie la lente de la cámara",
      },
      lighting: {
        details:
          "Evita el exceso de luz directa, ya que se refleja en el documento y puede provocar que algunas partes no puedan leerse. Si no alcanzas a leer los datos del documento, tampoco serán visibles para la cámara.",
        details_desktop:
          "Evita el exceso de luz directa, ya que se refleja en el documento y puede provocar que algunas partes no puedan leerse. Si no alcanzas a leer los datos del documento, tampoco serán visibles para la cámara.",
        title: "Atención al exceso de luz",
        title_desktop: "Atención al exceso de luz",
      },
      visibility: {
        details:
          "Asegúrese de que no esté cubriendo partes del código de barras con un dedo. También, asegúrese que ningún reflejo se proyecte sobre el código de barras que pueda hacerlo ilegible.",
        details_desktop:
          "Asegúrese de que no esté cubriendo partes del código de barras con un dedo. También, asegúrese que ningún reflejo se proyecte sobre el código de barras que pueda hacerlo ilegible.",
        title: "Mantenga su código de barras visible",
        title_desktop: "Mantenga su código de barras visible",
      },
    },
    document_with_mrz: {
      blur: {
        details:
          "Trata de no mover el celular ni el documento mientras se esté escaneando. Si se mueven, puede desenfocarse la imagen y provocar que el documento no pueda leerse.",
        details_desktop:
          "Trate de mantenerse quieto mientras escanea. Al moverse puede hacer que la imagen se vea borrosa y esto hará que los datos del documento sean ilegibles.",
        title: "No mover durante el escaneo",
        title_desktop: "No mover durante el escaneo",
      },
      camera_lens: {
        details_desktop:
          "Revisa si hay manchas o polvo en la lente de la cámara. Si la lente está sucia, la imagen final saldrá borrosa, por lo que los detalles del documento serán ilegibles y no se podrán escanear los datos correctamente.",
        title_desktop: "Limpie la lente de la cámara",
      },
      lighting: {
        details:
          "Evita el exceso de luz directa, ya que se refleja en el documento y puede provocar que algunas partes no puedan leerse. Si no alcanzas a leer los datos del documento, tampoco serán visibles para la cámara.",
        details_desktop:
          "Evita el exceso de luz directa, ya que se refleja en el documento y puede provocar que algunas partes no puedan leerse. Si no alcanzas a leer los datos del documento, tampoco serán visibles para la cámara.",
        title: "Atención al exceso de luz",
        title_desktop: "Atención al exceso de luz",
      },
      visibility: {
        details:
          "Asegúrate de no cubrir partes de la MRZ con un dedo. También, tenga cuidado con los reflejos que puedan pasar sobre la MRZ, ya que podrían hacerla ilegible.",
        details_desktop:
          "Asegúrate de no cubrir partes de la MRZ con un dedo. También, tenga cuidado con los reflejos que puedan pasar sobre la MRZ, ya que podrían hacerla ilegible.",
        title: "Mantenga la MRZ visible",
        title_desktop: "Mantenga la MRZ visible",
      },
    },
    done_btn: "Finalizar",
    done_btn_aria: "Escaneo de currículums",
    full_document: {
      blur: {
        details:
          "Trata de no mover el celular ni el documento mientras se esté escaneando. Si se mueven, puede desenfocarse la imagen y provocar que el documento no pueda leerse.",
        details_desktop:
          "Trate de mantenerse quieto mientras escanea. Al moverse puede hacer que la imagen se vea borrosa y esto hará que los datos del documento sean ilegibles.",
        title: "No mover durante el escaneo",
        title_desktop: "No mover durante el escaneo",
      },
      camera_lens: {
        details_desktop:
          "Revisa si hay manchas o polvo en la lente de la cámara. Si la lente está sucia, la imagen final saldrá borrosa, por lo que los detalles del documento serán ilegibles y no se podrán escanear los datos correctamente.",
        title_desktop: "Limpie la lente de la cámara",
      },
      lighting: {
        details:
          "Evita el exceso de luz directa, ya que se refleja en el documento y puede provocar que algunas partes no puedan leerse. Si no alcanzas a leer los datos del documento, tampoco serán visibles para la cámara.",
        details_desktop:
          "Evita el exceso de luz directa, ya que se refleja en el documento y puede provocar que algunas partes no puedan leerse. Si no alcanzas a leer los datos del documento, tampoco serán visibles para la cámara.",
        title: "Atención al exceso de luz",
        title_desktop: "Atención al exceso de luz",
      },
      visibility: {
        details:
          "Asegúrate de no cubrir partes del documento con un dedo, incluso las líneas inferiores. Asimismo, presta atención a los reflejos de hologramas que hay en los campos del documento.",
        details_desktop:
          "Asegúrate de no cubrir partes del documento con un dedo, incluso las líneas inferiores. Asimismo, presta atención a los reflejos de hologramas que hay en los campos del documento.",
        title: "Mantener visibles todos los campos",
        title_desktop: "Mantener visibles todos los campos",
      },
    },
    next_btn: "Siguiente",
  },
  onboarding_modal: {
    aria: "Instrucciones para escanear",
    barcode_only: {
      details:
        "Busque por un código de barras (una serie de líneas negras o un código cuadrado). Apunte su cámara a él y manténgase quieto — el escaneo ocurrirá automáticamente.",
      details_desktop:
        "Busque un código de barras (una serie de líneas negras o un código cuadrado), Asegúrese de mantener el lente de su cámara limpio y el código de barras bien iluminado.",
      title: "Ubique y escanee el código de barras",
      title_desktop: "Limpie su lente y ubique el código de barras.",
    },
    btn: "Comience a escanear",
    document_with_barcode: {
      details:
        "Diferentes tipos de documentos pueden tener diferentes formatos de códigos de barras y ubicaciones. Revise el frente y reverso del documento para verificar si tiene un código de barras.",
      details_desktop:
        "Revise el frente y el reverso del documento para verificar si tiene un código de barras. Asegúrese de mantener el lente de su cámara limpio y el documento bien iluminado.",
      title: "Localice el código de barras en el documento",
      title_desktop: "Limpie su lente y ubique el código de barras.",
    },
    document_with_mrz: {
      details:
        "Encontrará una larga cadena de caracteres en la parte inferior del frente o el reverso del documento, dividida en 2 o 3 líneas y separada por flechas (<< o >>).",
      details_desktop:
        "Revisa el frente y el reverso del documento para verificar si tiene una MRZ. Busca 2 o 3 líneas de caracteres con símbolos de flecha (<<) en la parte inferior del documento. Asegúrese de mantener el lente de la cámara limpio y el documento bien iluminado.",
      title: "Localice la MRZ en el documento",
      title_desktop: "Limpie su lente y localice la MRZ",
    },
    full_document: {
      details:
        "Asegúrate de que el documento esté bien iluminado. Deberán verse todos los campos del documento en la pantalla de la cámara.",
      details_desktop:
        "Asegúrate de mantener limpia la lente de la cámara y de que el documento esté bien iluminado. Todos los campos del documento deben ser visibles en la pantalla de la cámara.",
      title: "Mantener visibles todos los detalles",
      title_desktop: "Prepárate para escanear",
    },
  },
  sdk_aria: "Pantalla para escanear documentos",
  timeout_modal: {
    details:
      "Asegúrese de que el documento esté bien iluminado, completamente visible y libre de reflejos.",
    details_desktop:
      "Asegúrese de que el lente de su cámara esté limpio y que el documento sea completamente visible, enfocado y bien iluminado.",
    title: "No se pudo leer el documento",
  },
} as const;
