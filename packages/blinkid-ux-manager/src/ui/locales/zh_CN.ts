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
  error_modal: { cancel_btn: "取消", retry_btn: "重试" },
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
    keep_still: "保持不动",
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
    scan_the_barcode_side: "扫描文件上带有条形码的一面",
    scan_the_front_side: "扫描文件的\\n正面",
    scan_the_mrz_side: "扫描文件的机读区一面",
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
    barcode_only: {
      blur: {
        details:
          "扫描时尽量保持手机和条形码不动。移动可能导致图像模糊，使条形码难以读取。",
        details_desktop:
          "扫描时尽量保持不动。移动可能导致图像模糊，使条形码难以识别。",
        title: "扫描时保持不动",
        title_desktop: "扫描时保持不动",
      },
      camera_lens: {
        details_desktop:
          "检查相机镜头是否有污渍或灰尘。镜头不洁会导致成像模糊，从而无法读取条形码，影响数据扫描成功率。",
        title_desktop: "清洁摄像头镜头",
      },
      lighting: {
        details:
          "避免强光直射，因为这会在条码上产生眩光，导致难以扫描。如果您看不清条形码，相机也可能无法读取。",
        details_desktop:
          "避免强光直射，因为这会在条码上产生眩光，导致难以扫描。如果您看不清条形码，相机也可能无法读取。",
        title: "注意强光直射",
        title_desktop: "注意强光直射",
      },
      visibility: {
        details:
          "确保您的手指没有遮挡条形码。此外，请留意条形码上的反光，反光可能导致条形码无法读取。",
        details_desktop:
          "确保您的手指没有遮挡条形码。此外，请留意条形码上的反光，反光可能导致条形码无法读取。",
        title: "保持条形码可见",
        title_desktop: "保持条形码可见",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "扫描时尽量保持手机和文件不动。移动可能造成图像模糊，使文件数据不可读。",
        details_desktop:
          "扫描时尽量保持不动。移动可能导致图像模糊，使文件数据无法读取。",
        title: "扫描时保持不动",
        title_desktop: "扫描时保持不动",
      },
      camera_lens: {
        details_desktop:
          "请检查相机镜头是否有污渍或灰尘。镜头脏污会导致成像模糊，从而无法读取文件信息，影响数据扫描成功率。",
        title_desktop: "清洁摄像头镜头",
      },
      lighting: {
        details:
          "避免强光直射，因为它会在文件中反射出来 ，可能造成文件的某些地方不可读。如果您不能读取文件上的数据，那么它也不会被相机看到。",
        details_desktop:
          "避免强光直射，因为它会在文件中反射出来 ，可能造成文件的某些地方不可读。如果您不能读取文件上的数据，那么它也不会被相机看到。",
        title: "注意强光直射",
        title_desktop: "注意强光直射",
      },
      visibility: {
        details:
          "确保您的手指没有遮挡条形码。此外，请留意条形码上的反光，反光可能导致条形码无法读取。",
        details_desktop:
          "确保您的手指没有遮挡条形码。此外，请留意条形码上的反光，反光可能导致条形码无法读取。",
        title: "保持条形码可见",
        title_desktop: "保持条形码可见",
      },
    },
    document_with_mrz: {
      blur: {
        details:
          "扫描时尽量保持手机和文件不动。移动可能造成图像模糊，使文件数据不可读。",
        details_desktop:
          "扫描时尽量保持不动。移动可能导致图像模糊，使文件数据无法读取。",
        title: "扫描时保持不动",
        title_desktop: "扫描时保持不动",
      },
      camera_lens: {
        details_desktop:
          "请检查相机镜头是否有污渍或灰尘。镜头脏污会导致成像模糊，从而无法读取文件信息，影响数据扫描成功率。",
        title_desktop: "清洁摄像头镜头",
      },
      lighting: {
        details:
          "避免强光直射，因为它会在文件中反射出来 ，可能造成文件的某些地方不可读。如果您不能读取文件上的数据，那么它也不会被相机看到。",
        details_desktop:
          "避免强光直射，因为它会在文件中反射出来 ，可能造成文件的某些地方不可读。如果您不能读取文件上的数据，那么它也不会被相机看到。",
        title: "注意强光直射",
        title_desktop: "注意强光直射",
      },
      visibility: {
        details:
          "确保手指没有遮挡机读区。此外，请留意机读区上的反光，反光可能导致机读区无法读取。",
        details_desktop:
          "确保手指没有遮挡机读区。此外，请留意机读区上的反光，反光可能导致机读区无法读取。",
        title: "保持机读区可见",
        title_desktop: "保持机读区可见",
      },
    },
    done_btn: "完成",
    done_btn_aria: "恢复扫描",
    full_document: {
      blur: {
        details:
          "扫描时尽量保持手机和文件不动。移动可能造成图像模糊，使文件数据不可读。",
        details_desktop:
          "扫描时尽量保持不动。移动可能导致图像模糊，使文件数据无法读取。",
        title: "扫描时保持不动",
        title_desktop: "扫描时保持不动",
      },
      camera_lens: {
        details_desktop:
          "请检查相机镜头是否有污渍或灰尘。镜头脏污会导致成像模糊，从而无法读取文件信息，影响数据扫描成功率。",
        title_desktop: "清洁摄像头镜头",
      },
      lighting: {
        details:
          "避免强光直射，因为它会在文件中反射出来 ，可能造成文件的某些地方不可读。如果您不能读取文件上的数据，那么它也不会被相机看到。",
        details_desktop:
          "避免强光直射，因为它会在文件中反射出来 ，可能造成文件的某些地方不可读。如果您不能读取文件上的数据，那么它也不会被相机看到。",
        title: "注意强光直射",
        title_desktop: "注意强光直射",
      },
      visibility: {
        details:
          "确保不要用手指遮盖文件的任意部分，包括底部边线。同时注意全息图在文件字段的反射。",
        details_desktop:
          "确保不要用手指遮盖文件的任意部分，包括底部边线。同时注意全息图在文件字段的反射。",
        title: "保持所有字段可见",
        title_desktop: "保持所有字段可见",
      },
    },
    next_btn: "下一步",
  },
  onboarding_modal: {
    aria: "扫描说明",
    barcode_only: {
      details:
        "查找条形码（一系列黑色线条或一个方形码）。将相机对准它并保持不动——会自动进行扫描。",
      details_desktop:
        "查找条形码（一系列黑色线条或一个方形码）。确保相机镜头清洁且条形码光线充足。",
      title: "找到并扫描条形码",
      title_desktop: "清洁镜头并找到条形码",
    },
    btn: "开始扫描",
    document_with_barcode: {
      details:
        "文件类型不同，其条形码的格式和位置也可能不同。请在文件正反面寻找条形码。",
      details_desktop:
        "检查文件正反面是否有条形码。确保相机镜头清洁且文件光线充足。",
      title: "找到文件上的条形码",
      title_desktop: "清洁镜头并找到条形码",
    },
    document_with_mrz: {
      details:
        "您将在文件正面或反面的底部找到一长串字符，分为 2 到 3 行，并由箭头（<< 或 >>）分隔。",
      details_desktop:
        "检查文件正反面是否有机读区。在文件底部寻找 2 至 3 行字符和箭头符号（<<）。确保相机镜头清洁且文件光线充足。",
      title: "找到文件上的机读区",
      title_desktop: "清洁镜头并找到机读区",
    },
    full_document: {
      details: "确保文件处于光线充足的地方。所有文件字段应在相机屏幕上可见。",
      details_desktop:
        "确保相机镜头和文件处于光线充足的地方。所有文件字段应在相机屏幕上清晰可见。",
      title: "保持所有细节可见",
      title_desktop: "准备扫描",
    },
  },
  sdk_aria: "文件扫描屏幕",
  timeout_modal: {
    details: "确保文件光线充足、完全可见且无眩光。",
    details_desktop: "确保相机镜头清洁，文件完全可见、对焦清晰且光线充足。",
    title: "无法读取文件",
  },
} as const;
