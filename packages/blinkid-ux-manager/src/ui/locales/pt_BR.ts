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
  error_modal: { cancel_btn: "Cancelar", retry_btn: "Tentar novamente" },
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
    keep_still: "Mantenha o celular imóvel",
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
    scan_the_barcode_side:
      "Digitalize o lado do documento que contém o código de barras",
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
    barcode_only: {
      blur: {
        details:
          "Tente manter o celular e o código de barras imóveis durante a digitalização. Movimentos de qualquer um deles podem desfocar a imagem e dificultar a leitura do código de barras.",
        details_desktop:
          "Tente manter o celular imóvel durante a digitalização. Movimentos podem desfocar a imagem e dificultar a leitura do código de barras.",
        title: "Mantenha-se imóvel durante a digitalização",
        title_desktop: "Mantenha-se imóvel durante a digitalização",
      },
      camera_lens: {
        details_desktop:
          "Verifique se a lente da câmera está limpa e sem poeira. Uma lente suja faz com que a imagem final fique borrada, tornando o código de barras ilegível e impedindo a leitura correta dos dados.",
        title_desktop: "Limpe a lente da câmera",
      },
      lighting: {
        details:
          "Evite luzes fortes diretas, pois elas podem causar reflexos no código de barras e dificultar a digitalização. Se o código de barras não estiver claramente visível para você, a câmera provavelmente também não conseguirá lê-lo.",
        details_desktop:
          "Evite luzes fortes diretas, pois elas podem causar reflexos no código de barras e dificultar a digitalização. Se o código de barras não estiver claramente visível para você, a câmera provavelmente também não conseguirá lê-lo.",
        title: "Cuidado com a luz forte",
        title_desktop: "Cuidado com a luz forte",
      },
      visibility: {
        details:
          "Certifique-se de não cobrir partes do código de barras com os dedos. Além disso, fique atento a reflexos sobre o código de barras, pois eles podem torná-lo ilegível.",
        details_desktop:
          "Certifique-se de não cobrir partes do código de barras com os dedos. Além disso, fique atento a reflexos sobre o código de barras, pois eles podem torná-lo ilegível.",
        title: "Mantenha o código de barras visível",
        title_desktop: "Mantenha o código de barras visível",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "Tente manter o celular e o documento imóveis durante a digitalização. Mover qualquer um deles poderá borrar a imagem e tornar os dados do documento ilegíveis.",
        details_desktop:
          "Tente manter o celular imóvel durante a digitalização. Movimentos podem desfocar a imagem e tornar os dados do documento ilegíveis.",
        title: "Mantenha-se imóvel durante a digitalização",
        title_desktop: "Mantenha-se imóvel durante a digitalização",
      },
      camera_lens: {
        details_desktop:
          "Verifique se a lente da câmera está limpa e sem poeira. Uma lente suja pode desfocar a imagem final, tornando os detalhes do documento ilegíveis e impedindo o escaneamento correto dos dados.",
        title_desktop: "Limpe a lente da câmera",
      },
      lighting: {
        details:
          "Evite luz forte direta, pois ela reflete no documento e pode tornar partes dele ilegíveis. Se você não conseguir ler os dados no documento, ele também não ficará visível para a câmera.",
        details_desktop:
          "Evite luz forte direta, pois ela reflete no documento e pode tornar partes dele ilegíveis. Se você não conseguir ler os dados no documento, ele também não ficará visível para a câmera.",
        title: "Cuidado com a luz forte",
        title_desktop: "Cuidado com a luz forte",
      },
      visibility: {
        details:
          "Certifique-se de não cobrir partes do código de barras com os dedos. Além disso, fique atento a reflexos sobre o código de barras, pois eles podem torná-lo ilegível.",
        details_desktop:
          "Certifique-se de não cobrir partes do código de barras com os dedos. Além disso, fique atento a reflexos sobre o código de barras, pois eles podem torná-lo ilegível.",
        title: "Mantenha o código de barras visível",
        title_desktop: "Mantenha o código de barras visível",
      },
    },
    done_btn: "Concluído",
    done_btn_aria: "Retomar escaneamento",
    full_document: {
      blur: {
        details:
          "Tente manter o celular e o documento imóveis durante a digitalização. Mover qualquer um deles poderá borrar a imagem e tornar os dados do documento ilegíveis.",
        details_desktop:
          "Tente manter o celular imóvel durante a digitalização. Movimentos podem desfocar a imagem e tornar os dados do documento ilegíveis.",
        title: "Mantenha-se imóvel durante a digitalização",
        title_desktop: "Mantenha-se imóvel durante a digitalização",
      },
      camera_lens: {
        details_desktop:
          "Verifique se a lente da câmera está limpa e sem poeira. Uma lente suja pode desfocar a imagem final, tornando os detalhes do documento ilegíveis e impedindo o escaneamento correto dos dados.",
        title_desktop: "Limpe a lente da câmera",
      },
      lighting: {
        details:
          "Evite luz forte direta, pois ela reflete no documento e pode tornar partes dele ilegíveis. Se você não conseguir ler os dados no documento, ele também não ficará visível para a câmera.",
        details_desktop:
          "Evite luz forte direta, pois ela reflete no documento e pode tornar partes dele ilegíveis. Se você não conseguir ler os dados no documento, ele também não ficará visível para a câmera.",
        title: "Cuidado com a luz forte",
        title_desktop: "Cuidado com a luz forte",
      },
      visibility: {
        details:
          "Certifique-se de não cobrir partes do documento com o dedo, incluindo as linhas inferiores. Além disso, fique atento aos reflexos do holograma que ultrapassam os campos do documento.",
        details_desktop:
          "Certifique-se de não cobrir partes do documento com o dedo, incluindo as linhas inferiores. Além disso, fique atento aos reflexos do holograma que ultrapassam os campos do documento.",
        title: "Mantenha todos os campos visíveis",
        title_desktop: "Mantenha todos os campos visíveis",
      },
    },
    next_btn: "Próximo",
  },
  onboarding_modal: {
    aria: "Instruções de escaneamento",
    barcode_only: {
      details:
        "Procure um código de barras (uma sequência de linhas pretas ou um código quadrado). Aponte a câmera para ele e mantenha o celular imóvel — a digitalização acontecerá automaticamente.",
      details_desktop:
        "Procure um código de barras (uma sequência de linhas pretas ou um código quadrado). Certifique-se de manter a lente da câmera limpa e o código de barras bem iluminado.",
      title: "Localize e digitalize o código de barras",
      title_desktop: "Limpe a lente da câmera e localize o código de barras",
    },
    btn: "Iniciar escaneamento",
    document_with_barcode: {
      details:
        "Diferentes tipos de documentos podem ter formatos e localizações de código de barras diferentes. Verifique a frente e o verso do documento em busca de um código de barras.",
      details_desktop:
        "Verifique a frente e o verso do documento em busca de um código de barras. Certifique-se de manter a lente da câmera limpa e o documento bem iluminado.",
      title: "Localize o código de barras no documento de identidade",
      title_desktop: "Limpe a lente da câmera e localize o código de barras",
    },
    full_document: {
      details:
        "Certifique-se de manter o documento bem iluminado. Todos os campos do documento devem estar visíveis na tela da câmera.",
      details_desktop:
        "Certifique-se de manter a lente da câmera limpa e o documento bem iluminado. Todos os campos do documento devem estar visíveis na tela da câmera.",
      title: "Mantenha todos os detalhes visíveis",
      title_desktop: "Prepare-se para escanear",
    },
  },
  sdk_aria: "Tela de escaneamento de documento",
  timeout_modal: {
    details: "Não foi possível ler o documento. Tente novamente.",
    title: "Falha na digitalização",
  },
} as const;
