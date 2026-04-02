/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for de.
 */
export default {
  document_filtered_modal: {
    details: "Versuchen Sie, ein anderes Dokument zu scannen.",
    title: "Dokument nicht akzeptiert",
  },
  document_not_recognized_modal: {
    details: "Scannen Sie die Vorderseite eines unterstützten Dokuments.",
    title: "Dokument nicht erkannt",
  },
  feedback_messages: {
    blur_detected: "Dokument und Telefon ruhig halten",
    camera_angle_too_steep: "Dokument parallel zum Telefon halten",
    document_scanned_aria: "Erfolg! Dokument gescannt",
    document_too_close_to_edge: "Bewegen Sie sich weiter weg",
    face_photo_not_fully_visible: "Gesichtsfoto komplett sichtbar lassen",
    flip_document: "Dokument wenden",
    flip_to_back_side: "Drehen Sie das Dokument um",
    front_side_scanned_aria: "Erfolg! Vorderseite gescannt",
    glare_detected:
      "Dokument neigen oder bewegen, um die Spiegelung zu beseitigen",
    keep_document_parallel: "Dokument parallel zum Bildschirm halten",
    keep_document_still: "Dokument und Gerät ruhig halten",
    move_closer: "Kommen Sie näher",
    move_farther: "Bewegen Sie sich weiter weg",
    move_left: "Auf die Seite links wechseln",
    move_right: "Gehen Sie zur Seite rechts",
    move_top: "Auf die Seite oben wechseln",
    occluded: "Sicherstellen, dass das Dokument vollständig sichtbar bleibt",
    scan_data_page: "Scannen Sie die Datenseite des Dokuments",
    scan_last_page_barcode: "Scannen Sie den Barcode auf der letzten Seite",
    scan_left_page: "Linke Seite scannen",
    scan_right_page: "Rechte Seite scannen",
    scan_the_back_side: "Scannen Sie die Rückseite des Dokuments",
    scan_the_barcode: "Scannen Sie den Barcode",
    scan_the_front_side: "Scannen Sie die Vorderseite \\n eines Dokuments",
    scan_top_page: "Oberste Seite scannen",
    too_bright: "An eine Stelle mit weniger Licht gehen",
    too_dark: "An eine hellere Stelle gehen",
    wrong_left: "Zur linken Seite wechseln",
    wrong_right: "Zur rechten Seite wechseln",
    wrong_top: "Zur obersten Seite wechseln",
  },
  help_button: { aria_label: "Hilfe", tooltip: "Brauchen Sie Hilfe?" },
  help_modal: {
    aria: "Hilfe beim Scannen",
    back_btn: "Zurück",
    blur: {
      details:
        "Versuchen Sie, das Telefon und das Dokument während des Scanvorgangs ruhig zu halten. Jede Bewegung kann das Bild unscharf und die Daten auf dem Dokument unlesbar machen.",
      details_desktop:
        "Versuchen Sie, das Gerät und das Dokument während des Scanvorgangs ruhig zu halten. Jede Bewegung kann das Bild unscharf und die Daten auf dem Dokument unlesbar machen.",
      title: "Halten Sie während des Scanvorgangs still",
    },
    camera_lens: {
      details:
        "Überprüfen Sie Ihr Kameraobjektiv auf Verschmutzungen oder Staub. Ein verschmutztes Objektiv führt dazu, dass das endgültige Bild unscharf wird, wodurch die Dokumentendetails unleserlich werden und ein erfolgreiches Scannen der Daten verhindert wird.",
      title: "Reinigen Sie Ihr Kameraobjektiv",
    },
    done_btn: "Fertig",
    done_btn_aria: "Scannen fortsetzen",
    lighting: {
      details:
        "Meiden Sie direktes, grelles Licht, da dieses vom Dokument reflektiert wird und so Teile des Dokuments unkenntlich machen kann. Wenn Sie keine Daten auf dem Dokument lesen können, sind diese auch für die Kamera nicht sichtbar.",
      title: "Achten Sie auf grelles Licht",
    },
    next_btn: "Weiter",
    visibility: {
      details:
        "Gehen Sie auf Nummer sicher, indem Sie Teile des Dokuments nicht mit dem Finger verdecken, insbesondere nicht die unteren Zeilen. Vermeiden Sie außerdem Spiegelungen von Hologrammen, die über die Felder des Dokuments hinausgehen.",
      title: "Machen Sie alle Felder sichtbar",
    },
  },
  onboarding_modal: {
    aria: "Anweisungen zum Scannen",
    btn: "Scannen beginnen",
    details:
      "Sorgen Sie dafür, dass das Dokument gut belichtet ist. Alle Bereiche des Dokuments sollten auf dem Kamerabildschirm sichtbar sein.",
    details_desktop:
      "Sorgen Sie dafür, dass Ihr Kameraobjektiv sauber ist und das Dokument gut belichtet ist. Alle Bereiche des Dokuments sollten auf dem Kamerabildschirm sichtbar sein.",
    title: "Machen Sie alle Informationen sichtbar",
    title_desktop: "Machen Sie sich bereit zum Scannen",
  },
  sdk_aria: "Dokumentenscanner-Bildschirm",
  timeout_modal: {
    cancel_btn: "Abbrechen",
    details:
      "Das Dokument kann nicht gelesen werden. Bitte versuchen Sie es erneut.",
    retry_btn: "Wiederholen",
    title: "Scan nicht erfolgreich",
  },
} as const;
