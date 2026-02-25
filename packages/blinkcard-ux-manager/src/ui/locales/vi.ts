/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for vi.
 */
export default {
  feedback_messages: {
    blur_detected: "Giữ yên thẻ và điện thoại",
    blur_detected_desktop: "Giữ yên thẻ và thiết bị",
    camera_angle_too_steep: "Giữ thẻ song song với điện thoại",
    camera_angle_too_steep_desktop: "Giữ thẻ song song với màn hình",
    card_number_scanned: "Thành công! Mặt chứa mã số thẻ đã được quét",
    card_scanned: "Thành công! Thẻ đã được quét",
    document_too_close_to_edge: "Di chuyển xa hơn",
    flip_card: "Lật thẻ lại",
    flip_to_back_side: "Lật thẻ lại",
    move_closer: "Di chuyển gần hơn",
    move_farther: "Di chuyển xa hơn",
    occluded: "Giữ cho thẻ hiển thị toàn phần",
    scan_the_back_side: "Quét mặt còn lại của thẻ",
    scan_the_front_side: "Quét số thẻ",
  },
  help_button: { aria_label: "Trợ giúp", tooltip: "Bạn cần trợ giúp?" },
  help_modal: {
    aria: "Trợ giúp quét",
    back_btn: "Quay lại",
    blur: {
      details:
        "Cố gắng giữ yên điện thoại và thẻ trong khi quét. Di chuyển có thể làm mờ hình ảnh hoặc khiến dữ liệu trên thẻ không thể đọc được.",
      details_desktop:
        "Cố gắng giữ yên thiết bị và thẻ trong khi quét. Di chuyển có thể làm mờ hình ảnh hoặc khiến dữ liệu trên thẻ không thể đọc được.",
      title: "Giữ cố định trong khi quét",
    },
    camera_lens: {
      details:
        "Kiểm tra ống kính camera xem có vết bẩn hoặc bụi không. Ống kính bẩn sẽ khiến hình ảnh cuối bị mờ, làm cho thông tin trên thẻ không thể đọc được và ngăn cản việc quét dữ liệu thành công.",
      title: "Làm sạch ống kính camera",
    },
    card_number: {
      details:
        "Số thẻ thường là số có 16 chữ số, mặc dù có thể có từ 12 đến 19 chữ số. Các số đó phải được in hoặc dập nổi trên thẻ. Số này có thể ở mặt trước hoặc mặt sau của thẻ.",
      title: "Số là nằm ở đâu?",
    },
    done_btn: "Đã xong",
    done_btn_aria: "Tiếp tục quét",
    lighting: {
      details:
        "Tránh ánh sáng gay gắt trực tiếp vì thẻ sẽ phản sáng và có thể làm cho các phần của thẻ không đọc được. Nếu bạn không thể đọc dữ liệu trên thẻ, thì dữ liệu đó cũng sẽ không hiển thị với camera.",
      title: "Đề phòng ánh sáng gay gắt",
    },
    next_btn: "Tiếp theo",
    occlusion: {
      details:
        "Đảm bảo rằng bạn không dùng ngón tay che các phần của thẻ, kể cả các dòng dưới cùng. Ngoài ra, hãy để ý các phản xạ hình ba chiều đi qua các trường của thẻ.",
      title: "Đảm bảo nhìn thấy rõ tất cả các trường",
    },
  },
  onboarding_modal: {
    aria: "Hướng dẫn quét",
    btn: "Bắt đầu quét",
    details:
      "Số thẻ thường là một số gồm 16 chữ số. Các số đó phải được in hoặc dập nổi bằng các số nổi trên thẻ. Đảm bảo rằng thẻ được chiếu sáng tốt và tất cả các chi tiết đều có thể nhìn thấy được.",
    details_desktop:
      "Số thẻ thường gồm 16 chữ số. Số này có thể được in hoặc dập nổi trên mặt thẻ. Hãy đảm bảo ống kính camera sạch, thẻ được chiếu sáng đầy đủ và tất cả thông tin đều hiển thị rõ ràng.",
    title: "Trước tiên hãy quét số thẻ",
  },
  sdk_aria: "Màn hình quét thẻ",
  timeout_modal: {
    cancel_btn: "Hủy bỏ",
    details: "Không thể đọc thẻ. Vui lòng thử lại.",
    retry_btn: "Thử lại",
    title: "Quét không thành công",
  },
} as const;
