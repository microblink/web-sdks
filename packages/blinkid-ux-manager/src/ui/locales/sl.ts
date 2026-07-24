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
  error_modal: { cancel_btn: "Prekliči", retry_btn: "Poskusi znova" },
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
    keep_still: "Ne premikajte se",
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
    scan_the_barcode_side: "Skenirajte stran dokumenta s črtno kodo.",
    scan_the_front_side: "Optično preberite sprednjo\\nstran dokumenta",
    scan_the_mrz_side:
      "Skenirajte stran dokumenta s strojno berljivim območjem",
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
    barcode_only: {
      blur: {
        details:
          "Med skeniranjem poskusite telefon in črtno kodo držati pri miru. Premikanje lahko zamegli sliko in oteži branje črtne kode.",
        details_desktop:
          "Poskusite med skeniranjem ostati pri miru. Premikanje lahko zamegli sliko in oteži branje črtne kode.",
        title: "Držite pri miru med optičnim branjem",
        title_desktop: "Držite pri miru med optičnim branjem",
      },
      camera_lens: {
        details_desktop:
          "Preverite, ali so na objektivu kamere madeži ali prah. Umazan objektiv lahko povzroči zamegljeno sliko, zaradi česar črtne kode ni mogoče prebrati in podatkov ni mogoče uspešno skenirati.",
        title_desktop: "Očistite objektiv kamere",
      },
      lighting: {
        details:
          "Izogibajte se močni neposredni svetlobi, saj lahko povzroči bleščanje na črtni kodi in oteži skeniranje. Če črtna koda ni jasno vidna vam, je morda tudi kamera ne bo mogla prebrati.",
        details_desktop:
          "Izogibajte se močni neposredni svetlobi, saj lahko povzroči bleščanje na črtni kodi in oteži skeniranje. Če črtna koda ni jasno vidna vam, je morda tudi kamera ne bo mogla prebrati.",
        title: "Svetloba ne sme biti premočna",
        title_desktop: "Svetloba ne sme biti premočna",
      },
      visibility: {
        details:
          "Prepričajte se, da s prstom ne prekrivate delov črtne kode. Pazite tudi na odseve, ki prekrivajo črtno kodo in jo lahko naredijo nečitljivo.",
        details_desktop:
          "Prepričajte se, da s prstom ne prekrivate delov črtne kode. Pazite tudi na odseve, ki prekrivajo črtno kodo in jo lahko naredijo nečitljivo.",
        title: "Črtna koda naj bo vidna",
        title_desktop: "Črtna koda naj bo vidna",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "Potrudite se, da bosta med optičnim branjem telefon in dokument pri miru. Če se kateri od njiju premakne, se lahko slika razmaže in dokument postane neberljiv.",
        details_desktop:
          "Med skeniranjem poskusite mirovati. Premikanje lahko zamegli sliko in oteži branje podatkov na dokumentu.",
        title: "Držite pri miru med optičnim branjem",
        title_desktop: "Držite pri miru med optičnim branjem",
      },
      camera_lens: {
        details_desktop:
          "Preverite, da ni morda na objektivu kamere kakšna umazanija ali prah. Če je objektiv umazan, dobite zamegljeno končno sliko, zato je potem vsebina dokumenta neberljiva in podatkov ni mogoče uspešno optično prebrati.",
        title_desktop: "Očistite objektiv kamere",
      },
      lighting: {
        details:
          "Izogibajte se neposredni močni svetlobi, saj se ta odbija od dokumenta in lahko dele dokumenta naredi neberljive. Če ne morete prebrati podatkov na dokumentu, jih niti kamera ne bo mogla videti.",
        details_desktop:
          "Izogibajte se neposredni močni svetlobi, saj se ta odbija od dokumenta in lahko dele dokumenta naredi neberljive. Če ne morete prebrati podatkov na dokumentu, jih niti kamera ne bo mogla videti.",
        title: "Svetloba ne sme biti premočna",
        title_desktop: "Svetloba ne sme biti premočna",
      },
      visibility: {
        details:
          "Prepričajte se, da s prstom ne prekrivate delov črtne kode. Pazite tudi na odseve, ki prekrivajo črtno kodo in jo lahko naredijo nečitljivo.",
        details_desktop:
          "Prepričajte se, da s prstom ne prekrivate delov črtne kode. Pazite tudi na odseve, ki prekrivajo črtno kodo in jo lahko naredijo nečitljivo.",
        title: "Črtna koda naj bo vidna",
        title_desktop: "Črtna koda naj bo vidna",
      },
    },
    document_with_mrz: {
      blur: {
        details:
          "Potrudite se, da bosta med optičnim branjem telefon in dokument pri miru. Če se kateri od njiju premakne, se lahko slika razmaže in dokument postane neberljiv.",
        details_desktop:
          "Med skeniranjem poskusite mirovati. Premikanje lahko zamegli sliko in oteži branje podatkov na dokumentu.",
        title: "Držite pri miru med optičnim branjem",
        title_desktop: "Držite pri miru med optičnim branjem",
      },
      camera_lens: {
        details_desktop:
          "Preverite, da ni morda na objektivu kamere kakšna umazanija ali prah. Če je objektiv umazan, dobite zamegljeno končno sliko, zato je potem vsebina dokumenta neberljiva in podatkov ni mogoče uspešno optično prebrati.",
        title_desktop: "Očistite objektiv kamere",
      },
      lighting: {
        details:
          "Izogibajte se neposredni močni svetlobi, saj se ta odbija od dokumenta in lahko dele dokumenta naredi neberljive. Če ne morete prebrati podatkov na dokumentu, jih niti kamera ne bo mogla videti.",
        details_desktop:
          "Izogibajte se neposredni močni svetlobi, saj se ta odbija od dokumenta in lahko dele dokumenta naredi neberljive. Če ne morete prebrati podatkov na dokumentu, jih niti kamera ne bo mogla videti.",
        title: "Svetloba ne sme biti premočna",
        title_desktop: "Svetloba ne sme biti premočna",
      },
      visibility: {
        details:
          "Ne prekrivajte nobenega dela strojno berljivega območja s prstom. Prav tako bodite pozorni na odseve svetlobe na strojno berljivem območju, zaradi katerih bi lahko postalo neberljivo.",
        details_desktop:
          "Ne prekrivajte nobenega dela strojno berljivega območja s prstom. Prav tako bodite pozorni na odseve svetlobe na strojno berljivem območju, zaradi katerih bi lahko postalo neberljivo.",
        title: "Strojno berljivo območje naj bo ves čas vidno.",
        title_desktop: "Strojno berljivo območje naj bo ves čas vidno.",
      },
    },
    done_btn: "Končano",
    done_btn_aria: "Nadaljuj optično branje",
    full_document: {
      blur: {
        details:
          "Potrudite se, da bosta med optičnim branjem telefon in dokument pri miru. Če se kateri od njiju premakne, se lahko slika razmaže in dokument postane neberljiv.",
        details_desktop:
          "Med skeniranjem poskusite mirovati. Premikanje lahko zamegli sliko in oteži branje podatkov na dokumentu.",
        title: "Držite pri miru med optičnim branjem",
        title_desktop: "Držite pri miru med optičnim branjem",
      },
      camera_lens: {
        details_desktop:
          "Preverite, da ni morda na objektivu kamere kakšna umazanija ali prah. Če je objektiv umazan, dobite zamegljeno končno sliko, zato je potem vsebina dokumenta neberljiva in podatkov ni mogoče uspešno optično prebrati.",
        title_desktop: "Očistite objektiv kamere",
      },
      lighting: {
        details:
          "Izogibajte se neposredni močni svetlobi, saj se ta odbija od dokumenta in lahko dele dokumenta naredi neberljive. Če ne morete prebrati podatkov na dokumentu, jih niti kamera ne bo mogla videti.",
        details_desktop:
          "Izogibajte se neposredni močni svetlobi, saj se ta odbija od dokumenta in lahko dele dokumenta naredi neberljive. Če ne morete prebrati podatkov na dokumentu, jih niti kamera ne bo mogla videti.",
        title: "Svetloba ne sme biti premočna",
        title_desktop: "Svetloba ne sme biti premočna",
      },
      visibility: {
        details:
          "Poskrbite, da s prstom ne boste prekrivali delov dokumenta, to velja tudi za spodnjo linijo. Prav tako bodite pozorni na hologramske znake, ki gredo preko polj na dokumentu.",
        details_desktop:
          "Poskrbite, da s prstom ne boste prekrivali delov dokumenta, to velja tudi za spodnjo linijo. Prav tako bodite pozorni na hologramske znake, ki gredo preko polj na dokumentu.",
        title: "Vidna morajo biti vsa polja",
        title_desktop: "Vidna morajo biti vsa polja",
      },
    },
    next_btn: "Naprej",
  },
  onboarding_modal: {
    aria: "Navodila za optično branje",
    barcode_only: {
      details:
        "Poiščite črtno kodo (niz črnih črt ali kvadratno kodo). Usmerite kamero vanjo in mirujte — skeniranje se bo začelo samodejno.",
      details_desktop:
        "Poiščite črtno kodo (niz črnih črt ali kvadratno kodo). Poskrbite, da bo objektiv kamere čist in da bo črtna koda dobro osvetljena.",
      title: "Poiščite in skenirajte črtno kodo",
      title_desktop: "Očistite objektiv kamere in poiščite črtno kodo",
    },
    btn: "Začetek skeniranja",
    document_with_barcode: {
      details:
        "Različne vrste dokumentov imajo lahko različne oblike črtnih kod, ki so lahko na različnih mestih. Poiščite črtno kodo na sprednji ali zadnji strani dokumenta.",
      details_desktop:
        "Preverite, ali je na sprednji ali zadnji strani dokumenta črtna koda. Poskrbite, da bo objektiv kamere čist in da bo dokument dobro osvetljen.",
      title: "Poiščite črtno kodo na dokumentu",
      title_desktop: "Očistite objektiv kamere in poiščite črtno kodo",
    },
    document_with_mrz: {
      details:
        "Na spodnjem delu sprednje ali zadnje strani dokumenta boste našli dolg niz znakov, razdeljen v dve ali tri vrstice ter ločen s puščicami (<< ali >>).",
      details_desktop:
        "Na sprednji in zadnji strani dokumenta preverite, ali vključuje strojno berljivo območje. Na spodnjem delu dokumenta poiščite dve ali tri vrstice znakov in simbolov (<<). Poskrbite, da bo objektiv kamere čist in da bo dokument dobro osvetljen.",
      title: "Poiščite strojno berljivo območje na dokumentu",
      title_desktop:
        "Očistite objektiv kamere in poiščite strojno berljivo območje",
    },
    full_document: {
      details:
        "Poskrbite, da bo dokument dobro osvetljen. Na zaslonu kamere morajo biti vidna vsa polja dokumenta.",
      details_desktop:
        "Poskrbite, da bo objektiv vaše kamere čist, dokument pa dobro osvetljen. Na zaslonu kamere morajo biti vidna vsa polja dokumenta.",
      title: "Vidni morajo biti vsi podatki",
      title_desktop: "Pripravite se na optično branje",
    },
  },
  sdk_aria: "Zaslon za optično branje dokumentov",
  timeout_modal: {
    details:
      "Poskrbite, da bo dokument dobro osvetljen, v celoti viden in brez odsevov.",
    details_desktop:
      "Poskrbite, da bo objektiv kamere čist ter da bo dokument v celoti viden, izostren in dobro osvetljen.",
    title: "Dokumenta ni mogoče prebrati",
  },
} as const;
