/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for de.
 */
export default {
  feedback_messages: {
    blur_detected: "Karte und Telefon ruhig halten",
    blur_detected_desktop: "Karte und Gerät ruhig halten",
    camera_angle_too_steep: "Halten Sie die Karte parallel zum Telefon",
    camera_angle_too_steep_desktop: "Karte parallel zum Bildschirm halten",
    card_number_scanned: "Erfolg! Nummernseite der Karte gescannt.",
    card_scanned: "Erfolg! Karte gescannt.",
    document_too_close_to_edge: "Bewegen Sie sich weiter weg",
    flip_card: "Drehen Sie die Karte um",
    flip_to_back_side: "Drehen Sie die Karte um",
    move_closer: "Kommen Sie näher",
    move_farther: "Bewegen Sie sich weiter weg",
    occluded: "Achten Sie darauf, dass die Karte vollständig sichtbar bleibt",
    scan_the_back_side: "Scannen Sie die andere Seite der Karte",
    scan_the_front_side: "Scannen Sie die Kartennummer",
  },
  help_button: { aria_label: "Hilfe", tooltip: "Brauchen Sie Hilfe?" },
  help_modal: {
    aria: "Hilfe beim Scannen",
    back_btn: "Zurück",
    blur: {
      details:
        "Versuchen Sie, das Telefon und die Karte während des Scanvorgangs ruhig zu halten. Jede Bewegung kann das Bild unscharf und die Daten auf der Karte unlesbar machen.",
      details_desktop:
        "Versuchen Sie, das Gerät und die Karte während des Scanvorgangs ruhig zu halten. Jede Bewegung kann das Bild unscharf und die Daten auf der Karte unlesbar machen.",
      title: "Halten Sie während des Scanvorgangs still",
    },
    camera_lens: {
      details:
        "Überprüfen Sie Ihr Kameraobjektiv auf Verschmutzungen oder Staub. Ein verschmutztes Objektiv führt dazu, dass das endgültige Bild unscharf wird, wodurch die Kartendetails unleserlich werden und ein erfolgreiches Scannen der Daten verhindert wird.",
      title: "Reinigen Sie Ihr Kameraobjektiv",
    },
    card_number: {
      details:
        "Die Kartennummer besteht normalerweise aus 16 Ziffern, kann aber auch zwischen 12 und 19 Ziffern umfassen. Die Nummer sollte entweder aufgedruckt oder in erhabenen Ziffern auf der Karte eingeprägt sein. Sie kann sich auf der Vorder- oder Rückseite Ihrer Karte befinden.",
      title: "Wo finde ich die Kartennummer?",
    },
    done_btn: "Fertig",
    done_btn_aria: "Scannen fortsetzen",
    lighting: {
      details:
        "Meiden Sie direktes, grelles Licht, da dieses von der Karte reflektiert wird und so Teile der Karte unkenntlich machen kann. Wenn Sie keine Daten auf der Karte lesen können, sind diese auch für die Kamera nicht sichtbar.",
      title: "Achten Sie auf grelles Licht",
    },
    next_btn: "Weiter",
    occlusion: {
      details:
        "Gehen Sie auf Nummer sicher, indem Sie Teile der Karte nicht mit dem Finger verdecken, insbesondere nicht die unteren Zeilen. Vermeiden Sie außerdem Spiegelungen von Hologrammen, die über die Felder der Karte hinausgehen.",
      title: "Machen Sie alle Felder sichtbar",
    },
  },
  onboarding_modal: {
    aria: "Anweisungen zum Scannen",
    btn: "Scannen beginnen",
    details:
      "Die Kartennummer besteht in der Regel aus einer 16-stelligen Zahl. Die Nummer sollte entweder aufgedruckt oder in erhabenen Ziffern auf der Karte eingeprägt sein. Versichern Sie sich, dass die Karte gut beleuchtet ist und alle Details sichtbar sind.",
    details_desktop:
      "Die Kartennummer besteht in der Regel aus einer 16-stelligen Zahl. Die Nummer sollte entweder aufgedruckt oder in erhabenen Ziffern auf der Karte eingeprägt sein. Versichern Sie sich, dass das Kameraobjektiv sauber ist, die Karte gut beleuchtet ist und alle Details sichtbar sind.",
    title: "Scannen Sie zuerst die Kartennummer",
  },
  sdk_aria: "Kartenscanner-Bildschirm",
  timeout_modal: {
    cancel_btn: "Abbrechen",
    details:
      "Die Karte kann nicht gelesen werden. Bitte versuchen Sie es erneut.",
    retry_btn: "Wiederholen",
    title: "Scan nicht erfolgreich",
  },
} as const;
