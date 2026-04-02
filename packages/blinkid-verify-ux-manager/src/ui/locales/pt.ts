/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for pt.
 */
export default {
  document_filtered_modal: {
    details: "Tente digitalizar um documento diferente.",
    title: "Documento não aceite",
  },
  document_not_recognized_modal: {
    details: "Digitalize a frente de um documento suportado.",
    title: "Documento não reconhecido",
  },
  feedback_messages: {
    blur_detected: "Mantenha o documento e o telemóvel imóveis",
    camera_angle_too_steep: "Mantenha o documento paralelo ao telemóvel",
    document_scanned_aria: "Documento digitalizado com sucesso!",
    document_too_close_to_edge: "Afaste",
    face_photo_not_fully_visible: "Manter a foto do rosto totalmente visível",
    flip_document: "Virar o documento",
    flip_to_back_side: "Vire o documento",
    front_side_scanned_aria: "Lado da frente digitalizado com sucesso!",
    glare_detected: "Incline ou desloque o documento para eliminar o reflexo",
    keep_document_parallel: "Mantenha o documento paralelo ao ecrã",
    keep_document_still: "Mantenha o documento e o dispositivo imóveis",
    move_closer: "Aproxime",
    move_farther: "Afaste",
    move_left: "Ir para a página esquerda",
    move_right: "Mover para a página à direita",
    move_top: "Ir para a página superior",
    occluded: "Mantenha o documento totalmente visível",
    scan_data_page: "Digitalize a página de dados do documento",
    scan_last_page_barcode: "Digitalize o código de barras da última página",
    scan_left_page: "Digitalizar a página esquerda",
    scan_right_page: "Digitalizar a página direita",
    scan_the_back_side: "Digitalize o verso do documento",
    scan_the_barcode: "Digitalizar o código de barras",
    scan_the_front_side: "Digitalize a frente\\nde um documento",
    scan_top_page: "Digitalizar a página superior",
    too_bright: "Desloque-se para um local com menos iluminação",
    too_dark: "Desloque-se para um local com mais iluminação",
    wrong_left: "Ir para a página esquerda",
    wrong_right: "Ir para a página direita",
    wrong_top: "Ir para a página superior",
  },
  help_button: { aria_label: "Ajuda", tooltip: "Precisa de ajuda?" },
  help_modal: {
    aria: "Ajuda de digitalização",
    back_btn: "Anterior",
    blur: {
      details:
        "Tente manter o telefone e o documento imóveis enquanto digitaliza. A deslocação de qualquer um deles pode desfocar a imagem e tornar ilegíveis os dados no documento.",
      details_desktop:
        "Tente manter o dispositivo e o documento imóveis enquanto digitaliza. Mover algum deles poderá desfocar a imagem e tornar os dados do documento ilegíveis.",
      title: "Mantenha-se imóvel enquanto digitaliza",
    },
    camera_lens: {
      details:
        "Verifique se não há manchas ou poeiras na lente da sua câmara. Uma lente suja torna a imagem final desfocada, deixando os detalhes do documento ilegíveis e impedindo a digitalização correta dos dados.",
      title: "Limpe a lente da câmara",
    },
    done_btn: "Concluído",
    done_btn_aria: "Retomar digitalização",
    lighting: {
      details:
        "Evite a luz direta e intensa porque reflete a partir do documento e pode tornar ilegíveis partes do documento. Se não conseguir ler os dados no documento, também não serão visíveis para a câmara.",
      title: "Cuidado com a luz intensa",
    },
    next_btn: "Seguinte",
    visibility: {
      details:
        "Certifique-se de que não está a cobrir partes do documento com um dedo, incluindo as linhas de fundo. Tenha também em atenção os reflexos de holograma que passam por cima dos campos do documento.",
      title: "Mantenha todos os campos visíveis",
    },
  },
  onboarding_modal: {
    aria: "Instruções de digitalização",
    btn: "Começar a digitalizar",
    details:
      "Assegure-se de que mantém o documento bem iluminado. Todos os campos do documento devem estar visíveis no ecrã da câmara.",
    details_desktop:
      "Assegure-se de que mantém a lente da câmara limpa e o documento bem iluminado. Todos os campos do documento devem estar visíveis no ecrã da câmara.",
    title: "Mantenha todos os pormenores visíveis",
    title_desktop: "Prepare-se para digitalizar",
  },
  sdk_aria: "Ecrã de digitalização de documentos",
  timeout_modal: {
    cancel_btn: "Cancelar",
    details: "Não foi possível ler o documento. Tente novamente.",
    retry_btn: "Tente novamente",
    title: "A digitalização falhou",
  },
} as const;
