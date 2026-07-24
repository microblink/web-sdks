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
  error_modal: { cancel_btn: "Hætta við", retry_btn: "Reynið aftur" },
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
    keep_still: "Haltu kyrru",
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
    scan_the_barcode_side: "Skannaðu strikamerkjahlið skjals",
    scan_the_front_side: "Skannið framhliðina á skjalinu",
    scan_the_mrz_side: "Skannaðu hlið véllesanlega svæði skjalsins",
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
    barcode_only: {
      blur: {
        details:
          "Reyndu að halda símanum og strikamerkinu kyrru meðan þú skannar. Ef annað hvort hreyfist getur myndin orðið óskýr og strikamerkið orðið erfitt að lesa.",
        details_desktop:
          "Reyndu að halda kyrru á meðan skannað er. Hreyfing getur gert myndina óskýra og gert strikamerkið erfitt að lesa.",
        title: "Verið kyrr á meðan skannað er",
        title_desktop: "Verið kyrr á meðan skannað er",
      },
      camera_lens: {
        details_desktop:
          "Athugaðu hvort blettir eða ryk séu á myndavélarlinsunni. Óhrein linsa veldur því að lokamyndin verður óskýr, sem gerir strikamerkið ólæsilegt og kemur í veg fyrir að hægt sé að skanna gögnin með góðum árangri.",
        title_desktop: "Hreinsið myndavélalinsuna",
      },
      lighting: {
        details:
          "Forðastu beint skarpt ljós, því það getur valdið glampa á strikamerkinu og gert það erfitt að skanna. Ef þú sérð strikamerkið ekki greinilega, gæti myndavélin einnig átt erfitt með að lesið það.",
        details_desktop:
          "Forðastu beint skarpt ljós, því það getur valdið glampa á strikamerkinu og gert það erfitt að skanna. Ef þú sérð strikamerkið ekki greinilega, gæti myndavélin einnig átt erfitt með að lesið það.",
        title: "Gætið að sterku ljósi",
        title_desktop: "Gætið að sterku ljósi",
      },
      visibility: {
        details:
          "Gakktu úr skugga um að þú hyljir ekki hluta strikamerkisins með fingri. Gáðu einnig að endurkasti ljóss sem fer yfir strikamerkið og gæti gert það ólæsilegt.",
        details_desktop:
          "Gakktu úr skugga um að þú hyljir ekki hluta strikamerkisins með fingri. Gáðu einnig að endurkasti ljóss sem fer yfir strikamerkið og gæti gert það ólæsilegt.",
        title: "Haltu strikamerkinu sýnilegu",
        title_desktop: "Haltu strikamerkinu sýnilegu",
      },
    },
    document_with_barcode: {
      blur: {
        details:
          "Reynið að halda símanum og skjalinu kyrrum á meðan skannað er. Að færa annað hvort getur gert myndina óskýra og gert gögnin í skjalinu ólæsileg.",
        details_desktop:
          "Reyndu að halda kyrru meðan verið er að skanna. Hreyfing getur gert myndina óskýra og gert gögn á skjalinu ólæsileg.",
        title: "Verið kyrr á meðan skannað er",
        title_desktop: "Verið kyrr á meðan skannað er",
      },
      camera_lens: {
        details_desktop:
          "Athugið hvort blettir eða ryk séu á myndavélalinsunni. Skítug linsa veldur því að lokamyndin verður óskýr, sem gerir skjalupplýsingarnar ólæsilegar og kemur í veg fyrir að hægt sé að skanna gögnin með góðum árangri.",
        title_desktop: "Hreinsið myndavélalinsuna",
      },
      lighting: {
        details:
          "Forðist beint sterkt ljós því það endurkastast frá skjalinu og getur gert hluta skjalsins ólæsilega. Ef ekki er hægt að lesa gögnin í skjalinu mun myndavélin ekki heldur sjá þau.",
        details_desktop:
          "Forðist beint sterkt ljós því það endurkastast frá skjalinu og getur gert hluta skjalsins ólæsilega. Ef ekki er hægt að lesa gögnin í skjalinu mun myndavélin ekki heldur sjá þau.",
        title: "Gætið að sterku ljósi",
        title_desktop: "Gætið að sterku ljósi",
      },
      visibility: {
        details:
          "Gakktu úr skugga um að þú hyljir ekki hluta strikamerkisins með fingri. Gáðu einnig að endurkasti ljóss sem fer yfir strikamerkið og gæti gert það ólæsilegt.",
        details_desktop:
          "Gakktu úr skugga um að þú hyljir ekki hluta strikamerkisins með fingri. Gáðu einnig að endurkasti ljóss sem fer yfir strikamerkið og gæti gert það ólæsilegt.",
        title: "Haltu strikamerkinu sýnilegu",
        title_desktop: "Haltu strikamerkinu sýnilegu",
      },
    },
    document_with_mrz: {
      blur: {
        details:
          "Reynið að halda símanum og skjalinu kyrrum á meðan skannað er. Að færa annað hvort getur gert myndina óskýra og gert gögnin í skjalinu ólæsileg.",
        details_desktop:
          "Reyndu að halda kyrru meðan verið er að skanna. Hreyfing getur gert myndina óskýra og gert gögn á skjalinu ólæsileg.",
        title: "Verið kyrr á meðan skannað er",
        title_desktop: "Verið kyrr á meðan skannað er",
      },
      camera_lens: {
        details_desktop:
          "Athugið hvort blettir eða ryk séu á myndavélalinsunni. Skítug linsa veldur því að lokamyndin verður óskýr, sem gerir skjalupplýsingarnar ólæsilegar og kemur í veg fyrir að hægt sé að skanna gögnin með góðum árangri.",
        title_desktop: "Hreinsið myndavélalinsuna",
      },
      lighting: {
        details:
          "Forðist beint sterkt ljós því það endurkastast frá skjalinu og getur gert hluta skjalsins ólæsilega. Ef ekki er hægt að lesa gögnin í skjalinu mun myndavélin ekki heldur sjá þau.",
        details_desktop:
          "Forðist beint sterkt ljós því það endurkastast frá skjalinu og getur gert hluta skjalsins ólæsilega. Ef ekki er hægt að lesa gögnin í skjalinu mun myndavélin ekki heldur sjá þau.",
        title: "Gætið að sterku ljósi",
        title_desktop: "Gætið að sterku ljósi",
      },
      visibility: {
        details:
          "Gakktu úr skugga um að þú hyljir ekki hluta af véllesanlega svæðinu með fingri. Passaðu þig líka á endurskinsljósi sem fellur yfir véllesanlega svæðið og gæti gert það ólæsilegt.",
        details_desktop:
          "Gakktu úr skugga um að þú hyljir ekki hluta af véllesanlega svæðinu með fingri. Passaðu þig líka á endurskinsljósi sem fellur yfir véllesanlega svæðið og gæti gert það ólæsilegt.",
        title: "Haltu véllesanlega svæðinu sýnilegu",
        title_desktop: "Haltu véllesanlega svæðinu sýnilegu",
      },
    },
    done_btn: "Lokið",
    done_btn_aria: "Halda áfram að skanna",
    full_document: {
      blur: {
        details:
          "Reynið að halda símanum og skjalinu kyrrum á meðan skannað er. Að færa annað hvort getur gert myndina óskýra og gert gögnin í skjalinu ólæsileg.",
        details_desktop:
          "Reyndu að halda kyrru meðan verið er að skanna. Hreyfing getur gert myndina óskýra og gert gögn á skjalinu ólæsileg.",
        title: "Verið kyrr á meðan skannað er",
        title_desktop: "Verið kyrr á meðan skannað er",
      },
      camera_lens: {
        details_desktop:
          "Athugið hvort blettir eða ryk séu á myndavélalinsunni. Skítug linsa veldur því að lokamyndin verður óskýr, sem gerir skjalupplýsingarnar ólæsilegar og kemur í veg fyrir að hægt sé að skanna gögnin með góðum árangri.",
        title_desktop: "Hreinsið myndavélalinsuna",
      },
      lighting: {
        details:
          "Forðist beint sterkt ljós því það endurkastast frá skjalinu og getur gert hluta skjalsins ólæsilega. Ef ekki er hægt að lesa gögnin í skjalinu mun myndavélin ekki heldur sjá þau.",
        details_desktop:
          "Forðist beint sterkt ljós því það endurkastast frá skjalinu og getur gert hluta skjalsins ólæsilega. Ef ekki er hægt að lesa gögnin í skjalinu mun myndavélin ekki heldur sjá þau.",
        title: "Gætið að sterku ljósi",
        title_desktop: "Gætið að sterku ljósi",
      },
      visibility: {
        details:
          "Gangið úr skugga um að hlutar skjalsins séu ekki huldir með fingri, þar á meðal neðstu línurnar. Gætið einnig að endurspeglunum heilmyndar sem fara yfir reiti skjalsins.",
        details_desktop:
          "Gangið úr skugga um að hlutar skjalsins séu ekki huldir með fingri, þar á meðal neðstu línurnar. Gætið einnig að endurspeglunum heilmyndar sem fara yfir reiti skjalsins.",
        title: "Haldið öllum reitum sýnilegum",
        title_desktop: "Haldið öllum reitum sýnilegum",
      },
    },
    next_btn: "Áfram",
  },
  onboarding_modal: {
    aria: "Skönnunarleiðbeiningar",
    barcode_only: {
      details:
        "Leitaðu að strikamerki (röð af svörtum línum eða ferköntuðum kóða). Beindu myndavélinni að því og haltu henni kyrrri — skönnun fer fram sjálfkrafa.",
      details_desktop:
        "Leitaðu að strikamerki (röð af svörtum línum eða ferköntuðum kóða). Gakktu úr skugga um að linsan á myndavélinni sé hrein og að strikamerkið sé vel upplýst.",
      title: "Finndu og skannaðu strikamerkið",
      title_desktop: "Hreinsaðu myndavélarlinsuna og finndu strikamerkið",
    },
    btn: "Byrja að skanna",
    document_with_barcode: {
      details:
        "Mismunandi gerðir skjala geta haft mismunandi strikamerkjasnið og staðsetningar. Leitaðu að strikamerki á fram- og bakhlið skjalsins.",
      details_desktop:
        "Athugaðu fram- og bakhlið skjalsins hvort þar sé strikamerki. Gakktu úr skugga um að linsa myndavélarinnar sé hrein og skjalið vel upplýst.",
      title: "Finndu strikamerki skjalsins",
      title_desktop: "Hreinsaðu myndavélarlinsuna og finndu strikamerkið",
    },
    document_with_mrz: {
      details:
        "Þú finnur langa röð af táknum neðst á forsíðu eða bakhlið skjalsins, skipt í 2 eða 3 línur og aðskilin með örvum (&lt;&lt; eða &gt;&gt;).",
      details_desktop:
        "Athugaðu fram- og bakhlið skjalsins hvort þar sé véllesanlegt svæði. Leitaðu að 2–3 línum af stöfum og örvatáknum (<<) neðst á skjalinu. Gakktu úr skugga um að linsa myndavélarinnar sé hrein og skjalið vel upplýst.",
      title: "Finndu véllesanlega svæði skjalsins",
      title_desktop: "Hreinsaðu linsuna og finndu véllesanlega svæðið",
    },
    full_document: {
      details:
        "Gangið úr skugga um að skjalið sé vel lýst. Allir reitir skjals ættu að vera sýnilegir á skjá myndavélarinnar.",
      details_desktop:
        "Gangið úr skugga um að myndavélarlinsan sé hrein og að skjalið sé vel lýst. Allir reitir skjals ættu að vera sýnilegir á skjá myndavélarinnar.",
      title: "Haldið öllum upplýsingunum sýnilegum",
      title_desktop: "Verið tilbúin að skanna",
    },
  },
  sdk_aria: "Skjalaskönnunarskjár",
  timeout_modal: {
    details:
      "Gakktu úr skugga um að skjalið sé vel upplýst, fulllega sýnilegt og laust við endurskin.",
    details_desktop:
      "Gakktu úr skugga um að myndavélarlinsан sé hrein og skjalið sé fullkomlega sýnilegt, í fókus og vel upplýst.",
    title: "Ekki tókst að lesa skjalið",
  },
} as const;
