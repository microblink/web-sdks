/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for zh_TW.
 */
export default {
  feedback_messages: {
    blur_detected: "保持卡片與手機靜止不動",
    blur_detected_desktop: "保持卡片與裝置靜止不動",
    camera_angle_too_steep: "將卡片與手機保持平行",
    camera_angle_too_steep_desktop: "請保持卡片與螢幕平行",
    card_number_scanned: "成功了！有卡號的一面已掃描。",
    card_scanned: "成功了！卡片已掃描。",
    document_too_close_to_edge: "再離遠一點",
    flip_card: "將銀行卡翻面",
    flip_to_back_side: "將銀行卡翻面",
    move_closer: "再靠近一點",
    move_farther: "再離遠一點",
    occluded: "保持卡片完整可見",
    scan_the_back_side: "請掃描卡片的另一面",
    scan_the_front_side: "掃描卡號",
  },
  help_button: { aria_label: "說明", tooltip: "需要協助嗎？" },
  help_modal: {
    aria: "掃描支援",
    back_btn: "背面",
    blur: {
      details:
        "掃描時盡量保持手機及卡片穩定。任何移動都會使圖像模糊並造成卡片的內容無法讀取。",
      details_desktop:
        "掃描時盡量保持裝置及卡片穩定。任何移動可能會使圖像模糊，導致無法辨識卡片資料。",
      title: "掃描時保持靜止",
    },
    camera_lens: {
      details:
        "檢查相機鏡頭是否有髒污或灰塵。鏡頭若不乾淨，會導致照片模糊，使卡片資訊無法辨識，進而導致掃描失敗。",
      title: "清潔相機鏡頭",
    },
    card_number: {
      details:
        "卡號通常是 16 位數字，也可能是 12 到 19 位數字。應該在卡片上以凸起數字印刷或雕刻。數字可能在卡面的正面或背面。",
      title: "卡號在哪裡？",
    },
    done_btn: "完成",
    done_btn_aria: "繼續掃描",
    lighting: {
      details:
        "避免直接刺眼的光線，因為光線會反射卡片，並且使卡片的某些內容無法讀取。如果您無法讀取卡片的內容，則相機也無法看清。",
      title: "注意刺眼的光線",
    },
    next_btn: "下一步",
    occlusion: {
      details:
        "確保您的手指沒有蓋到卡片的某些內容，包括底線。此外，請注意卡片欄位的全息圖反射。",
      title: "讓所有欄位都清楚可見",
    },
  },
  onboarding_modal: {
    aria: "掃描說明",
    btn: "開始掃描",
    details:
      "卡號通常為 16 位數字。應該在卡片上以凸起數字印刷或雕刻。確保卡片光線充足並且所有內容都很清楚。",
    details_desktop:
      "卡號通常為 16 位數字。應該在卡片上以凸起數字印刷或雕刻。確保相機鏡頭乾淨、光線充足，並讓卡片上的所有資訊清楚可見。",
    title: "先掃描卡號",
  },
  sdk_aria: "卡片掃描畫面",
  timeout_modal: {
    cancel_btn: "取消",
    details: "無法讀取卡片，請再試一次。",
    retry_btn: "重試",
    title: "掃描成功",
  },
} as const;
