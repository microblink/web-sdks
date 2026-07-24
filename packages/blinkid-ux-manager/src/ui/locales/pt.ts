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
  error_modal: { cancel_btn: "Cancelar", retry_btn: "Tente novamente" },
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
    keep_still: "Mantenha imóvel",
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
    scan_the_barcode_side:
      "Digitalizar o lado do documento com um código de barras",
    scan_the_front_side: "Digitalize a frente\\nde um documento",
    scan_the_mrz_side: "Digitalize o lado MRZ de um documento",
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
    barcode_only: {
      blur: {
        details:
          "Tente manter o telemóvel e o código de barras imóvel enquanto digitaliza, caso contrário a imagem poderá ficar desfocada e o código de barras poderá ficar desfocado e ser difícil de ler.",
        details_desktop:
          "Tente manter-se imóvel enquanto digitaliza, caso contrário o código de barras poderá ficar desfocado e ser difícil de ler.",
        title: "Mantenha-se imóvel enquanto digitaliza",
        title_desktop: "Mantenha-se imóvel enquanto digitaliza",
      },
      camera_lens: {
        details_desktop:
          "Verifique se não há manchas ou poeiras na lente da sua câmara. Uma lente suja torna a imagem final desfocada, tornando o código de barras ilegível e impedindo a digitalização correta dos dados.",
        title_desktop: "Limpe a lente da câmara",
      },
      lighting: {
        details:
          "Evite uma iluminação forte e direta, a qual poderá criar reflexos no código de barras e torná-lo difícil de digitalizar. Se o código de barras não for claramente visível, a câmara poderá também não conseguir digitalizá-lo.",
        details_desktop:
          "Evite uma iluminação forte e direta, a qual poderá criar reflexos no código de barras e torná-lo difícil de digitalizar. Se o código de barras não for claramente visível, a câmara poderá também não conseguir digitalizá-lo.",
        title: "Cuidado com a luz intensa",
        title_desktop: "Cuidado com a luz intensa",
      },
      visibility: {
        details:
          "Certifique-se de que não está a cobrir partes do código de barras com o dedo. Tenha também em atenção os reflexos sobre o código de barras e que poderão torná-lo ilegível.",
        details_desktop:
          "Certifique-se de que não está a cobrir partes do código de barras com o dedo. Tenha também em atenção os reflexos sobre o código de barras e que poderão torná-lo ilegível.",
        title: "Mantenha o código de barras visível",
        title_desktop: "Mantenha o código de barras visível",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "Tente manter o telefone e o documento imóveis enquanto digitaliza. A deslocação de qualquer um deles pode desfocar a imagem e tornar ilegíveis os dados no documento.",
        details_desktop:
          "Tente manter-se imóvel enquanto digitaliza, caso contrário a imagem poderá ficar desfocada e os dados do documento poderão tornar-se ilegíveis.",
        title: "Mantenha-se imóvel enquanto digitaliza",
        title_desktop: "Mantenha-se imóvel enquanto digitaliza",
      },
      camera_lens: {
        details_desktop:
          "Verifique se não há manchas ou poeiras na lente da sua câmara. Uma lente suja torna a imagem final desfocada, deixando os detalhes do documento ilegíveis e impedindo a digitalização correta dos dados.",
        title_desktop: "Limpe a lente da câmara",
      },
      lighting: {
        details:
          "Evite a luz direta e intensa porque reflete a partir do documento e pode tornar ilegíveis partes do documento. Se não conseguir ler os dados no documento, também não serão visíveis para a câmara.",
        details_desktop:
          "Evite a luz direta e intensa porque reflete a partir do documento e pode tornar ilegíveis partes do documento. Se não conseguir ler os dados no documento, também não serão visíveis para a câmara.",
        title: "Cuidado com a luz intensa",
        title_desktop: "Cuidado com a luz intensa",
      },
      visibility: {
        details:
          "Certifique-se de que não está a cobrir partes do código de barras com o dedo. Tenha também em atenção os reflexos sobre o código de barras e que poderão torná-lo ilegível.",
        details_desktop:
          "Certifique-se de que não está a cobrir partes do código de barras com o dedo. Tenha também em atenção os reflexos sobre o código de barras e que poderão torná-lo ilegível.",
        title: "Mantenha o código de barras visível",
        title_desktop: "Mantenha o código de barras visível",
      },
    },
    document_with_mrz: {
      blur: {
        details:
          "Tente manter o telefone e o documento imóveis enquanto digitaliza. A deslocação de qualquer um deles pode desfocar a imagem e tornar ilegíveis os dados no documento.",
        details_desktop:
          "Tente manter-se imóvel enquanto digitaliza, caso contrário a imagem poderá ficar desfocada e os dados do documento poderão tornar-se ilegíveis.",
        title: "Mantenha-se imóvel enquanto digitaliza",
        title_desktop: "Mantenha-se imóvel enquanto digitaliza",
      },
      camera_lens: {
        details_desktop:
          "Verifique se não há manchas ou poeiras na lente da sua câmara. Uma lente suja torna a imagem final desfocada, deixando os detalhes do documento ilegíveis e impedindo a digitalização correta dos dados.",
        title_desktop: "Limpe a lente da câmara",
      },
      lighting: {
        details:
          "Evite a luz direta e intensa porque reflete a partir do documento e pode tornar ilegíveis partes do documento. Se não conseguir ler os dados no documento, também não serão visíveis para a câmara.",
        details_desktop:
          "Evite a luz direta e intensa porque reflete a partir do documento e pode tornar ilegíveis partes do documento. Se não conseguir ler os dados no documento, também não serão visíveis para a câmara.",
        title: "Cuidado com a luz intensa",
        title_desktop: "Cuidado com a luz intensa",
      },
      visibility: {
        details:
          "Certifique-se de que não está a cobrir partes do MRZ com um dedo. Além disso, tenha em atenção os reflexos que se sobrepõem ao MRZ e que poderão torná-lo ilegível.",
        details_desktop:
          "Certifique-se de que não está a cobrir partes do MRZ com um dedo. Além disso, tenha em atenção os reflexos que se sobrepõem ao MRZ e que poderão torná-lo ilegível.",
        title: "Mantenha o MRZ visível",
        title_desktop: "Mantenha o MRZ visível",
      },
    },
    done_btn: "Concluído",
    done_btn_aria: "Retomar digitalização",
    full_document: {
      blur: {
        details:
          "Tente manter o telefone e o documento imóveis enquanto digitaliza. A deslocação de qualquer um deles pode desfocar a imagem e tornar ilegíveis os dados no documento.",
        details_desktop:
          "Tente manter-se imóvel enquanto digitaliza, caso contrário a imagem poderá ficar desfocada e os dados do documento poderão tornar-se ilegíveis.",
        title: "Mantenha-se imóvel enquanto digitaliza",
        title_desktop: "Mantenha-se imóvel enquanto digitaliza",
      },
      camera_lens: {
        details_desktop:
          "Verifique se não há manchas ou poeiras na lente da sua câmara. Uma lente suja torna a imagem final desfocada, deixando os detalhes do documento ilegíveis e impedindo a digitalização correta dos dados.",
        title_desktop: "Limpe a lente da câmara",
      },
      lighting: {
        details:
          "Evite a luz direta e intensa porque reflete a partir do documento e pode tornar ilegíveis partes do documento. Se não conseguir ler os dados no documento, também não serão visíveis para a câmara.",
        details_desktop:
          "Evite a luz direta e intensa porque reflete a partir do documento e pode tornar ilegíveis partes do documento. Se não conseguir ler os dados no documento, também não serão visíveis para a câmara.",
        title: "Cuidado com a luz intensa",
        title_desktop: "Cuidado com a luz intensa",
      },
      visibility: {
        details:
          "Certifique-se de que não está a cobrir partes do documento com um dedo, incluindo as linhas de fundo. Tenha também em atenção os reflexos de holograma que passam por cima dos campos do documento.",
        details_desktop:
          "Certifique-se de que não está a cobrir partes do documento com um dedo, incluindo as linhas de fundo. Tenha também em atenção os reflexos de holograma que passam por cima dos campos do documento.",
        title: "Mantenha todos os campos visíveis",
        title_desktop: "Mantenha todos os campos visíveis",
      },
    },
    next_btn: "Seguinte",
  },
  onboarding_modal: {
    aria: "Instruções de digitalização",
    barcode_only: {
      details:
        "Procure um código de barras (uma série de linhas pretas ou um código quadrado). Aponte a câmara e mantenha-a imóvel — a digitalização será efetuada automaticamente.",
      details_desktop:
        "Procure um código de barras (uma série de linhas pretas ou um código quadrado). Mantenha a lente da sua câmara limpa e o código de barras bem iluminado.",
      title: "Procure e digitalize o código de barras",
      title_desktop: "Limpe a lente e procure o código de barras",
    },
    btn: "Começar a digitalizar",
    document_with_barcode: {
      details:
        "Diferentes tipos de documentos podem ter diferentes formatos e localizações de códigos de barras. Procure um código de barras na frente e no verso do documento.",
      details_desktop:
        "Procure um código de barras na frente e no verso do documento. Mantenha a lente da sua câmara limpa e o documento bem iluminado.",
      title: "Localize o código de barras no documento",
      title_desktop: "Limpe a lente e procure o código de barras",
    },
    document_with_mrz: {
      details:
        "Encontrará uma longa sequência de carateres na parte inferior da frente ou do verso do documento, dividida em 2 ou 3 linhas e separada por setas (<< ou >>).",
      details_desktop:
        "Procure um MRZ na frente e no verso do documento. Procure 2–3 linhas de caracteres e símbolos direcionais (<<) no fundo do documento. Certifique-se de que a lente da sua câmara esteja limpa e o documento bem iluminado.",
      title: "Localize o MRZ no documento",
      title_desktop: "Limpe a sua lente e localize o MRZ",
    },
    full_document: {
      details:
        "Assegure-se de que mantém o documento bem iluminado. Todos os campos do documento devem estar visíveis no ecrã da câmara.",
      details_desktop:
        "Assegure-se de que mantém a lente da câmara limpa e o documento bem iluminado. Todos os campos do documento devem estar visíveis no ecrã da câmara.",
      title: "Mantenha todos os pormenores visíveis",
      title_desktop: "Prepare-se para digitalizar",
    },
  },
  sdk_aria: "Ecrã de digitalização de documentos",
  timeout_modal: {
    details:
      "Garanta que o documento esteja bem iluminado, totalmente visível e sem reflexos.",
    details_desktop:
      "Garanta que a lente da sua câmara esteja limpa e o documento totalmente visível, focado e bem iluminado.",
    title: "Não foi possível ler o documento",
  },
} as const;
