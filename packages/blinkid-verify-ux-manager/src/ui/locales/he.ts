/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for he.
 */
export default {
  document_filtered_modal: {
    details: "נסו לסרוק מסמך אחר.",
    title: "המסמך לא התקבל",
  },
  document_not_recognized_modal: {
    details: "לסרוק את הצד הקדמי של מסמך נתמך.",
    title: "המסמך לא זוהה",
  },
  feedback_messages: {
    blur_detected: "השאירו את המסמך והטלפון ללא תזוזה",
    camera_angle_too_steep: "השאירו את המסמך מקביל לטלפון",
    document_scanned_aria: "הצלחה! המסמך נסרק",
    document_too_close_to_edge: "התרחק/י",
    face_photo_not_fully_visible: "לשמור על נראות מלאה של תמונת פנים",
    flip_document: "להפוך את המסמך",
    flip_to_back_side: "להפוך את המסמך",
    front_side_scanned_aria: "הצלחה! הצד הקדמי נסרק",
    glare_detected: "הטו או הזיזו את המסמך כדי להסיר את ההשתקפות",
    keep_document_parallel: "יש לשמור על המסמך מקביל למסך",
    keep_document_still: "נא לשמור שהמכשיר והמסמך לא זזים",
    move_closer: "קרב/י",
    move_farther: "התרחק/י",
    move_left: "עבור אל העמוד בצד שמאל",
    move_right: "עבור אל העמוד בצד ימין",
    move_top: "עבור אל העמוד העליון",
    occluded: "השאירו את המסמך גלוי לחלוטין",
    scan_data_page: "סרקו את עמוד הנתונים במסמך",
    scan_last_page_barcode: "סרקו את הברקוד מהעמוד הקודם",
    scan_left_page: "סרוק את העמוד השמאלי",
    scan_right_page: "סרוק את העמוד הימני",
    scan_the_back_side: "סרקו את הצד האחורי של המסמך",
    scan_the_barcode: "לסרוק את הברקוד",
    scan_the_front_side: "לסרוק את הצד הקדמי של מסמך",
    scan_top_page: "סרוק את העמוד העליון",
    too_bright: "עברו למקום עם פחות תאורה",
    too_dark: "עברו למקום בהיר יותר",
    wrong_left: "עבור אל העמוד השמאלי",
    wrong_right: "עבור אל העמוד הימני",
    wrong_top: "עבור אל העמוד העליון",
  },
  help_button: { aria_label: "עזרה", tooltip: "זקוקים לעזרה?" },
  help_modal: {
    aria: "סיוע בסריקה",
    back_btn: "חזור",
    blur: {
      details:
        "נסה לשמור על יציבות הטלפון והמסמך בזמן הסריקה. הזזתם עלולה לטשטש את התמונה ולהפוך את הנתונים במסמך לבלתי קריאים.",
      details_desktop:
        "נסו לשמור על המכשיר והמסמך יציבים בזמן הסריקה. תזוזה של כל אחד מהם עלולה לטשטש את התמונה ולגרום לנתונים במסמך להיות מטושטשים.",
      title: "הישאר יציב בזמן הסריקה",
    },
    camera_lens: {
      details:
        "בדקו את עדשת המצלמה שלכם לאיתור כתמים או אבק. עדשה מלוכלכת גורמת לטשטוש התמונה הסופית, מה שהופך את פרטי המסמך לבלתי קריאים ומונעת סריקה מוצלחת של הנתונים.",
      title: "יש לנקות את עדשת המצלמה",
    },
    done_btn: "בוצע",
    done_btn_aria: "המשך סריקה",
    lighting: {
      details:
        "הימנע מאור ישיר חזק מכיוון שהוא משתקף מהמסמך ועלול להפוך חלקים מהמסמך לבלתי קריאים. אם אינך יכול לקרוא את הנתונים במסמך, הם לא יהיו גלויים גם למצלמה.",
      title: "התרחק מאור חזק",
    },
    next_btn: "הבא",
    visibility: {
      details:
        "הקפד לא לכסות חלקים מהמסמך באצבע, כולל השורות התחתונות.כמו כן, היזהר מהשתקפויות הולוגרמה העוברות על שדות המסמך.",
      title: "כל השדות צריכים להיות גלויים",
    },
  },
  onboarding_modal: {
    aria: "הנחיות סריקה",
    btn: "התחלת סריקה",
    details:
      "המסמך חייב להיות מואר היטב. כל שדות המסמכים צריכים להיות גלויים על מסך המצלמה.",
    details_desktop:
      "יש לוודא שעדשת המצלמה נקייה ושהמסמך מואר היטב. כל שדות המסמך צריכים להופיע בבירור על מסך המצלמה.",
    title: "כל הפרטים חייבים להיות גלויים",
    title_desktop: "להתכונן לסרוק",
  },
  sdk_aria: "מסך סריקת מסמך",
  timeout_modal: {
    cancel_btn: "ביטול",
    details: "לא ניתן לקרוא את המסמך. נא לנסות שוב.",
    retry_btn: "לנסות שוב",
    title: "הסריקה נכשלה",
  },
} as const;
