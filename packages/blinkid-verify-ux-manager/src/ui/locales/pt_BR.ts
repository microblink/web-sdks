/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for pt_BR.
 */
export default {
  document_filtered_modal: {
    details: "Tente digitalizar outro documento.",
    title: "Documento não aceito",
  },
  document_not_recognized_modal: {
    details: "Digitalize a frente de um documento suportado.",
    title: "Documento não reconhecido",
  },
  feedback_messages: {
    blur_detected: "Mantenha o documento e o celular imóveis",
    camera_angle_too_steep: "Mantenha o documento paralelo ao telefone",
    document_scanned_aria: "Sucesso! Documento digitalizado",
    document_too_close_to_edge: "Afaste",
    face_photo_not_fully_visible: "Mantenha a foto do rosto totalmente visível",
    flip_document: "Vire o documento",
    flip_to_back_side: "Vire para o verso",
    front_side_scanned_aria: "Sucesso! Frente digitalizada",
    glare_detected: "Incline ou mova o documento para remover o reflexo",
    keep_document_parallel: "Mantenha o documento paralelo à tela",
    keep_document_still: "Mantenha o documento e o dispositivo imóveis",
    move_closer: "Aproxime",
    move_farther: "Afaste",
    move_left: "Mova para a página à esquerda",
    move_right: "Mova para a página à direita",
    move_top: "Mova para a página superior",
    occluded: "Mantenha o documento totalmente visível",
    scan_data_page: "Digitalize a página de dados do documento",
    scan_last_page_barcode: "Escaneie o código de barras da última página",
    scan_left_page: "Digitalize a página esquerda",
    scan_right_page: "Digitalize a página direita",
    scan_the_back_side: "Digitalize o verso do documento",
    scan_the_barcode: "Digitalize o código de barras",
    scan_the_front_side: "Digitalize a frente do documento",
    scan_top_page: "Digitalize a página superior",
    too_bright: "Mova para um local com menos iluminação",
    too_dark: "Mova para um local mais claro",
    wrong_left: "Mova para a página esquerda",
    wrong_right: "Mova para a página direita",
    wrong_top: "Mova para a página superior",
  },
  help_button: { aria_label: "Ajuda", tooltip: "Precisa de ajuda?" },
  help_modal: {
    aria: "Ajuda para escaneamento",
    back_btn: "Voltar",
    blur: {
      details:
        "Tente manter o celular e o documento imóveis durante a digitalização. Mover qualquer um deles poderá borrar a imagem e tornar os dados do documento ilegíveis.",
      details_desktop:
        "Tente manter o dispositivo e o documento imóveis durante o escaneamento. Mover qualquer um deles pode desfocar a imagem e tornar os dados do documento ilegíveis.",
      title: "Mantenha-se imóvel durante a digitalização",
    },
    camera_lens: {
      details:
        "Verifique se a lente da câmera está limpa e sem poeira. Uma lente suja pode desfocar a imagem final, tornando os detalhes do documento ilegíveis e impedindo o escaneamento correto dos dados.",
      title: "Limpe a lente da câmera",
    },
    done_btn: "Concluído",
    done_btn_aria: "Retomar escaneamento",
    lighting: {
      details:
        "Evite luz forte direta, pois ela reflete no documento e pode tornar partes dele ilegíveis. Se você não conseguir ler os dados no documento, ele também não ficará visível para a câmera.",
      title: "Cuidado com a luz forte",
    },
    next_btn: "Próximo",
    visibility: {
      details:
        "Certifique-se de não cobrir partes do documento com o dedo, incluindo as linhas inferiores. Além disso, fique atento aos reflexos do holograma que ultrapassam os campos do documento.",
      title: "Mantenha todos os campos visíveis",
    },
  },
  onboarding_modal: {
    aria: "Instruções de escaneamento",
    btn: "Iniciar escaneamento",
    details:
      "Certifique-se de manter o documento bem iluminado. Todos os campos do documento devem estar visíveis na tela da câmera.",
    details_desktop:
      "Certifique-se de manter a lente da câmera limpa e o documento bem iluminado. Todos os campos do documento devem estar visíveis na tela da câmera.",
    title: "Mantenha todos os detalhes visíveis",
    title_desktop: "Prepare-se para escanear",
  },
  sdk_aria: "Tela de escaneamento de documento",
  timeout_modal: {
    cancel_btn: "Cancelar",
    details: "Não foi possível ler o documento. Tente novamente.",
    retry_btn: "Tentar novamente",
    title: "Falha na digitalização",
  },
} as const;
