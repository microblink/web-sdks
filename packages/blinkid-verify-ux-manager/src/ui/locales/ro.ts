/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for ro.
 */
export default {
  document_filtered_modal: {
    details: "Încercați să scanați un alt document.",
    title: "Document neacceptat",
  },
  document_not_recognized_modal: {
    details: "Scanați fața unui document suportat.",
    title: "Documentul nu a fost recunoscut",
  },
  feedback_messages: {
    blur_detected: "Păstrați documentul și telefonul nemișcate",
    camera_angle_too_steep: "Păstrați documentul paralel cu telefonul",
    document_scanned_aria: "Excelent! Documentul a fost scanat",
    document_too_close_to_edge: "Îndepărtați",
    face_photo_not_fully_visible: "Mențineți fotografia feței complet vizibilă",
    flip_document: "Întoarceți documentul",
    flip_to_back_side: "Întoarceți documentul",
    front_side_scanned_aria: "Excelent! Partea din față a fost scanată",
    glare_detected:
      "Înclinați sau deplasați documentul pentru a elimina reflexiile",
    keep_document_parallel: "Țineți documentul paralel cu ecranul",
    keep_document_still: "Mențineți documentul și dispozitivul nemișcate",
    move_closer: "Apropiați",
    move_farther: "Îndepărtați",
    move_left: "Treceți la pagina din stânga",
    move_right: "Treceți la pagina din dreapta",
    move_top: "Treceți la pagina de sus",
    occluded: "Menține documentul vizibil integral",
    scan_data_page: "Scanați pagina de date a documentului",
    scan_last_page_barcode: "Scanează codul de bare de pe ultima pagină",
    scan_left_page: "Scanați pagina stângă",
    scan_right_page: "Scanați pagina dreaptă",
    scan_the_back_side: "Scanați partea din spate a documentului",
    scan_the_barcode: "Scanare cod de bare",
    scan_the_front_side: "Scanați partea din față\\na unui document",
    scan_top_page: "Scanați prima pagină",
    too_bright: "Mutați-vă într-un loc mai puțin luminos",
    too_dark: "Mutați-vă într-un loc mai luminos",
    wrong_left: "Treceți la pagina stângă",
    wrong_right: "Treceți la pagina dreaptă",
    wrong_top: "Treceți la prima pagină",
  },
  help_button: { aria_label: "Ajutor", tooltip: "Aveți nevoie de ajutor?" },
  help_modal: {
    aria: "Ajutor pentru scanare",
    back_btn: "Înapoi",
    blur: {
      details:
        "Încercați să mențineți telefonul și documentul imobile în timpul scanării. Mișcările pot compromite claritatea imaginii și pot face imposibilă citirea datelor din document.",
      details_desktop:
        "Încercați să mențineți dispozitivul și documentul nemișcate în timpul scanării. Deplasarea oricăruia poate face imaginea neclară și datele de pe document ilizibile.",
      title: "Nu vă mișcați în timpul scanării",
    },
    camera_lens: {
      details:
        "Verificați ca lentila camerei să nu prezinte pete sau praf. Folosirea unei lentile murdare duce la o imagine finală neclară, făcând detaliile documentului ilizibile și împiedicând scanarea cu succes a datelor.",
      title: "Curățați lentila camerei",
    },
    done_btn: "Terminat",
    done_btn_aria: "Reluați scanarea",
    lighting: {
      details:
        "Evitați lumina puternică directă, deoarece se va reflecta din document și poate face imposibilă citirea anumitor porțiuni din acesta. Dacă nu puteți citi datele din document, ele nu vor fi vizibile nici pe cameră.",
      title: "Feriți-vă de lumina puternică",
    },
    next_btn: "Următorul",
    visibility: {
      details:
        "Asigurați-vă că nu ați acoperit cu degetul porțiuni din document, nici rândurile de jos. Evitați și reflexiile holografice care se suprapun pe secțiunile din document.",
      title: "Asigurați vizibilitatea tuturor secțiunilor",
    },
  },
  onboarding_modal: {
    aria: "Instrucțiuni de scanare",
    btn: "Porniți scanarea",
    details:
      "Asigurați-vă că documentul este bine iluminat. Toate secțiunile din document trebuie să fie vizibile pe ecranul camerei.",
    details_desktop:
      "Asigurați-vă că lentila camerei este curată, iar documentul este bine iluminat. Toate câmpurile din document trebuie să fie vizibile pe ecranul camerei.",
    title: "Asigurați vizibilitatea tuturor detaliilor",
    title_desktop: "Pregătiți-vă să scanați",
  },
  sdk_aria: "Ecran scanare documente",
  timeout_modal: {
    cancel_btn: "Anulați",
    details: "Documentul nu poate fi citit. Încercați din nou.",
    retry_btn: "Reîncercare",
    title: "Scanare nereușită",
  },
} as const;
