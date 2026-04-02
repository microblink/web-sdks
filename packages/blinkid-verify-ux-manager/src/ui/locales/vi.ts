/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for vi.
 */
export default {
  document_filtered_modal: {
    details: "Thử quét tài liệu khác.",
    title: "Tài liệu không được chấp nhận",
  },
  document_not_recognized_modal: {
    details: "Quét mặt trước của tài liệu được hỗ trợ.",
    title: "Không nhận dạng được tài liệu",
  },
  feedback_messages: {
    blur_detected: "Giữ tài liệu và điện thoại cố định",
    camera_angle_too_steep: "Giữ tài liệu nằm song song với điện thoại",
    document_scanned_aria: "Thành công! Đã quét tài liệu",
    document_too_close_to_edge: "Di chuyển xa hơn",
    face_photo_not_fully_visible: "Đảm bảo thấy đầy đủ ảnh khuôn mặt",
    flip_document: "Lật tài liệu",
    flip_to_back_side: "Lật tài liệu",
    front_side_scanned_aria: "Thành công! Đã quét mặt trước",
    glare_detected:
      "Nghiêng hoặc di chuyển tài liệu để loại bỏ hiệu ứng phản chiếu",
    keep_document_parallel: "Giữ tài liệu nằm song song với màn hình",
    keep_document_still: "Giữ yên tài liệu và thiết bị",
    move_closer: "Di chuyển gần hơn",
    move_farther: "Di chuyển xa hơn",
    move_left: "Di chuyển đến trang bên trái",
    move_right: "Di chuyển đến trang bên phải",
    move_top: "Di chuyển đến trang trên cùng",
    occluded: "Giữ văn bản hiển thị hoàn toàn",
    scan_data_page: "Quét trang chứa dữ liệu của tài liệu",
    scan_last_page_barcode: "Quét mã vạch từ trang cuối cùng",
    scan_left_page: "Quét trang bên trái",
    scan_right_page: "Quét trang bên phải",
    scan_the_back_side: "Quét mặt sau của tài liệu",
    scan_the_barcode: "Quét mã vạch",
    scan_the_front_side: "Quét mặt trước\\ncủa tài liệu",
    scan_top_page: "Quét trang trên cùng",
    too_bright: "Di chuyển đến nơi ít sáng hơn",
    too_dark: "Di chuyển đến nơi sáng hơn",
    wrong_left: "Di chuyển đến trang bên trái",
    wrong_right: "Di chuyển đến trang bên phải",
    wrong_top: "Di chuyển đến trang trên cùng",
  },
  help_button: { aria_label: "Trợ giúp", tooltip: "Bạn cần trợ giúp?" },
  help_modal: {
    aria: "Trợ giúp quét",
    back_btn: "Quay lại",
    blur: {
      details:
        "Cố gắng giữ cố định điện thoại và tài liệu trong khi quét. Việc di chuyển có thể làm mờ hình ảnh và làm cho dữ liệu trên tài liệu không thể đọc được.",
      details_desktop:
        "Cố gắng giữ yên thiết bị và tài liệu trong khi quét. Việc di chuyển có thể làm mờ hình ảnh và làm cho dữ liệu trên tài liệu không thể đọc được.",
      title: "Giữ cố định trong khi quét",
    },
    camera_lens: {
      details:
        "Kiểm tra ống kính camera xem có vết bẩn hoặc bụi không. Ống kính bẩn sẽ khiến hình ảnh cuối bị mờ, làm cho thông tin trên tài liệu không thể đọc được và ngăn cản việc quét dữ liệu thành công.",
      title: "Làm sạch ống kính camera",
    },
    done_btn: "Đã xong",
    done_btn_aria: "Tiếp tục quét",
    lighting: {
      details:
        "Tránh ánh sáng gay gắt trực tiếp vì ánh sáng đó phản chiếu từ tài liệu và có thể làm cho các phần của tài liệu không thể đọc được. Nếu bạn không thể đọc dữ liệu trên tài liệu, chúng cũng sẽ không nhìn thấy rõ trên camera.",
      title: "Đề phòng ánh sáng gay gắt",
    },
    next_btn: "Tiếp theo",
    visibility: {
      details:
        "Đảm bảo rằng bạn không dùng ngón tay che các phần của tài liệu, kể cả các dòng dưới cùng. Ngoài ra, hãy để ý các phản xạ ảnh ba chiều đi qua các trường tài liệu.",
      title: "Đảm bảo nhìn thấy rõ tất cả các trường",
    },
  },
  onboarding_modal: {
    aria: "Hướng dẫn quét",
    btn: "Bắt đầu quét",
    details:
      "Đảm bảo rằng bạn giữ cho tài liệu được chiếu sáng tốt. Tất cả các trường tài liệu sẽ hiển thị trên màn hình camera.",
    details_desktop:
      "Đảm bảo rằng bạn giữ ống kính camera sạch sẽ và tài liệu được chiếu sáng tốt. Tất cả các trường tài liệu sẽ hiển thị trên màn hình camera.",
    title: "Đảm bảo nhìn thấy rõ tất cả các chi tiết",
    title_desktop: "Sẵn sàng quét",
  },
  sdk_aria: "Màn hình quét tài liệu",
  timeout_modal: {
    cancel_btn: "Hủy bỏ",
    details: "Không thể đọc tài liệu. Xin vui lòng thử lại.",
    retry_btn: "Thử lại",
    title: "Quét không thành công",
  },
} as const;
