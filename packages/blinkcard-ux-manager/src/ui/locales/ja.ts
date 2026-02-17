/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for ja.
 */
export default {
  feedback_messages: {
    blur_detected: "カードとスマートフォンを動かさないでください",
    blur_detected_desktop: "カードと端末を動かさないでください",
    camera_angle_too_steep: "カードをスマートフォンと平行に保ってください",
    camera_angle_too_steep_desktop:
      "カードを画面と平行に保つようにしてください",
    card_number_scanned: "成功！カード番号のある面をスキャンしました",
    card_scanned: "成功！カードをスキャンしました",
    document_too_close_to_edge: "遠くへ移動",
    flip_card: "カードを裏返してください",
    flip_to_back_side: "カードを裏返してください",
    move_closer: "近くへ移動",
    move_farther: "遠くへ移動",
    occluded: "カード全体をはっきりと写してください",
    scan_the_back_side: "カードの反対側をスキャンしてください",
    scan_the_front_side: "カード番号をスキャン",
  },
  help_button: { aria_label: "ヘルプ", tooltip: "ヘルプが必要ですか？" },
  help_modal: {
    back_btn: "戻る",
    blur: {
      details:
        "スキャン中はスマートフォンとカードが動かないようにしてください。どちらかを動かすと画像が不鮮明になり,カードのデータを読み取れなくなる可能性があります。",
      details_desktop:
        "スキャン中は端末とカードを動かさないでください。片方でも動くと画像がぼやけ,カード上のデータが読み取れなくなる恐れがあります。",
      title: "スキャン中は動かさないでください",
    },
    camera_lens: {
      details:
        "カメラレンズに汚れやほこりがないか確認してください。レンズが汚れていると,撮影画像がぼやけてカード情報が読み取れなくなり,データのスキャンが正常に行えなくなります。",
      title: "カメラのレンズを拭いてください",
    },
    card_number: {
      details:
        "カード番号は通常,16桁の数字ですが,12～19桁の場合もあります。カード番号は,カードに印刷またはエンボス加工（浮き彫り）された数字として記載されています。カードの表面または裏面に記載されています。",
      title: "カード番号はどこにありますか？",
    },
    done_btn: "完了",
    lighting: {
      details:
        "強い光を直接当てるとカードに反射してカードの一部が読み取れなくなる可能性があるため,避けてください。カードのデータを読み取れない場合,カメラにも認識されません。",
      title: "強い光にご注意ください",
    },
    next_btn: "次へ",
    occlusion: {
      details:
        "下部の線も含め,カードの一部を指で覆わないようにしてください。また,カードの領域にかかるホログラムの反射にもご注意ください。",
      title: "すべてのフィールドが見えるようにしてください",
    },
  },
  onboarding_modal: {
    btn: "スキャンを開始",
    details:
      "カード番号は通常,16桁の数字です。カード番号は,カードに印刷またはエンボス加工（浮き彫り）された数字として記載されています。カードが十分に明るく照らされ,すべての詳細が視認できるようにしてください。",
    details_desktop:
      "カード番号は通常16桁の数字です。カード表面に印字,もしくはエンボス加工で刻印されている必要があります。カメラレンズが汚れていないか,カードに適度な照明が当たっているか,すべての情報がはっきりと写っているかをご確認ください。",
    title: "最初にカード番号をスキャンしてください",
  },
  timeout_modal: {
    cancel_btn: "キャンセル",
    details: "カードを読み取れません。再度お試しください。",
    retry_btn: "再試行",
    title: "スキャンに失敗しました",
  },
} as const;
