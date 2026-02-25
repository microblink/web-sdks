/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for pt.
 */
export default {
  feedback_messages: {
    blur_detected: "Mantenha o cartão e o telefone imóveis",
    blur_detected_desktop: "Mantenha o cartão e o dispositivo imóveis",
    camera_angle_too_steep: "Mantenha o cartão paralelo ao telefone",
    camera_angle_too_steep_desktop: "Mantenha o cartão paralelo ao ecrã",
    card_number_scanned: "Sucesso! Número do cartão digitalizado",
    card_scanned: "Sucesso! Cartão digitalizado",
    document_too_close_to_edge: "Afaste",
    flip_card: "Vire o cartão",
    flip_to_back_side: "Vire o cartão",
    move_closer: "Aproxime",
    move_farther: "Afaste",
    occluded: "Mantenha o cartão totalmente visível",
    scan_the_back_side: "Digitalize o outro lado do cartão",
    scan_the_front_side: "Digitalize o número do cartão",
  },
  help_button: { aria_label: "Ajuda", tooltip: "Precisa de ajuda?" },
  help_modal: {
    aria: "Ajuda de digitalização",
    back_btn: "Anterior",
    blur: {
      details:
        "Tente manter o telefone e o cartão imóveis enquanto digitaliza. Mover algum deles pode desfocar a imagem e deixar os dados do cartão ilegíveis.",
      details_desktop:
        "Tente manter o dispositivo e o cartão imóveis enquanto digitaliza. Mover algum deles pode desfocar a imagem e deixar os dados do cartão ilegíveis.",
      title: "Mantenha-se imóvel enquanto digitaliza",
    },
    camera_lens: {
      details:
        "Verifique se não há manchas ou poeiras na lente da sua câmara. Uma lente suja torna a imagem final desfocada, deixando os detalhes do cartão ilegíveis e impedindo a digitalização correta dos dados.",
      title: "Limpe a lente da câmara",
    },
    card_number: {
      details:
        "O número do cartão geralmente é um número de 16 dígitos, embora possa ter entre 12 e 19 dígitos. Deverá estar impresso ou gravado com relevo no cartão. Poderá também estar na frente ou no verso do seu cartão.",
      title: "Onde está o número do cartão",
    },
    done_btn: "Concluído",
    done_btn_aria: "Retomar digitalização",
    lighting: {
      details:
        "Evite luz direta intensa, pois reflete-se no cartão e pode deixar partes do mesmo ilegíveis. Se não consegue ler os dados no cartão, também não ficarão visíveis para a câmara.",
      title: "Cuidado com a luz intensa",
    },
    next_btn: "Seguinte",
    occlusion: {
      details:
        "Certifique-se de que não cobre partes do cartão com um dedo, incluindo as linhas de baixo. Tenha também cuidado com os reflexos dos hologramas que cobrem os campos do cartão.",
      title: "Mantenha todos os campos visíveis",
    },
  },
  onboarding_modal: {
    aria: "Instruções de digitalização",
    btn: "Começar a digitalizar",
    details:
      "O número do cartão geralmente é um número de 16 dígitos. Deverá estar impresso ou gravado com relevo no cartão. Garanta que o cartão fique bem iluminado e que todos os detalhes estejam visíveis.",
    details_desktop:
      "O número do cartão geralmente é um número de 16 dígitos. Deverá estar impresso ou gravado com relevo no cartão. Garanta que a lente da sua câmara esteja limpa, o cartão fique bem iluminado e que todos os detalhes estejam visíveis.",
    title: "Digitalize primeiro o número do cartão",
  },
  sdk_aria: "Ecrã de digitalização de cartões",
  timeout_modal: {
    cancel_btn: "Cancelar",
    details: "Não foi possível ler o cartão. Tente novamente.",
    retry_btn: "Tente novamente",
    title: "A digitalização falhou",
  },
} as const;
