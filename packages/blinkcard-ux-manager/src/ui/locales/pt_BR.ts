/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for pt_BR.
 */
export default {
  feedback_messages: {
    blur_detected: "Mantenha o cartão e o telefone imóveis",
    blur_detected_desktop: "Mantenha o cartão e o dispositivo imóveis",
    camera_angle_too_steep: "Mantenha o cartão paralelo ao telefone",
    camera_angle_too_steep_desktop: "Mantenha o cartão paralelo à tela",
    card_number_scanned: "Número do cartão escaneado com sucesso",
    card_scanned: "Cartão escaneado com sucesso",
    document_too_close_to_edge: "Afaste",
    flip_card: "Vire o cartão",
    flip_to_back_side: "Vire o cartão",
    move_closer: "Aproxime",
    move_farther: "Afaste",
    occluded: "Mantenha o cartão totalmente visível",
    scan_the_back_side: "Escaneie o outro lado do cartão",
    scan_the_front_side: "Escaneie o número do cartão",
  },
  help_button: { aria_label: "Ajuda", tooltip: "Precisa de ajuda?" },
  help_modal: {
    back_btn: "Voltar",
    blur: {
      details:
        "Tente manter o telefone e o cartão imóveis durante o escaneamento. Mover qualquer um deles pode borrar a imagem e tornar os dados do cartão ilegíveis.",
      details_desktop:
        "Tente manter o dispositivo e o cartão imóveis durante o escaneamento. Mover qualquer um deles pode borrar a imagem e tornar os dados do cartão ilegíveis.",
      title: "Mantenha-se imóvel durante a digitalização",
    },
    camera_lens: {
      details:
        "Verifique se a lente da câmera está limpa e sem poeira. Uma lente suja faz com que a imagem final fique borrada, tornando os detalhes do cartão ilegíveis e impedindo a leitura correta dos dados.",
      title: "Limpe a lente da câmera",
    },
    card_number: {
      details:
        "O número do cartão geralmente tem 16 dígitos, embora possa ter entre 12 e 19 dígitos. Ele deve estar impresso ou gravado em alto relevo em todo o cartão. Pode estar na frente ou no verso do seu cartão.",
      title: "Onde está o número do cartão?",
    },
    done_btn: "Concluído",
    lighting: {
      details:
        "Evite luz forte e direta, pois ela reflete no cartão e pode tornar partes dele ilegíveis. Se você não conseguir ler os dados no cartão, eles também não serão visíveis para a câmera.",
      title: "Cuidado com a luz forte",
    },
    next_btn: "Próximo",
    occlusion: {
      details:
        "Certifique-se de não cobrir partes do cartão com o dedo, incluindo as linhas inferiores. Além disso, fique atento a reflexos holográficos que ultrapassem os campos do cartão.",
      title: "Mantenha todos os campos visíveis",
    },
  },
  onboarding_modal: {
    btn: "Iniciar escaneamento",
    details:
      "O número do cartão geralmente tem 16 dígitos. Ele deve estar impresso ou gravado em alto relevo em todo o cartão. Certifique-se de que o cartão esteja bem iluminado e que todos os detalhes estejam visíveis.",
    details_desktop:
      "O número do cartão geralmente tem 16 dígitos. Ele deve estar impresso ou em alto-relevo no cartão. Certifique-se de que a lente da câmera esteja limpa, o cartão esteja bem iluminado e todos os detalhes estejam visíveis.",
    title: "Escaneie o número do cartão primeiro",
  },
  timeout_modal: {
    cancel_btn: "Cancelar",
    details: "Não foi possível ler o cartão. Tente novamente.",
    retry_btn: "Tentar novamente",
    title: "Falha na digitalização",
  },
} as const;
