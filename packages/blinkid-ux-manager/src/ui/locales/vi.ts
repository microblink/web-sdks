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
  error_modal: { cancel_btn: "Hủy bỏ", retry_btn: "Thử lại" },
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
    keep_still: "Giữ yên",
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
    scan_the_barcode_side: "Quét mặt có mã vạch của một giấy tờ",
    scan_the_front_side: "Quét mặt trước\\ncủa tài liệu",
    scan_the_mrz_side: "Quét mặt có MRZ của giấy tờ",
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
    barcode_only: {
      blur: {
        details:
          "Cố gắng giữ yên điện thoại và mã vạch trong khi quét. Di chuyển có thể làm mờ hình ảnh hoặc khiến mã vạch khó đọc.",
        details_desktop:
          "Cố gắng giữ yên khi quét. Di chuyển có thể làm mờ hình ảnh hoặc khiến mã vạch khó đọc.",
        title: "Giữ cố định trong khi quét",
        title_desktop: "Giữ cố định trong khi quét",
      },
      camera_lens: {
        details_desktop:
          "Kiểm tra ống kính camera xem có vết bẩn hoặc bụi không. Ống kính bẩn sẽ khiến hình ảnh cuối bị mờ, làm cho mã vạch không thể đọc được và ngăn cản việc quét dữ liệu thành công.",
        title_desktop: "Làm sạch ống kính camera",
      },
      lighting: {
        details:
          "Tránh ánh sáng gay gắt trực tiếp vì nó có thể tạo ra lóa sáng trên mã vạch và khiến việc quét trở nên khó khăn. Nếu mã vạch không rõ ràng với bạn, camera cũng có thể không đọc được.",
        details_desktop:
          "Tránh ánh sáng gay gắt trực tiếp vì nó có thể tạo ra lóa sáng trên mã vạch và khiến việc quét trở nên khó khăn. Nếu mã vạch không rõ ràng với bạn, camera cũng có thể không đọc được.",
        title: "Đề phòng ánh sáng gay gắt",
        title_desktop: "Đề phòng ánh sáng gay gắt",
      },
      visibility: {
        details:
          "Đảm bảo bạn không dùng ngón tay che các phần của mã vạch. Ngoài ra, hãy coi chừng ánh sáng phản chiếu trên mã vạch có thể khiến mã vạch không thể đọc được.",
        details_desktop:
          "Đảm bảo bạn không dùng ngón tay che các phần của mã vạch. Ngoài ra, hãy coi chừng ánh sáng phản chiếu trên mã vạch có thể khiến mã vạch không thể đọc được.",
        title: "Đảm bảo thấy rõ mã vạch",
        title_desktop: "Đảm bảo thấy rõ mã vạch",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "Cố gắng giữ cố định điện thoại và tài liệu trong khi quét. Việc di chuyển có thể làm mờ hình ảnh và làm cho dữ liệu trên tài liệu không thể đọc được.",
        details_desktop:
          "Cố gắng giữ yên khi quét. Việc di chuyển có thể làm mờ hình ảnh và làm cho dữ liệu trên giấy tờ không thể đọc được.",
        title: "Giữ cố định trong khi quét",
        title_desktop: "Giữ cố định trong khi quét",
      },
      camera_lens: {
        details_desktop:
          "Kiểm tra ống kính camera xem có vết bẩn hoặc bụi không. Ống kính bẩn sẽ khiến hình ảnh cuối bị mờ, làm cho thông tin trên tài liệu không thể đọc được và ngăn cản việc quét dữ liệu thành công.",
        title_desktop: "Làm sạch ống kính camera",
      },
      lighting: {
        details:
          "Tránh ánh sáng gay gắt trực tiếp vì ánh sáng đó phản chiếu từ tài liệu và có thể làm cho các phần của tài liệu không thể đọc được. Nếu bạn không thể đọc dữ liệu trên tài liệu, chúng cũng sẽ không nhìn thấy rõ trên camera.",
        details_desktop:
          "Tránh ánh sáng gay gắt trực tiếp vì ánh sáng đó phản chiếu từ tài liệu và có thể làm cho các phần của tài liệu không thể đọc được. Nếu bạn không thể đọc dữ liệu trên tài liệu, chúng cũng sẽ không nhìn thấy rõ trên camera.",
        title: "Đề phòng ánh sáng gay gắt",
        title_desktop: "Đề phòng ánh sáng gay gắt",
      },
      visibility: {
        details:
          "Đảm bảo bạn không dùng ngón tay che các phần của mã vạch. Ngoài ra, hãy coi chừng ánh sáng phản chiếu trên mã vạch có thể khiến mã vạch không thể đọc được.",
        details_desktop:
          "Đảm bảo bạn không dùng ngón tay che các phần của mã vạch. Ngoài ra, hãy coi chừng ánh sáng phản chiếu trên mã vạch có thể khiến mã vạch không thể đọc được.",
        title: "Đảm bảo thấy rõ mã vạch",
        title_desktop: "Đảm bảo thấy rõ mã vạch",
      },
    },
    document_with_mrz: {
      blur: {
        details:
          "Cố gắng giữ cố định điện thoại và tài liệu trong khi quét. Việc di chuyển có thể làm mờ hình ảnh và làm cho dữ liệu trên tài liệu không thể đọc được.",
        details_desktop:
          "Cố gắng giữ yên khi quét. Việc di chuyển có thể làm mờ hình ảnh và làm cho dữ liệu trên giấy tờ không thể đọc được.",
        title: "Giữ cố định trong khi quét",
        title_desktop: "Giữ cố định trong khi quét",
      },
      camera_lens: {
        details_desktop:
          "Kiểm tra ống kính camera xem có vết bẩn hoặc bụi không. Ống kính bẩn sẽ khiến hình ảnh cuối bị mờ, làm cho thông tin trên tài liệu không thể đọc được và ngăn cản việc quét dữ liệu thành công.",
        title_desktop: "Làm sạch ống kính camera",
      },
      lighting: {
        details:
          "Tránh ánh sáng gay gắt trực tiếp vì ánh sáng đó phản chiếu từ tài liệu và có thể làm cho các phần của tài liệu không thể đọc được. Nếu bạn không thể đọc dữ liệu trên tài liệu, chúng cũng sẽ không nhìn thấy rõ trên camera.",
        details_desktop:
          "Tránh ánh sáng gay gắt trực tiếp vì ánh sáng đó phản chiếu từ tài liệu và có thể làm cho các phần của tài liệu không thể đọc được. Nếu bạn không thể đọc dữ liệu trên tài liệu, chúng cũng sẽ không nhìn thấy rõ trên camera.",
        title: "Đề phòng ánh sáng gay gắt",
        title_desktop: "Đề phòng ánh sáng gay gắt",
      },
      visibility: {
        details:
          "Đảm bảo bạn không dùng ngón tay che các phần của MRZ. Ngoài ra, hãy chú ý tránh để các vệt phản chiếu ánh sáng đè lên MRZ có thể khiến MRZ không đọc được.",
        details_desktop:
          "Đảm bảo bạn không dùng ngón tay che các phần của MRZ. Ngoài ra, hãy chú ý tránh để các vệt phản chiếu ánh sáng đè lên MRZ có thể khiến MRZ không đọc được.",
        title: "Đảm bảo thấy rõ MRZ",
        title_desktop: "Đảm bảo thấy rõ MRZ",
      },
    },
    done_btn: "Đã xong",
    done_btn_aria: "Tiếp tục quét",
    full_document: {
      blur: {
        details:
          "Cố gắng giữ cố định điện thoại và tài liệu trong khi quét. Việc di chuyển có thể làm mờ hình ảnh và làm cho dữ liệu trên tài liệu không thể đọc được.",
        details_desktop:
          "Cố gắng giữ yên khi quét. Việc di chuyển có thể làm mờ hình ảnh và làm cho dữ liệu trên giấy tờ không thể đọc được.",
        title: "Giữ cố định trong khi quét",
        title_desktop: "Giữ cố định trong khi quét",
      },
      camera_lens: {
        details_desktop:
          "Kiểm tra ống kính camera xem có vết bẩn hoặc bụi không. Ống kính bẩn sẽ khiến hình ảnh cuối bị mờ, làm cho thông tin trên tài liệu không thể đọc được và ngăn cản việc quét dữ liệu thành công.",
        title_desktop: "Làm sạch ống kính camera",
      },
      lighting: {
        details:
          "Tránh ánh sáng gay gắt trực tiếp vì ánh sáng đó phản chiếu từ tài liệu và có thể làm cho các phần của tài liệu không thể đọc được. Nếu bạn không thể đọc dữ liệu trên tài liệu, chúng cũng sẽ không nhìn thấy rõ trên camera.",
        details_desktop:
          "Tránh ánh sáng gay gắt trực tiếp vì ánh sáng đó phản chiếu từ tài liệu và có thể làm cho các phần của tài liệu không thể đọc được. Nếu bạn không thể đọc dữ liệu trên tài liệu, chúng cũng sẽ không nhìn thấy rõ trên camera.",
        title: "Đề phòng ánh sáng gay gắt",
        title_desktop: "Đề phòng ánh sáng gay gắt",
      },
      visibility: {
        details:
          "Đảm bảo rằng bạn không dùng ngón tay che các phần của tài liệu, kể cả các dòng dưới cùng. Ngoài ra, hãy để ý các phản xạ ảnh ba chiều đi qua các trường tài liệu.",
        details_desktop:
          "Đảm bảo rằng bạn không dùng ngón tay che các phần của tài liệu, kể cả các dòng dưới cùng. Ngoài ra, hãy để ý các phản xạ ảnh ba chiều đi qua các trường tài liệu.",
        title: "Đảm bảo nhìn thấy rõ tất cả các trường",
        title_desktop: "Đảm bảo nhìn thấy rõ tất cả các trường",
      },
    },
    next_btn: "Tiếp theo",
  },
  onboarding_modal: {
    aria: "Hướng dẫn quét",
    barcode_only: {
      details:
        "Tìm mã vạch (một dãy các đường kẻ đen hoặc mã vuông). Hướng camera của bạn về phía nó và giữ yên — quá trình quét sẽ tự động diễn ra.",
      details_desktop:
        "Tìm mã vạch (một dãy các đường kẻ đen hoặc mã vuông). Đảm bảo rằng ống kính camera của bạn sạch và mã vạch được chiếu sáng tốt.",
      title: "Tìm và quét mã vạch",
      title_desktop: "Làm sạch ống kính và tìm mã vạch",
    },
    btn: "Bắt đầu quét",
    document_with_barcode: {
      details:
        "Các loại giấy tờ khác nhau có thể có định dạng và vị trí mã vạch khác nhau. Hãy xem mặt trước và mặt sau của giấy tờ để tìm mã vạch.",
      details_desktop:
        "Kiểm tra mặt trước và mặt sau của giấy tờ để tìm mã vạch. Đảm bảo rằng bạn giữ ống kính camera sạch sẽ và giấy tờ được chiếu sáng tốt.",
      title: "Xác định vị trí mã vạch trên giấy tờ",
      title_desktop: "Làm sạch ống kính và tìm mã vạch",
    },
    document_with_mrz: {
      details:
        "Bạn sẽ tìm thấy một chuỗi ký tự dài ở phía dưới mặt trước hoặc mặt sau của giấy tờ, chia thành 2 hoặc 3 dòng và được phân tách bằng mũi tên (<< hoặc >>).",
      details_desktop:
        "Kiểm tra mặt trước và mặt sau của giấy tờ để tìm MRZ. Hãy tìm 2–3 dòng ký tự và các ký hiệu mũi tên (<<) ở phần dưới cùng của giấy tờ. Đảm bảo ống kính camera của bạn sạch sẽ và giấy tờ được chiếu sáng đầy đủ.",
      title: "Xác định vị trí MRZ trên giấy tờ",
      title_desktop: "Lau sạch ống kính và xác định vị trí MRZ",
    },
    full_document: {
      details:
        "Đảm bảo rằng bạn giữ cho tài liệu được chiếu sáng tốt. Tất cả các trường tài liệu sẽ hiển thị trên màn hình camera.",
      details_desktop:
        "Đảm bảo rằng bạn giữ ống kính camera sạch sẽ và tài liệu được chiếu sáng tốt. Tất cả các trường tài liệu sẽ hiển thị trên màn hình camera.",
      title: "Đảm bảo nhìn thấy rõ tất cả các chi tiết",
      title_desktop: "Sẵn sàng quét",
    },
  },
  sdk_aria: "Màn hình quét tài liệu",
  timeout_modal: {
    details:
      "Đảm bảo giấy tờ được chiếu sáng tốt, có thể nhìn rõ toàn bộ và không bị lóa.",
    details_desktop:
      "Đảm bảo ống kính camera của bạn sạch sẽ và giấy tờ có thể nhìn rõ toàn bộ, rõ nét cũng như được chiếu sáng tốt.",
    title: "Không thể đọc giấy tờ",
  },
} as const;
