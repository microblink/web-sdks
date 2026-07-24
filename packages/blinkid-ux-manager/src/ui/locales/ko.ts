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
  error_modal: { cancel_btn: "취소", retry_btn: "다시 시도" },
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
    keep_still: "움직이지 마세요",
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
    scan_the_barcode_side: "문서의 바코드 면을 스캔하세요",
    scan_the_front_side: "문서의 앞면을 스캔하세요",
    scan_the_mrz_side: "문서의 MRZ 면을 스캔하세요",
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
    barcode_only: {
      blur: {
        details:
          "스캔하는 동안 휴대폰과 바코드를 모두 움직이지 않도록 하세요. 어느 쪽이든 움직이면 이미지가 흐려져 바코드를 읽기 어려울 수 있습니다.",
        details_desktop:
          "스캔하는 동안 움직이지 않도록 하세요. 움직이면 이미지가 흐려져 바코드를 읽기 어려울 수 있습니다.",
        title: "스캔하는 동안 움직이지 마세요",
        title_desktop: "스캔하는 동안 움직이지 마세요",
      },
      camera_lens: {
        details_desktop:
          "카메라 렌즈에 얼룩이나 먼지가 없는지 확인하세요. 렌즈가 오염되면 이미지가 흐려져 바코드를 읽을 수 없으며 데이터 스캔에 실패할 수 있습니다.",
        title_desktop: "카메라 렌즈를 닦아 주세요",
      },
      lighting: {
        details:
          "직사광선이나 강한 빛은 바코드에 반사를 일으켜 스캔을 어렵게 할 수 있으니 피하세요. 바코드가 육안으로도 잘 보이지 않는다면 카메라도 읽지 못할 수 있습니다.",
        details_desktop:
          "직사광선이나 강한 빛은 바코드에 반사를 일으켜 스캔을 어렵게 할 수 있으니 피하세요. 바코드가 육안으로도 잘 보이지 않는다면 카메라도 읽지 못할 수 있습니다.",
        title: "강한 빛을 주의하세요",
        title_desktop: "강한 빛을 주의하세요",
      },
      visibility: {
        details:
          "손가락으로 바코드 일부를 가리지 않도록 주의하세요. 또한 바코드 위에 반사광이 생기면 인식이 어려울 수 있으니 주의하세요.",
        details_desktop:
          "손가락으로 바코드 일부를 가리지 않도록 주의하세요. 또한 바코드 위에 반사광이 생기면 인식이 어려울 수 있으니 주의하세요.",
        title: "바코드가 잘 보이도록 하세요",
        title_desktop: "바코드가 잘 보이도록 하세요",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "스캔하는 동안 스마트폰과 문서가 움직이지 않도록 하세요. 움직이면 이미지가 흐려지고 문서의 데이터를 읽을 수 없게 됩니다.",
        details_desktop:
          "스캔하는 동안 움직이지 않도록 하세요. 움직이면 이미지가 흐려져 문서의 데이터를 읽지 못할 수 있습니다.",
        title: "스캔하는 동안 움직이지 마세요",
        title_desktop: "스캔하는 동안 움직이지 마세요",
      },
      camera_lens: {
        details_desktop:
          "카메라 렌즈에 지문이나 먼지가 묻어 있지 않은지 확인해 주세요. 렌즈에 이물질이 있으면 최종 이미지가 흐릿하게 촬영되어 문서 정보를 읽을 수 없으며, 데이터 스캔이 제대로 이루어지지 않을 수 있습니다.",
        title_desktop: "카메라 렌즈를 닦아 주세요",
      },
      lighting: {
        details:
          "강한 직사광선은 문서 표면에 반사되어 내용의 일부를 읽을 수 없게 만들 수 있으니 되도록 피하세요. 사람의 눈으로 문서의 데이터를 읽을 수 없으면 카메라에도 표시되지 않습니다.",
        details_desktop:
          "강한 직사광선은 문서 표면에 반사되어 내용의 일부를 읽을 수 없게 만들 수 있으니 되도록 피하세요. 사람의 눈으로 문서의 데이터를 읽을 수 없으면 카메라에도 표시되지 않습니다.",
        title: "강한 빛을 주의하세요",
        title_desktop: "강한 빛을 주의하세요",
      },
      visibility: {
        details:
          "손가락으로 바코드 일부를 가리지 않도록 주의하세요. 또한 바코드 위에 반사광이 생기면 인식이 어려울 수 있으니 주의하세요.",
        details_desktop:
          "손가락으로 바코드 일부를 가리지 않도록 주의하세요. 또한 바코드 위에 반사광이 생기면 인식이 어려울 수 있으니 주의하세요.",
        title: "바코드가 잘 보이도록 하세요",
        title_desktop: "바코드가 잘 보이도록 하세요",
      },
    },
    document_with_mrz: {
      blur: {
        details:
          "스캔하는 동안 스마트폰과 문서가 움직이지 않도록 하세요. 움직이면 이미지가 흐려지고 문서의 데이터를 읽을 수 없게 됩니다.",
        details_desktop:
          "스캔하는 동안 움직이지 않도록 하세요. 움직이면 이미지가 흐려져 문서의 데이터를 읽지 못할 수 있습니다.",
        title: "스캔하는 동안 움직이지 마세요",
        title_desktop: "스캔하는 동안 움직이지 마세요",
      },
      camera_lens: {
        details_desktop:
          "카메라 렌즈에 지문이나 먼지가 묻어 있지 않은지 확인해 주세요. 렌즈에 이물질이 있으면 최종 이미지가 흐릿하게 촬영되어 문서 정보를 읽을 수 없으며, 데이터 스캔이 제대로 이루어지지 않을 수 있습니다.",
        title_desktop: "카메라 렌즈를 닦아 주세요",
      },
      lighting: {
        details:
          "강한 직사광선은 문서 표면에 반사되어 내용의 일부를 읽을 수 없게 만들 수 있으니 되도록 피하세요. 사람의 눈으로 문서의 데이터를 읽을 수 없으면 카메라에도 표시되지 않습니다.",
        details_desktop:
          "강한 직사광선은 문서 표면에 반사되어 내용의 일부를 읽을 수 없게 만들 수 있으니 되도록 피하세요. 사람의 눈으로 문서의 데이터를 읽을 수 없으면 카메라에도 표시되지 않습니다.",
        title: "강한 빛을 주의하세요",
        title_desktop: "강한 빛을 주의하세요",
      },
      visibility: {
        details:
          "손가락으로 MRZ 일부를 가리지 않도록 주의하세요. 또한 MRZ 위에 반사광이 생기면 인식이 어려울 수 있으니 주의하세요.",
        details_desktop:
          "손가락으로 MRZ 일부를 가리지 않도록 주의하세요. 또한 MRZ 위에 반사광이 생기면 인식이 어려울 수 있으니 주의하세요.",
        title: "MRZ가 잘 보이도록 유지하세요",
        title_desktop: "MRZ가 잘 보이도록 유지하세요",
      },
    },
    done_btn: "완료",
    done_btn_aria: "스캔 재개",
    full_document: {
      blur: {
        details:
          "스캔하는 동안 스마트폰과 문서가 움직이지 않도록 하세요. 움직이면 이미지가 흐려지고 문서의 데이터를 읽을 수 없게 됩니다.",
        details_desktop:
          "스캔하는 동안 움직이지 않도록 하세요. 움직이면 이미지가 흐려져 문서의 데이터를 읽지 못할 수 있습니다.",
        title: "스캔하는 동안 움직이지 마세요",
        title_desktop: "스캔하는 동안 움직이지 마세요",
      },
      camera_lens: {
        details_desktop:
          "카메라 렌즈에 지문이나 먼지가 묻어 있지 않은지 확인해 주세요. 렌즈에 이물질이 있으면 최종 이미지가 흐릿하게 촬영되어 문서 정보를 읽을 수 없으며, 데이터 스캔이 제대로 이루어지지 않을 수 있습니다.",
        title_desktop: "카메라 렌즈를 닦아 주세요",
      },
      lighting: {
        details:
          "강한 직사광선은 문서 표면에 반사되어 내용의 일부를 읽을 수 없게 만들 수 있으니 되도록 피하세요. 사람의 눈으로 문서의 데이터를 읽을 수 없으면 카메라에도 표시되지 않습니다.",
        details_desktop:
          "강한 직사광선은 문서 표면에 반사되어 내용의 일부를 읽을 수 없게 만들 수 있으니 되도록 피하세요. 사람의 눈으로 문서의 데이터를 읽을 수 없으면 카메라에도 표시되지 않습니다.",
        title: "강한 빛을 주의하세요",
        title_desktop: "강한 빛을 주의하세요",
      },
      visibility: {
        details:
          "손가락으로 문서의 일부, 특히 하단의 선을 가리지 않도록 주의하세요. 또한 문서의 필드 위로 홀로그램이 반사되는 것도 주의하세요.",
        details_desktop:
          "손가락으로 문서의 일부, 특히 하단의 선을 가리지 않도록 주의하세요. 또한 문서의 필드 위로 홀로그램이 반사되는 것도 주의하세요.",
        title: "모든 칸들이 보이도록 유지하세요",
        title_desktop: "모든 칸들이 보이도록 유지하세요",
      },
    },
    next_btn: "다음",
  },
  onboarding_modal: {
    aria: "스캔 지침",
    barcode_only: {
      details:
        "바코드(검은 선이 나열된 형태 또는 사각형 코드)를 찾으세요. 카메라를 바코드에 가져다 대고 움직이지 않으면 자동으로 스캔됩니다.",
      details_desktop:
        "바코드(검은 선이 나열된 형태 또는 사각형 코드)를 찾으세요. 카메라 렌즈를 깨끗하게 유지하고 바코드에 빛이 충분히 비치도록 하세요.",
      title: "바코드를 찾아 스캔하세요",
      title_desktop: "렌즈를 닦고 바코드를 찾으세요",
    },
    btn: "스캔 시작",
    document_with_barcode: {
      details:
        "문서 종류에 따라 바코드 형식과 위치가 다를 수 있습니다. 문서 앞뒤에서 바코드를 확인하세요.",
      details_desktop:
        "문서 앞면과 뒷면에서 바코드를 확인하세요. 카메라 렌즈를 깨끗하게 유지하고 문서에 빛이 충분히 비치도록 하세요",
      title: "문서에서 바코드를 찾으세요",
      title_desktop: "렌즈를 닦고 바코드를 찾으세요",
    },
    document_with_mrz: {
      details:
        "문서의 앞면 또는 뒷면 하단에서 화살표(<< 또는 >>)로 구분된 2~3줄의 긴 문자열을 찾을 수 있습니다.",
      details_desktop:
        "문서의 앞면과 뒷면에서 MRZ를 확인하세요. 문서 하단에 있는 2~3개의 문자열과 화살표 표시(<<)를 찾아보세요. 카메라 렌즈를 깨끗하게 유지하고, 문서에 빛이 충분히 비치도록 하세요.",
      title: "문서에서 MRZ를 찾으세요",
      title_desktop: "렌즈를 닦고 MRZ가 보이도록 하세요",
    },
    full_document: {
      details:
        "문서가 조명을 충분히 받을 수 있게 유지하세요. 모든 문서 내용들이 카메라 화면에 보여야 합니다.",
      details_desktop:
        "문서가 조명을 충분히 받을 수 있게 카메라 렌즈를 청결하게 유지하세요. 모든 문서 내용들이 카메라 화면에 보여야 합니다.",
      title: "모든 세부 내용들이 보이도록 해주세요",
      title_desktop: "스캔 준비하기",
    },
  },
  sdk_aria: "문서 스캔 화면",
  timeout_modal: {
    details:
      "문서에 빛이 충분하고, 전체가 보이며, 빛이 반사되지 않는지 확인하세요.",
    details_desktop:
      "카메라 렌즈를 깨끗하게 유지하고 문서 전체가 보이며 선명하게 초점이 맞았는지 확인하세요. 문서에 빛이 충분한지 확인하세요.",
    title: "문서를 읽을 수 없습니다",
  },
} as const;
