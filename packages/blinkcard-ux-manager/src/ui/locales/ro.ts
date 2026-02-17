/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for ro.
 */
export default {
  feedback_messages: {
    blur_detected: "Mențineți cardul și telefonul nemișcate",
    blur_detected_desktop: "Mențineți cardul și dispozitivul nemișcate",
    camera_angle_too_steep: "Țineți cardul paralel cu telefonul",
    camera_angle_too_steep_desktop: "Țineți cardul paralel cu ecranul",
    card_number_scanned: "Succes! Fața cu numărul cardului scanată",
    card_scanned: "Succes! Card scanat",
    document_too_close_to_edge: "Îndepărtați",
    flip_card: "Întoarceți cardul",
    flip_to_back_side: "Întoarceți cardul",
    move_closer: "Apropiați",
    move_farther: "Îndepărtați",
    occluded: "Țineți cardul astfel încât să fie vizibil complet",
    scan_the_back_side: "Scanează cealaltă parte a cardului",
    scan_the_front_side: "Scanare număr card",
  },
  help_button: { aria_label: "Ajutor", tooltip: "Aveți nevoie de ajutor?" },
  help_modal: {
    back_btn: "Înapoi",
    blur: {
      details:
        "Încercați să mențineți telefonul și cardul imobile în timpul scanării. Mișcările pot compromite claritatea imaginii și pot face imposibilă citirea datelor de pe card.",
      details_desktop:
        "Încercați să mențineți dispozitivul și cardul nemișcate în timpul scanării. Deplasarea oricăruia poate face imaginea neclară și datele de pe card ilizibile.",
      title: "Nu vă mișcați în timpul scanării",
    },
    camera_lens: {
      details:
        "Verificați dacă lentila camerei prezintă pete sau praf. Folosirea unei lentile murdare duce la o imagine finală neclară, făcând detaliile cardului ilizibile și împiedicând scanarea cu succes a datelor.",
      title: "Curățați lentila camerei",
    },
    card_number: {
      details:
        "Numărul cardului conține de regulă 16 cifre, deși unele pot avea între 12 și 19 cifre. În principiu, acesta este inscripționat sau reliefat pe card. Se poate afla pe partea din față sau partea verso a cardului.",
      title: "Unde se află numărul cardului?",
    },
    done_btn: "Terminat",
    lighting: {
      details:
        "Evitați lumina puternică directă, deoarece se va reflecta din card și poate face imposibilă citirea anumitor porțiuni din acesta. Dacă nu puteți citi datele de pe card, ele nu vor fi vizibile nici pe cameră.",
      title: "Feriți-vă de lumina puternică",
    },
    next_btn: "Următorul",
    occlusion: {
      details:
        "Asigurați-vă că nu ați acoperit cu degetul porțiuni de pe card, nici rândurile de jos. Evitați și reflexiile holografice care se suprapun pe secțiunile din card.",
      title: "Asigurați vizibilitatea tuturor secțiunilor",
    },
  },
  onboarding_modal: {
    btn: "Porniți scanarea",
    details:
      "Numărul cardului conține de regulă 16 cifre. În principiu, acesta este inscripționat sau reliefat pe card. Asigurați-vă că este bine iluminat cardul și că toate detaliile sunt vizibile.",
    details_desktop:
      "Numărul cardului este de obicei compus din 16 cifre. Acesta ar trebui să fie inscripționat sau reliefat pe card. Asigurați-vă că lentila camerei este curată, cardul este bine iluminat, iar toate detaliile sunt vizibile.",
    title: "Scanați numărul cardului mai întâi",
  },
  timeout_modal: {
    cancel_btn: "Anulați",
    details: "Cardul nu poate fi citit. Vă rugăm să încercați din nou.",
    retry_btn: "Reîncercare",
    title: "Scanare nereușită",
  },
} as const;
