/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for zh_CN.
 */
export default {
  feedback_messages: {
    blur_detected: "保持卡片和手机静止",
    blur_detected_desktop: "保持卡片和设备静止",
    camera_angle_too_steep: "请将卡片与手机保持平行。",
    camera_angle_too_steep_desktop: "请保持卡片与屏幕平行",
    card_number_scanned: "成功！卡号面已扫描",
    card_scanned: "成功！卡片已扫描",
    document_too_close_to_edge: "离远一些",
    flip_card: "将卡片翻面",
    flip_to_back_side: "将卡片翻面",
    move_closer: "靠近一些",
    move_farther: "离远一些",
    occluded: "保持卡片完全可见",
    scan_the_back_side: "扫描卡片的另一面",
    scan_the_front_side: "扫描卡号",
  },
  help_button: { aria_label: "帮助", tooltip: "需要帮助？" },
  help_modal: {
    aria: "扫描帮助",
    back_btn: "返回",
    blur: {
      details:
        "在扫描时尽量让手机和卡保持静止。移动任一项都可能让图像变模糊，使卡上的数据不可读。",
      details_desktop:
        "扫描时请尽量保持设备和卡片静止。移动设备或卡片都可能导致画面模糊，使卡片信息无法识别。",
      title: "扫描时保持不动",
    },
    camera_lens: {
      details:
        "请检查摄像头镜头是否有污渍或灰尘。镜头不洁会导致成像模糊，从而无法读取卡片信息，影响数据扫描成功率。",
      title: "清洁摄像头镜头",
    },
    card_number: {
      details:
        "卡号通常是 16 位数，不过也可能是 12 到 19 位数。卡号应该是卡中打印或凸印的数字。可能位于卡的正面或背面。",
      title: "卡号在哪里？",
    },
    done_btn: "完成",
    done_btn_aria: "恢复扫描",
    lighting: {
      details:
        "避免直接强光，因为它会从卡上反射，并可能使卡的一些部分不可读。如果您无法阅读卡上的数据，摄像头也无法识别。",
      title: "注意强光直射",
    },
    next_btn: "下一步",
    occlusion: {
      details:
        "确保您没有用手指遮盖卡的一部分，包括底部线条。此外，请留意卡的字段上的全息图反射。",
      title: "保持所有字段可见",
    },
  },
  onboarding_modal: {
    aria: "扫描说明",
    btn: "开始扫描",
    details:
      "卡号通常是 16 位数。卡号应该是卡中打印或凸印的数字。确保卡的光照良好，所有细节清晰可见。",
    details_desktop:
      "卡号通常为 16 位数字，一般以印刷或凸起数字的形式显示在卡片表面。请确保摄像头镜头干净，卡片光线充足且所有信息清晰可见。",
    title: "首先扫描卡号",
  },
  sdk_aria: "卡片扫描屏幕",
  timeout_modal: {
    cancel_btn: "取消",
    details: "无法读取卡片，请重试。",
    retry_btn: "重试",
    title: "扫描失败",
  },
} as const;
