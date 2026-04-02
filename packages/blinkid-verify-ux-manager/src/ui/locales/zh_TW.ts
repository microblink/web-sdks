/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for zh_TW.
 */
export default {
  document_filtered_modal: {
    details: "請嘗試掃描其他文件。",
    title: "文件未獲接受",
  },
  document_not_recognized_modal: {
    details: "掃描受支援文件的正面。",
    title: "無法辨識文件",
  },
  feedback_messages: {
    blur_detected: "讓文件與手機保持靜止",
    camera_angle_too_steep: "讓文件與手機平行",
    document_scanned_aria: "成功！文件已掃描",
    document_too_close_to_edge: "再離遠一點",
    face_photo_not_fully_visible: "請保持臉部照片能夠完整顯示",
    flip_document: "翻轉文件",
    flip_to_back_side: "將文件翻面",
    front_side_scanned_aria: "成功！正面已掃描",
    glare_detected: "傾斜或移動文件以移除反光",
    keep_document_parallel: "請保持文件與螢幕平行",
    keep_document_still: "保持文件與裝置靜止不動",
    move_closer: "再靠近一點",
    move_farther: "再離遠一點",
    move_left: "移動到左方的頁面",
    move_right: "移至右側的頁面",
    move_top: "移動到上方的頁面",
    occluded: "保持文件完全可見",
    scan_data_page: "掃描文件的資料頁",
    scan_last_page_barcode: "掃描最後一頁的條碼",
    scan_left_page: "掃描左頁",
    scan_right_page: "掃描右方頁面",
    scan_the_back_side: "掃描文件背面",
    scan_the_barcode: "掃描條碼",
    scan_the_front_side: "掃描文件的正面。",
    scan_top_page: "掃描上方頁面",
    too_bright: "移到照明較暗的點",
    too_dark: "移到更亮的點",
    wrong_left: "移動到左頁",
    wrong_right: "移動到右頁",
    wrong_top: "移動到頂部頁面",
  },
  help_button: { aria_label: "說明", tooltip: "需要協助嗎？" },
  help_modal: {
    aria: "掃描支援",
    back_btn: "背面",
    blur: {
      details:
        "掃描時盡量保持手機及文件穩定。任何移動都會使圖像模糊並造成文件的內容無法讀取。",
      details_desktop:
        "掃描時盡量保持裝置及文件穩定。任何移動可能會使圖像模糊，導致無法辨識文件資料。",
      title: "掃描時保持靜止",
    },
    camera_lens: {
      details:
        "檢查相機鏡頭是否有髒污或灰塵。鏡頭若不乾淨，會導致照片模糊，使文件資訊無法辨識，進而導致掃描失敗。",
      title: "清潔相機鏡頭",
    },
    done_btn: "完成",
    done_btn_aria: "繼續掃描",
    lighting: {
      details:
        "避免直接刺眼的光線，因為光線會反射文件，並且使文件的某些內容無法讀取。如果您無法讀取文件的內容，則相機也無法看清。",
      title: "注意刺眼的光線",
    },
    next_btn: "下一步",
    visibility: {
      details:
        "確保您的手指沒有蓋到文件的某些內容，包括底線。此外，請注意文件欄位的全息圖反射。",
      title: "讓所有欄位都清楚可見",
    },
  },
  onboarding_modal: {
    aria: "掃描說明",
    btn: "開始掃描",
    details: "確保文件光線充足。所有文件欄位在相機螢幕都應清楚可見。",
    details_desktop:
      "確保相機鏡頭清晰乾淨，且文件光線充足。所有文件欄位在相機螢幕都應清楚可見。",
    title: "保持所有細節清楚可見",
    title_desktop: "準備好開始掃描",
  },
  sdk_aria: "文件掃描畫面",
  timeout_modal: {
    cancel_btn: "取消",
    details: "無法讀取文件,請再試一次。",
    retry_btn: "重試",
    title: "掃描成功",
  },
} as const;
