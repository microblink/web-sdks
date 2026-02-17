/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for ko.
 */
export default {
  feedback_messages: {
    blur_detected: "카드와 휴대전화를 움직이지 마세요",
    blur_detected_desktop: "카드와 기기를 움직이지 마세요",
    camera_angle_too_steep: "카드를 휴대폰과 평행하게 유지하세요.",
    camera_angle_too_steep_desktop: "카드를 화면과 평행하게 유지하세요",
    card_number_scanned: "카드 번호 면 스캔 완료!",
    card_scanned: "카드 스캔 완료!",
    document_too_close_to_edge: "더 멀리 이동",
    flip_card: "카드를 뒤집으세요",
    flip_to_back_side: "카드를 뒤집으세요",
    move_closer: "더 가까이 이동",
    move_farther: "더 멀리 이동",
    occluded: "카드 전체가 보이도록 유지해 주세요",
    scan_the_back_side: "카드 반대쪽 면을 스캔하세요",
    scan_the_front_side: "카드 번호를 스캔하세요",
  },
  help_button: { aria_label: "도움말", tooltip: "도움이 필요하신가요?" },
  help_modal: {
    back_btn: "뒤로",
    blur: {
      details:
        "스캔하는 동안 휴대전화와 카드를 움직이지 않고 가만히 두세요. 둘 중 하나라도 움직이면 이미지가 흐려져 카드의 데이터가 읽히지 않을 수 있습니다.",
      details_desktop:
        "스캔하는 동안 휴대전화와 카드가 움직이지 않도록 고정해 주세요. 어느 한 쪽이라도 움직이면 이미지가 흐려져 카드의 데이터가 인식되지 않을 수 있습니다.",
      title: "스캔하는 동안 움직이지 마세요",
    },
    camera_lens: {
      details:
        "카메라 렌즈에 지문이나 먼지가 묻어 있지 않은지 확인해 주세요. 렌즈에 이물질이 있으면 최종 이미지가 흐릿하게 촬영되어 카드 정보를 읽을 수 없으며, 데이터 스캔이 제대로 이루어지지 않을 수 있습니다.",
      title: "카메라 렌즈를 닦아 주세요",
    },
    card_number: {
      details:
        "카드 번호는 일반적으로 16자리 숫자이지만, 12자리에서 19자리 사이일 수도 있습니다. 카드에 인쇄되어 있거나, 양각으로 돌출된 숫자로 표시되어 있습니다. 카드의 앞면 또는 뒷면에 있을 수 있습니다.",
      title: "카드 번호는 어디에 있나요?",
    },
    done_btn: "완료",
    lighting: {
      details:
        "카드에 직접 강한 빛이 닿지 않도록 하세요. 빛이 반사되어 카드의 일부 정보가 읽히지 않을 수 있습니다. 카드에 있는 데이터를 육안으로 읽을 수 없다면, 카메라 역시 인식하지 못합니다.",
      title: "강한 빛을 주의하세요",
    },
    next_btn: "다음",
    occlusion: {
      details:
        "손가락으로 카드의 일부, 특히 아래쪽 라인을 가리지 않도록 주의하세요. 또한, 카드의 정보 영역 위로 겹치는 홀로그램 반사에도 주의하세요.",
      title: "모든 칸들이 보이도록 유지하세요",
    },
  },
  onboarding_modal: {
    btn: "스캔 시작",
    details:
      "카드 번호는 일반적으로 16자리 숫자입니다. 카드에 인쇄되어 있거나, 양각으로 돌출된 숫자로 표시되어 있습니다. 카드가 잘 보이도록 조명을 밝게 하고, 모든 세부 정보가 보이는지 확인하세요.",
    details_desktop:
      "카드 번호는 일반적으로 16자리 숫자이며, 카드 앞면에 인쇄되어 있거나 양각으로 표시되어 있습니다. 카메라 렌즈가 깨끗한지 확인하고, 카드가 잘 보이도록 조명을 밝게 유지하여 모든 세부 정보가 명확히 보이게 해주세요.",
    title: "먼저 카드 번호를 스캔하세요",
  },
  timeout_modal: {
    cancel_btn: "취소",
    details: "카드를 인식할 수 없습니다. 다시 시도해 주세요.",
    retry_btn: "다시 시도",
    title: "스캔 실패",
  },
} as const;
