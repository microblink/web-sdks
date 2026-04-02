/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for zh_CN.
 */
export default {
  document_filtered_modal: {
    details: "尝试扫描不同的文档。",
    title: "文档不被接受",
  },
  document_not_recognized_modal: {
    details: "扫描支持文件类型的正面。",
    title: "文档无法识别",
  },
  feedback_messages: {
    blur_detected: "使文件和手机保持静止不动",
    camera_angle_too_steep: "使文件与手机保持平行",
    document_scanned_aria: "成功！文件已扫描",
    document_too_close_to_edge: "离远一些",
    face_photo_not_fully_visible: "让面部照片完全可见",
    flip_document: "翻转文档",
    flip_to_back_side: "给文件翻页",
    front_side_scanned_aria: "成功！正面已扫描",
    glare_detected: "倾斜或移动文件以消除反光",
    keep_document_parallel: "请将文件与屏幕保持平行",
    keep_document_still: "请保持文件和设备静止",
    move_closer: "靠近一些",
    move_farther: "离远一些",
    move_left: "移动至左侧页面",
    move_right: "移动到右侧页面",
    move_top: "移动至顶部页面",
    occluded: "保持文档完全可见",
    scan_data_page: "扫描文档的数据页",
    scan_last_page_barcode: "扫描最后一页的条形码",
    scan_left_page: "扫描左侧页面",
    scan_right_page: "扫描右侧页面",
    scan_the_back_side: "扫描文件反面",
    scan_the_barcode: "扫描条形码",
    scan_the_front_side: "扫描文件的\\n正面",
    scan_top_page: "扫描顶部页面",
    too_bright: "移动到光线更暗的位置",
    too_dark: "移动到更明亮的位置",
    wrong_left: "移动至左侧页面",
    wrong_right: "移动至右侧页面",
    wrong_top: "移动至顶部页面",
  },
  help_button: { aria_label: "帮助", tooltip: "需要帮助？" },
  help_modal: {
    aria: "扫描帮助",
    back_btn: "返回",
    blur: {
      details:
        "扫描时尽量保持手机和文件不动。移动可能造成图像模糊，使文件数据不可读。",
      details_desktop:
        "扫描时尽量保持设备和文件不动。移动可能导致图像模糊，使文件数据无法读取。",
      title: "扫描时保持不动",
    },
    camera_lens: {
      details:
        "请检查相机镜头是否有污渍或灰尘。镜头脏污会导致成像模糊，从而无法读取文件信息，影响数据扫描成功率。",
      title: "清洁摄像头镜头",
    },
    done_btn: "完成",
    done_btn_aria: "恢复扫描",
    lighting: {
      details:
        "避免强光直射，因为它会在文件中反射出来 ，可能造成文件的某些地方不可读。如果您不能读取文件上的数据，那么它也不会被相机看到。",
      title: "注意强光直射",
    },
    next_btn: "下一步",
    visibility: {
      details:
        "确保不要用手指遮盖文件的任意部分，包括底部边线。同时注意全息图在文件字段的反射。",
      title: "保持所有字段可见",
    },
  },
  onboarding_modal: {
    aria: "扫描说明",
    btn: "开始扫描",
    details: "确保文件处于光线充足的地方。所有文件字段应在相机屏幕上可见。",
    details_desktop:
      "确保相机镜头和文件处于光线充足的地方。所有文件字段应在相机屏幕上清晰可见。",
    title: "保持所有细节可见",
    title_desktop: "准备扫描",
  },
  sdk_aria: "文件扫描屏幕",
  timeout_modal: {
    cancel_btn: "取消",
    details: "未能读取文件,请重试。",
    retry_btn: "重试",
    title: "扫描失败",
  },
} as const;
