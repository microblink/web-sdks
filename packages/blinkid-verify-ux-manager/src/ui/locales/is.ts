/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for is.
 */
export default {
  document_filtered_modal: {
    details: "Prófið að skannað annað skjal.",
    title: "Skjal ekki samþykkt",
  },
  document_not_recognized_modal: {
    details: "Skannið framhliðina á studdu skjali.",
    title: "Skjal ekki þekkt",
  },
  feedback_messages: {
    blur_detected: "Haldið skjali og síma kyrrum",
    camera_angle_too_steep: "Haldið skjali samhliða síma",
    document_scanned_aria: "Tókst! Skjalið var skannað",
    document_too_close_to_edge: "Færið fjær",
    face_photo_not_fully_visible: "Haldið andlitsmynd fyllilega sýnilegri",
    flip_document: "Snúið skjalinu",
    flip_to_back_side: "Snúið á bakhliðina",
    front_side_scanned_aria: "Tókst! Framhlið skönnuð",
    glare_detected: "Hallið eða færið skjalið til að fjarlægja endurkast",
    keep_document_parallel: "Halldið skjalinu samhliða skjá",
    keep_document_still: "Haldið skjali og tæki kyrru",
    move_closer: "Færið nær",
    move_farther: "Færið fjær",
    move_left: "Farið á síðuna vinstra megin",
    move_right: "Farið á síðuna hægra megin",
    move_top: "Farið á síðuna sem er efst",
    occluded: "Haldið skjalinu fyllilega sýnilegu",
    scan_data_page: "Skannið gagnasíðu skjalsins",
    scan_last_page_barcode: "Skannaðu strikamerki frá síðustu síðu",
    scan_left_page: "Skannið vinstri síðuna",
    scan_right_page: "Skannið hægri síðuna",
    scan_the_back_side: "Skannið bakhlið skjalsins",
    scan_the_barcode: "Skannið strikamerkið",
    scan_the_front_side: "Skannið framhliðina á skjalinu",
    scan_top_page: "Skannið efstu síðuna",
    too_bright: "Farið á stað með minni lýsingu",
    too_dark: "Farið á bjartari stað",
    wrong_left: "Farið yfir á vinstri síðuna",
    wrong_right: "Farið yfir á hægri síðuna",
    wrong_top: "Farið á efstu síðuna",
  },
  help_button: { aria_label: "Hjálp", tooltip: "Þarftu aðstoð?" },
  help_modal: {
    aria: "Skönnunarhjálp",
    back_btn: "Til baka",
    blur: {
      details:
        "Reynið að halda símanum og skjalinu kyrrum á meðan skannað er. Að færa annað hvort getur gert myndina óskýra og gert gögnin í skjalinu ólæsileg.",
      details_desktop:
        "Reynið að halda tækinu og skjalinu kyrru meðan verið er að skanna. Ef annað hvort hreyfist getur myndin orðið óskýr og gögnin á skjalinu orðið ólæsileg.",
      title: "Verið kyrr á meðan skannað er",
    },
    camera_lens: {
      details:
        "Athugið hvort blettir eða ryk séu á myndavélalinsunni. Skítug linsa veldur því að lokamyndin verður óskýr, sem gerir skjalupplýsingarnar ólæsilegar og kemur í veg fyrir að hægt sé að skanna gögnin með góðum árangri.",
      title: "Hreinsið myndavélalinsuna",
    },
    done_btn: "Lokið",
    done_btn_aria: "Halda áfram að skanna",
    lighting: {
      details:
        "Forðist beint sterkt ljós því það endurkastast frá skjalinu og getur gert hluta skjalsins ólæsilega. Ef ekki er hægt að lesa gögnin í skjalinu mun myndavélin ekki heldur sjá þau.",
      title: "Gætið að sterku ljósi",
    },
    next_btn: "Áfram",
    visibility: {
      details:
        "Gangið úr skugga um að hlutar skjalsins séu ekki huldir með fingri, þar á meðal neðstu línurnar. Gætið einnig að endurspeglunum heilmyndar sem fara yfir reiti skjalsins.",
      title: "Haldið öllum reitum sýnilegum",
    },
  },
  onboarding_modal: {
    aria: "Skönnunarleiðbeiningar",
    btn: "Byrja að skanna",
    details:
      "Gangið úr skugga um að skjalið sé vel lýst. Allir reitir skjals ættu að vera sýnilegir á skjá myndavélarinnar.",
    details_desktop:
      "Gangið úr skugga um að myndavélarlinsan sé hrein og að skjalið sé vel lýst. Allir reitir skjals ættu að vera sýnilegir á skjá myndavélarinnar.",
    title: "Haldið öllum upplýsingunum sýnilegum",
    title_desktop: "Verið tilbúin að skanna",
  },
  sdk_aria: "Skjalaskönnunarskjár",
  timeout_modal: {
    cancel_btn: "Hætta við",
    details: "Ekki tókst að lesa skjalið. Reynið aftur.",
    retry_btn: "Reynið aftur",
    title: "Skönnun mistókst",
  },
} as const;
