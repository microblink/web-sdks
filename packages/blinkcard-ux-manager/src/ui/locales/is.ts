/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for is.
 */
export default {
  feedback_messages: {
    blur_detected: "Haldið korti og síma kyrru",
    blur_detected_desktop: "Haldið korti og tæki kyrru",
    camera_angle_too_steep: "Haldið korti samhliða við síma",
    camera_angle_too_steep_desktop: "Haltu kortinu samhliða skjá",
    card_number_scanned: "Tókst! Kortnúmerhlið skönnuð",
    card_scanned: "Tókst! Kort skannað",
    document_too_close_to_edge: "Færið fjær",
    flip_card: "Snúið kortinu við",
    flip_to_back_side: "Snúið kortinu við",
    move_closer: "Færið nær",
    move_farther: "Færið fjær",
    occluded: "Haldið kortinu fyllilega sýnilegu",
    scan_the_back_side: "Skannið aðra hlið kortsins",
    scan_the_front_side: "Skannið kortanúmerið",
  },
  help_button: { aria_label: "Hjálp", tooltip: "Þarftu aðstoð?" },
  help_modal: {
    back_btn: "Til baka",
    blur: {
      details:
        "Reynið að halda símanum og kortinu kyrru meðan verið er að skanna. Ef annað hvort hreyfist getur myndin orðið óskýr og gögnin á kortinu orðið ólæsileg.",
      details_desktop:
        "Reynið að halda tækinu og kortinu kyrru meðan verið er að skanna. Ef annað hvort hreyfist getur myndin orðið óskýr og gögnin á kortinu orðið ólæsileg.",
      title: "Verið kyrr á meðan skannað er",
    },
    camera_lens: {
      details:
        "Athugið hvort blettir eða ryk séu á myndavélalinsunni. Skítug linsa veldur því að lokaímyndin verður óskýr, sem gerir kortaupplýsingar ólæsilegar og kemur í veg fyrir að hægt sé að skanna gögnin með góðum árangri.",
      title: "Hreinsið myndavélalinsuna",
    },
    card_number: {
      details:
        "Kortanúmer er venjulega 16 stafa númer, þó það geti verið á bilinu 12 til 19 stafir. Það ætti að vera annaðhvort prentað eða upphleypt með upphleyptum tölum á kortinu. Það getur verið á framhlið eða bakhlið kortsins þíns.",
      title: "Hvar er kortanúmerið?",
    },
    done_btn: "Lokið",
    lighting: {
      details:
        "Forðist beint, skarpt ljós því það endurkastast frá kortinu og getur gert hluta kortsins ólæsilegan. Ef þú getur ekki lesið gögn á kortinu, þá verða þau heldur ekki sýnileg myndavélinni.",
      title: "Gætið að sterku ljósi",
    },
    next_btn: "Áfram",
    occlusion: {
      details:
        "Gangið úr skugga um að þú sért ekki að hylja hluta spjaldsins með fingri, þar með talið neðri línurnar. Verið líka á varðbergi gagnvart endurkasti frá heilmynd sem fer yfir reiti kortanna.",
      title: "Haldið öllum reitum sýnilegum",
    },
  },
  onboarding_modal: {
    btn: "Byrja að skanna",
    details:
      "Kortanúmer er venjulega 16 stafa tala. Það ætti annaðhvort að vera prentað eða upphleypt í upphækkuðum tölum þvert yfir kortið. Gangið úr skugga um að kortið sé vel upplýst og að allar upplýsingar séu sýnilegar.",
    details_desktop:
      "Kortanúmer er venjulega 16 stafa tala. Það ætti annaðhvort að vera prentað eða upphleypt í upphækkuðum tölum þvert yfir kortið. Gangið úr skugga um að myndavélalinsan sé hrein, kortið sé vel upplýst og að allar upplýsingar séu sýnilegar.",
    title: "Skannið kortanúmerið fyrst",
  },
  timeout_modal: {
    cancel_btn: "Hætta við",
    details: "Ekki tókst að lesa kortið. Reynið aftur.",
    retry_btn: "Reynið aftur",
    title: "Skönnun mistókst",
  },
} as const;
