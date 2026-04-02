/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for ko.
 */
export default {
  document_filtered_modal: {
    details: "다른 문서를 스캔해 보세요.",
    title: "문서가 수락되지 않았습니다",
  },
  document_not_recognized_modal: {
    details: "사용 가능한 문서의 앞면을 스캔하세요.",
    title: "문서 인식 실패",
  },
  feedback_messages: {
    blur_detected: "문서와 스마트폰이 움직이지 않게 유지하세요",
    camera_angle_too_steep: "문서를 문서와 평행하게 유지하세요",
    document_scanned_aria: "문서 스캔 완료",
    document_too_close_to_edge: "더 멀리 이동",
    face_photo_not_fully_visible: "얼굴 사진이 완전히 보이게 유지하세요",
    flip_document: "문서를 뒤집어 주세요",
    flip_to_back_side: "뒷면으로 넘겨주세요",
    front_side_scanned_aria: "앞면 스캔 완료",
    glare_detected: "문서를 기울이거나 이동시켜 반사광을 피하세요",
    keep_document_parallel: "문서를 화면과 평행하게 유지하세요",
    keep_document_still: "문서와 디바이스가 움직이지 않게 유지하세요",
    move_closer: "더 가까이 이동",
    move_farther: "더 멀리 이동",
    move_left: "왼쪽 페이지로 이동",
    move_right: "오른쪽 페이지로 이동",
    move_top: "맨 위 페이지로 이동",
    occluded: "문서를 완전히 보이게 유지하세요",
    scan_data_page: "문서의 데이터 페이지를 스캔하세요",
    scan_last_page_barcode: "마지막 페이지에서 바코드를 스캔하세요",
    scan_left_page: "왼쪽 페이지를 스캔하세요",
    scan_right_page: "오른쪽 페이지를 스캔하세요",
    scan_the_back_side: "문서 뒷면을 스캔하세요",
    scan_the_barcode: "바코드를 스캔하세요",
    scan_the_front_side: "문서의 앞면을 스캔하세요",
    scan_top_page: "상단 페이지를 스캔하세요",
    too_bright: "조명이 지금보다 약한 곳으로 이동하세요",
    too_dark: "지금보다 밝은 곳으로 이동하세요",
    wrong_left: "왼쪽 페이지로 이동하세요",
    wrong_right: "오른쪽 페이지로 이동하세요",
    wrong_top: "상단 페이지로 이동하세요",
  },
  help_button: { aria_label: "도움말", tooltip: "도움이 필요하신가요?" },
  help_modal: {
    aria: "스캔 도움말",
    back_btn: "뒤로",
    blur: {
      details:
        "스캔하는 동안 스마트폰과 문서가 움직이지 않도록 하세요. 움직이면 이미지가 흐려지고 문서의 데이터를 읽을 수 없게 됩니다.",
      details_desktop:
        "스캔하는 동안 디바이스와 문서가 움직이지 않도록 하세요. 움직이면 이미지가 흐려지고 문서의 데이터를 읽을 수 없게 됩니다.",
      title: "스캔하는 동안 움직이지 마세요",
    },
    camera_lens: {
      details:
        "카메라 렌즈에 지문이나 먼지가 묻어 있지 않은지 확인해 주세요. 렌즈에 이물질이 있으면 최종 이미지가 흐릿하게 촬영되어 문서 정보를 읽을 수 없으며, 데이터 스캔이 제대로 이루어지지 않을 수 있습니다.",
      title: "카메라 렌즈를 닦아 주세요",
    },
    done_btn: "완료",
    done_btn_aria: "스캔 재개",
    lighting: {
      details:
        "강한 직사광선은 문서 표면에 반사되어 내용의 일부를 읽을 수 없게 만들 수 있으니 되도록 피하세요. 사람의 눈으로 문서의 데이터를 읽을 수 없으면 카메라에도 표시되지 않습니다.",
      title: "강한 빛을 주의하세요",
    },
    next_btn: "다음",
    visibility: {
      details:
        "손가락으로 문서의 일부, 특히 하단의 선을 가리지 않도록 주의하세요. 또한 문서의 필드 위로 홀로그램이 반사되는 것도 주의하세요.",
      title: "모든 칸들이 보이도록 유지하세요",
    },
  },
  onboarding_modal: {
    aria: "스캔 지침",
    btn: "스캔 시작",
    details:
      "문서가 조명을 충분히 받을 수 있게 유지하세요. 모든 문서 내용들이 카메라 화면에 보여야 합니다.",
    details_desktop:
      "문서가 조명을 충분히 받을 수 있게 카메라 렌즈를 청결하게 유지하세요. 모든 문서 내용들이 카메라 화면에 보여야 합니다.",
    title: "모든 세부 내용들이 보이도록 해주세요",
    title_desktop: "스캔 준비하기",
  },
  sdk_aria: "문서 스캔 화면",
  timeout_modal: {
    cancel_btn: "취소",
    details: "문서를 읽을 수 없습니다. 다시 시도하세요.",
    retry_btn: "다시 시도",
    title: "스캔 실패",
  },
} as const;
