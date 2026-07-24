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
  error_modal: { cancel_btn: "取消", retry_btn: "重試" },
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
    keep_still: "保持不動",
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
    scan_the_barcode_side: "掃描文件的條碼面",
    scan_the_front_side: "掃描文件的正面。",
    scan_the_mrz_side: "掃描文件的 MRZ 面",
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
    barcode_only: {
      blur: {
        details:
          "掃描時盡量保持裝置及條碼穩定。任何移動可能會使圖像模糊，導致無法辨識條碼。",
        details_desktop:
          "掃描時盡量保持不動。任何移動可能會使圖像模糊，導致無法辨識條碼。",
        title: "掃描時保持靜止",
        title_desktop: "掃描時保持靜止",
      },
      camera_lens: {
        details_desktop:
          "檢查相機鏡頭是否有髒污或灰塵。鏡頭若不乾淨，會導致照片模糊，使條碼無法辨識，進而導致掃描失敗。",
        title_desktop: "清潔相機鏡頭",
      },
      lighting: {
        details:
          "避免強烈光源直接照射條碼，以免產生反光而影響掃描。若您看不清楚條碼，相機可能也無法看清。",
        details_desktop:
          "避免強烈光源直接照射條碼，以免產生反光而影響掃描。若您看不清楚條碼，相機可能也無法看清。",
        title: "注意刺眼的光線",
        title_desktop: "注意刺眼的光線",
      },
      visibility: {
        details: "請確保手指沒有遮住條碼，並避免反光覆蓋條碼，以免無法辨識。",
        details_desktop:
          "請確保手指沒有遮住條碼，並避免反光覆蓋條碼，以免無法辨識。",
        title: "保持條碼清晰可見",
        title_desktop: "保持條碼清晰可見",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "掃描時盡量保持手機及文件穩定。任何移動都會使圖像模糊並造成文件的內容無法讀取。",
        details_desktop:
          "掃描時盡量保持不動。任何移動可能會使圖像模糊，導致無法辨識文件資料。",
        title: "掃描時保持靜止",
        title_desktop: "掃描時保持靜止",
      },
      camera_lens: {
        details_desktop:
          "檢查相機鏡頭是否有髒污或灰塵。鏡頭若不乾淨，會導致照片模糊，使文件資訊無法辨識，進而導致掃描失敗。",
        title_desktop: "清潔相機鏡頭",
      },
      lighting: {
        details:
          "避免直接刺眼的光線，因為光線會反射文件，並且使文件的某些內容無法讀取。如果您無法讀取文件的內容，則相機也無法看清。",
        details_desktop:
          "避免直接刺眼的光線，因為光線會反射文件，並且使文件的某些內容無法讀取。如果您無法讀取文件的內容，則相機也無法看清。",
        title: "注意刺眼的光線",
        title_desktop: "注意刺眼的光線",
      },
      visibility: {
        details: "請確保手指沒有遮住條碼，並避免反光覆蓋條碼，以免無法辨識。",
        details_desktop:
          "請確保手指沒有遮住條碼，並避免反光覆蓋條碼，以免無法辨識。",
        title: "保持條碼清晰可見",
        title_desktop: "保持條碼清晰可見",
      },
    },
    document_with_mrz: {
      blur: {
        details:
          "掃描時盡量保持手機及文件穩定。任何移動都會使圖像模糊並造成文件的內容無法讀取。",
        details_desktop:
          "掃描時盡量保持不動。任何移動可能會使圖像模糊，導致無法辨識文件資料。",
        title: "掃描時保持靜止",
        title_desktop: "掃描時保持靜止",
      },
      camera_lens: {
        details_desktop:
          "檢查相機鏡頭是否有髒污或灰塵。鏡頭若不乾淨，會導致照片模糊，使文件資訊無法辨識，進而導致掃描失敗。",
        title_desktop: "清潔相機鏡頭",
      },
      lighting: {
        details:
          "避免直接刺眼的光線，因為光線會反射文件，並且使文件的某些內容無法讀取。如果您無法讀取文件的內容，則相機也無法看清。",
        details_desktop:
          "避免直接刺眼的光線，因為光線會反射文件，並且使文件的某些內容無法讀取。如果您無法讀取文件的內容，則相機也無法看清。",
        title: "注意刺眼的光線",
        title_desktop: "注意刺眼的光線",
      },
      visibility: {
        details: "請確保手指沒有遮住 MRZ，並避免 MRZ 出現反光，以免無法辨識。",
        details_desktop:
          "請確保手指沒有遮住 MRZ，並避免 MRZ 出現反光，以免無法辨識。",
        title: "保持 MRZ 清晰可見",
        title_desktop: "保持 MRZ 清晰可見",
      },
    },
    done_btn: "完成",
    done_btn_aria: "繼續掃描",
    full_document: {
      blur: {
        details:
          "掃描時盡量保持手機及文件穩定。任何移動都會使圖像模糊並造成文件的內容無法讀取。",
        details_desktop:
          "掃描時盡量保持不動。任何移動可能會使圖像模糊，導致無法辨識文件資料。",
        title: "掃描時保持靜止",
        title_desktop: "掃描時保持靜止",
      },
      camera_lens: {
        details_desktop:
          "檢查相機鏡頭是否有髒污或灰塵。鏡頭若不乾淨，會導致照片模糊，使文件資訊無法辨識，進而導致掃描失敗。",
        title_desktop: "清潔相機鏡頭",
      },
      lighting: {
        details:
          "避免直接刺眼的光線，因為光線會反射文件，並且使文件的某些內容無法讀取。如果您無法讀取文件的內容，則相機也無法看清。",
        details_desktop:
          "避免直接刺眼的光線，因為光線會反射文件，並且使文件的某些內容無法讀取。如果您無法讀取文件的內容，則相機也無法看清。",
        title: "注意刺眼的光線",
        title_desktop: "注意刺眼的光線",
      },
      visibility: {
        details:
          "確保您的手指沒有蓋到文件的某些內容，包括底線。此外，請注意文件欄位的全息圖反射。",
        details_desktop:
          "確保您的手指沒有蓋到文件的某些內容，包括底線。此外，請注意文件欄位的全息圖反射。",
        title: "讓所有欄位都清楚可見",
        title_desktop: "讓所有欄位都清楚可見",
      },
    },
    next_btn: "下一步",
  },
  onboarding_modal: {
    aria: "掃描說明",
    barcode_only: {
      details:
        "請找到條碼（黑色線條組成的條碼或方形 QR 碼）。將相機對準條碼並保持不動，掃描會自動進行。",
      details_desktop:
        "請找到條碼（黑色線條組成的條碼或方形 QR 碼）。確保相機鏡頭清晰乾淨，且條碼處於光線充足的環境中。",
      title: "對準並掃描條碼",
      title_desktop: "請確認鏡頭乾淨，並對準條碼。",
    },
    btn: "開始掃描",
    document_with_barcode: {
      details:
        "不同類型的文件可能會有不同的條碼格式和位置。請查看文件正反面，找到條碼。",
      details_desktop:
        "請查看文件正反面是否有條碼。確保相機鏡頭清晰乾淨，且文件處於光線充足的環境中。",
      title: "找到文件上的條碼",
      title_desktop: "請確認鏡頭乾淨，並對準條碼。",
    },
    document_with_mrz: {
      details:
        "您可以在文件正面或背面的底部找到一長串字元，通常會分成 2 到 3 行，並以箭頭符號 (<< 或 >>) 分隔。",
      details_desktop:
        "請查看文件正反面是否有「機器可讀區 (MRZ)」。請在文件底部尋找有 2 到 3 行字元及箭頭符號 (<<) 的地方。確保相機鏡頭清晰乾淨，並在光線充足的環境下拍攝文件。",
      title: "找到文件上的 MRZ",
      title_desktop: "請確認鏡頭乾淨，並對準 MRZ",
    },
    full_document: {
      details: "確保文件光線充足。所有文件欄位在相機螢幕都應清楚可見。",
      details_desktop:
        "確保相機鏡頭清晰乾淨，且文件光線充足。所有文件欄位在相機螢幕都應清楚可見。",
      title: "保持所有細節清楚可見",
      title_desktop: "準備好開始掃描",
    },
  },
  sdk_aria: "文件掃描畫面",
  timeout_modal: {
    details: "確保文件處於光線充足的環境中、完整入鏡，且沒有反光。",
    details_desktop:
      "確保相機鏡頭清晰乾淨，且文件完整入鏡、對焦清楚，並處於光線充足的環境中。",
    title: "無法讀取文件",
  },
} as const;
