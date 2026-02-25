/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/**
 * Localization strings for ak.
 */
export default {
  feedback_messages: {
    blur_detected: "Ma kaade ne fon no nnyina faako",
    blur_detected_desktop: "Ma kaade no ne afiri no nna hɔ dinn",
    camera_angle_too_steep: "Ma fon no ani nkyerɛ kaade no fi soro pɛɛ",
    camera_angle_too_steep_desktop: "Ma kaade no ani nkyerɛ skriin no",
    card_number_scanned: "Ayɛ yie! Kaade nɔma fa no askaane",
    card_scanned: "Ayɛ yie! Woaskaane kaade no",
    document_too_close_to_edge: "Kɔ akyirikyiri",
    flip_card: "Dan kaade no ani",
    flip_to_back_side: "Dan kaade no ani",
    move_closer: "Bɛn ho",
    move_farther: "Kɔ akyirikyiri",
    occluded: "Ma kaade no nna adi pefee",
    scan_the_back_side: "Skaane kaade no fa foforo no",
    scan_the_front_side: "Skaane kaade nɔma no",
  },
  help_button: { aria_label: "Mmoa", tooltip: "Wohia mmoa?" },
  help_modal: {
    aria: "Skaane ho mmoa",
    back_btn: "Akyire",
    blur: {
      details:
        "Hwɛ sɛ wobɛma fon ne kaade no aka faako. Sɛ woma emu biara wosowosow a, mfonin no ani renna hɔ na wɔrenhu nsɛm a ɛwɔ kaade no so.",
      details_desktop:
        "Bɔ mmɔden sɛ wobɛma kaade no ada hɔ dinn bere a woreskane no. Woma no hinhim a, ebetumi ama yenhu mfonini no yiye ne nsɛm a ɛwɔ kaade no so.",
      title: "Gyina faako abere a woreskanee no",
    },
    camera_lens: {
      details:
        "Hwɛ sɛ nkekae anaa mfuturu nni wo lɛns no so. Lɛns a ani ayɛ fi ma mfonini no anim nna hɔ, ɛyɛ den sɛ wɔbɛkenkan kaade so nkyerɛw na ɛmma wontumi nskane nsɛm a ɛwɔ so yiye.",
      title: "Popa wo kamɛra lɛns",
    },
    card_number: {
      details:
        "Mpɛn pii no, kaade nɔma no taa yɛ digit 16, ɛwom sɛ ebetumi ayɛ efi digit 12 kosi 19 de. Etumi yɛ nea wɔaprinte agu so anaa wɔakurukyerɛw agu so ma aba soro, na ebetumi awɔ anim anaa kaade no akyi.",
      title: "Kaade nɔma no wɔ he?",
    },
    done_btn: "Awiei",
    done_btn_aria: "Toa skaane no so",
    lighting: {
      details:
        "Mma kanea nhyerɛn wɔ kaade no so tee esiane sɛ ebetumi ama yenhu nsɛm a ɛwɔ so. Sɛ wuntumi nkenkan kaade no so nsɛm a, ɛrenna adi papa wɔ kamɛra no so nso.",
      title: "Hwɛ hann a ano yɛ den kwan",
    },
    next_btn: "Nea Edi Hɔ",
    occlusion: {
      details:
        "Hwɛ sɛ wommfa wo nsateaa nkata kaade no fa biara, a ase hɔ ka ho. Bio nso, hwɛ sɛ hologram no remmɔ kanea nngu kaade no so nsɛm bi so.",
      title: "Hwɛ sɛ wobehu baabiara",
    },
  },
  onboarding_modal: {
    aria: "Skaane ho akwankyerɛ",
    btn: "Fi ase skaane",
    details:
      "Mpɛn pii no, kaade nɔma no taa yɛ digit 16, ɛwom sɛ ebetumi ayɛ efi digit 12 kosi 19 de. Etumi yɛ nea wɔaprinte agu so anaa wɔakurukyerɛw agu so ma aba soro. Hwɛ sɛ kanea a ɛfata da so na wotumi hu nsɛm a ɛwɔ so nyinaa.",
    details_desktop:
      "Kaade nɔma no taa yɛ digit 16 nɔma. Ɛsɛ sɛ ɛyɛ nea wɔaprinte agu so anaasɛ wɔakurukyerɛw wɔ kaade no so. Hwɛ sɛ wo kamɛra lɛns no anim tew, kanea a ɛfata da kaade no so, na wohu nkyerɛw a ɛwɔ so nyinaa.",
    title: "Di kan skaane kaade nɔma no",
  },
  sdk_aria: "Skriin a wɔde skaane kaade",
  timeout_modal: {
    cancel_btn: "Twam",
    details: "Sɛ wontumi nkenkan kaade no so nsɛm a, san yɛ bio.",
    retry_btn: "San yɛ bio",
    title: "Skane no ankɔ yiye",
  },
} as const;
