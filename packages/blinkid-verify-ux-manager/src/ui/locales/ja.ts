/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for ja.
 */
export default {
  document_filtered_modal: {
    details: "別の書類をスキャンしてみてください",
    title: "書類が受け付けられません",
  },
  document_not_recognized_modal: {
    details: "サポートされている書類の表側をスキャンしてください。",
    title: "ドキュメントが認識されません",
  },
  feedback_messages: {
    blur_detected: "書類とスマートフォンを動かさないでください",
    camera_angle_too_steep: "書類をスマートフォンと平行にしてください",
    document_scanned_aria: "成功！ドキュメントをスキャンしました",
    document_too_close_to_edge: "遠くへ移動",
    face_photo_not_fully_visible: "顔写真が完全に見えるようにしてください",
    flip_document: "書類を反転してください",
    flip_to_back_side: "裏面にしてください",
    front_side_scanned_aria: "成功！表面をスキャンしました",
    glare_detected: "書類を傾けたり移動したりして反射を除去する",
    keep_document_parallel: "ドキュメントを画面と平行に保ってください",
    keep_document_still: "ドキュメントと端末を動かさないでください",
    move_closer: "近くへ移動",
    move_farther: "遠くへ移動",
    move_left: "左のページへ移動する",
    move_right: "右のページへ移動する",
    move_top: "上のページへ移動する",
    occluded: "書類全体が見えるようにしてください",
    scan_data_page: "書類のデータページをスキャンしてください",
    scan_last_page_barcode: "最後のページからバーコードをスキャンしてください",
    scan_left_page: "左のページをスキャンする",
    scan_right_page: "右のページをスキャンする",
    scan_the_back_side: "書類の裏面をスキャンしてください。",
    scan_the_barcode: "バーコードをスキャンしてください",
    scan_the_front_side: "書類の表側をスキャンしてください",
    scan_top_page: "上のページをスキャンする",
    too_bright: "暗い場所に移動してください",
    too_dark: "明るい場所に移動してください",
    wrong_left: "左ページへ移動",
    wrong_right: "右ページへ移動",
    wrong_top: "トップページへ移動",
  },
  help_button: { aria_label: "ヘルプ", tooltip: "ヘルプが必要ですか？" },
  help_modal: {
    aria: "スキャンに関するヘルプ",
    back_btn: "戻る",
    blur: {
      details:
        "スキャン中は,スマートフォンと書類を動かさないようにしてください。どちらかが動くと,画像がぼやけて書類上のデータが判読できなくなる可能性があります。",
      details_desktop:
        "スキャン中は、端末とドキュメントをできるだけ動かさないでください。どちらかが動くと画像がぼやけ、ドキュメントの情報が読み取れなくなる場合があります。",
      title: "スキャン中は動かさないでください",
    },
    camera_lens: {
      details:
        "カメラのレンズに汚れやホコリが付いていないか確認してください。レンズが汚れていると最終画像がぼやけ、ドキュメントの詳細が読み取れなくなり、データのスキャンに失敗する原因になります。",
      title: "カメラのレンズを拭いてください",
    },
    done_btn: "完了",
    done_btn_aria: "スキャンを再開",
    lighting: {
      details:
        "強い光が書類に反射し,一部が判読できなくなる可能性があるため,直射日光は避けてください。書類上のデータが読み取れない場合は,カメラにも映りません。",
      title: "強い光にご注意ください",
    },
    next_btn: "次へ",
    visibility: {
      details:
        "書類の下部の線も含め,指で書類の一部を覆わないようにしてください。また,書類のフィールドを覆うホログラムの反射にもご注意ください。",
      title: "すべてのフィールドが見えるようにしてください",
    },
  },
  onboarding_modal: {
    aria: "スキャンの手順",
    btn: "スキャンを開始",
    details:
      "書類を十分に明るく保ち,カメラの画面に書類のすべての項目が映っていることを確認してください。",
    details_desktop:
      "カメラのレンズを清潔に保ち、ドキュメントが十分明る口なるようにしてください。ドキュメントのすべての項目がカメラの画面内ににおさまるようにしてください。",
    title: "すべての詳細が見えるようにしてください",
    title_desktop: "スキャンの準備",
  },
  sdk_aria: "ドキュメントスキャン画面",
  timeout_modal: {
    cancel_btn: "キャンセル",
    details: "書類を読み取れません。もう一度お試しください。",
    retry_btn: "再試行",
    title: "スキャンに失敗しました",
  },
} as const;
