/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for sl.
 */
export default {
  document_filtered_modal: {
    details: "Poskusite optično prebrati drug dokument.",
    title: "Dokument ni sprejet",
  },
  document_not_recognized_modal: {
    details: "Optično preberite sprednjo stran podprtega dokumenta",
    title: "Dokument ni prepoznan",
  },
  feedback_messages: {
    blur_detected: "Še vedno hranite dokumente in telefon",
    camera_angle_too_steep: "Dokument hranite vzporedno s telefonom",
    document_scanned_aria: "Uspelo! Dokument skeniran",
    document_too_close_to_edge: "Oddaljite",
    face_photo_not_fully_visible: "Fotografija obraza naj bo v celoti vidna",
    flip_document: "Obrnite dokument",
    flip_to_back_side: "Obrnite dokument",
    front_side_scanned_aria: "Uspelo! Skenirana sprednja stran",
    glare_detected: "Nagnite ali premaknite dokument, da odstranite odsev",
    keep_document_parallel: "Dokument naj bo vzporedno z zaslonom",
    keep_document_still: "Držite dokument in napravo pri miru",
    move_closer: "Približajte",
    move_farther: "Oddaljite",
    move_left: "Premaknite se na stran na levi",
    move_right: "Premaknite se na stran na desni",
    move_top: "Premaknite se na stran na vrhu",
    occluded: "Dokument ohrani povsem viden",
    scan_data_page: "Optično preberite podatkovno stran dokumenta",
    scan_last_page_barcode: "Optično preberite črtno kodo z zadnje strani",
    scan_left_page: "Skenirajte levo stran",
    scan_right_page: "Skenirajte desno stran",
    scan_the_back_side: "Optično preberite hrbtno stran dokumenta",
    scan_the_barcode: "Optično preberite črtno kodo",
    scan_the_front_side: "Optično preberite sprednjo\\nstran dokumenta",
    scan_top_page: "Skenirajte prvo stran",
    too_bright: "Premaknite se na mesto z manj svetlobe",
    too_dark: "Premaknite se na svetlejšo točko",
    wrong_left: "Premaknite se na levo stran",
    wrong_right: "Premaknite se na desno stran",
    wrong_top: "Premaknite se na prvo stran",
  },
  help_button: { aria_label: "Pomoč", tooltip: "Potrebujete pomoč?" },
  help_modal: {
    aria: "Pomoč pri optičnem branju",
    back_btn: "Nazaj",
    blur: {
      details:
        "Potrudite se, da bosta med optičnim branjem telefon in dokument pri miru. Če se kateri od njiju premakne, se lahko slika razmaže in dokument postane neberljiv.",
      details_desktop:
        "Potrudite se, da bosta med optičnim branjem naprava in dokument pri miru. Če se kateri od njiju premakne, se lahko slika razmaže in bodo podatki na dokumentu neberljivi.",
      title: "Držite pri miru med optičnim branjem",
    },
    camera_lens: {
      details:
        "Preverite, da ni morda na objektivu kamere kakšna umazanija ali prah. Če je objektiv umazan, dobite zamegljeno končno sliko, zato je potem vsebina dokumenta neberljiva in podatkov ni mogoče uspešno optično prebrati.",
      title: "Očistite objektiv kamere",
    },
    done_btn: "Končano",
    done_btn_aria: "Nadaljuj optično branje",
    lighting: {
      details:
        "Izogibajte se neposredni močni svetlobi, saj se ta odbija od dokumenta in lahko dele dokumenta naredi neberljive. Če ne morete prebrati podatkov na dokumentu, jih niti kamera ne bo mogla videti.",
      title: "Svetloba ne sme biti premočna",
    },
    next_btn: "Naprej",
    visibility: {
      details:
        "Poskrbite, da s prstom ne boste prekrivali delov dokumenta, to velja tudi za spodnjo linijo. Prav tako bodite pozorni na hologramske znake, ki gredo preko polj na dokumentu.",
      title: "Vidna morajo biti vsa polja",
    },
  },
  onboarding_modal: {
    aria: "Navodila za optično branje",
    btn: "Začetek skeniranja",
    details:
      "Poskrbite, da bo dokument dobro osvetljen. Na zaslonu kamere morajo biti vidna vsa polja dokumenta.",
    details_desktop:
      "Poskrbite, da bo objektiv vaše kamere čist, dokument pa dobro osvetljen. Na zaslonu kamere morajo biti vidna vsa polja dokumenta.",
    title: "Vidni morajo biti vsi podatki",
    title_desktop: "Pripravite se na optično branje",
  },
  sdk_aria: "Zaslon za optično branje dokumentov",
  timeout_modal: {
    cancel_btn: "Prekliči",
    details: "Dokumenta ni mogoče prebrati. Poskusite znova.",
    retry_btn: "Poskusi znova",
    title: "Optično branje ni uspelo",
  },
} as const;
