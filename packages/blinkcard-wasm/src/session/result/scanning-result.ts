/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

/** Result of scanning a card. */
export type BlinkCardScanningResult = {
  /* Payment card's issuing network. */
  issuingNetwork: string;

  /**
   * A list of payment card accounts found on the card.
   *
   * Each result in the list represents a distinct payment account, containing
   * details like the card number, CVV, and expiry date.
   */
  cardAccounts: CardAccountResult[];

  /* The IBAN (International Bank Account Number) of the card */
  iban: string | undefined;

  /* Information about the cardholder name. */
  cardholderName: string | undefined;

  /**
   * The overall liveness check result for the card.
   *
   * This result aggregates the outcomes of various liveness checks performed on
   * the card to determine its authenticity. Set to `Pass` if all individual
   * checks have passed; set to `Fail` if any individual check has failed.
   */
  overallCardLivenessResult: CheckResult;

  /* The result of scanning the first side of the card (side where the card number is located). */
  firstSideResult: SingleSideScanningResult | undefined;

  /* The result of scanning the second side of the card. */
  secondSideResult: SingleSideScanningResult | undefined;
};

/** Result of scanning a single side of a card. */
export type SingleSideScanningResult = {
  /* The cropped card image. */
  cardImage: {
    image: ImageData | undefined;
  };

  /** The result of the card liveness checks. */
  cardLivenessCheckResult: CardLivenessCheckResult;
};

/** Structure representing the result of liveness checks for a card. */
export type CardLivenessCheckResult = {
  /**
   * Result of the liveness check that detects whether card is displayed on the
   * screen.
   */
  screenCheckResult: CheckResult;

  /**
   * Result of the liveness check that detects whether the input image is a
   * photocopy of a card.
   */
  photocopyCheckResult: CheckResult;

  /**
   * Result of the liveness check that detects whether a card is being held in
   * human hands.
   */
  cardHeldInHandCheckResult: CheckResult;
};

/** Represents the account information of a single account on a card. */
export type CardAccountResult = {
  /** The card number as scanned from the card. */
  cardNumber: string;

  /**
   * Indicates whether the scanned card number is valid according to the Luhn
   * algorithm.
   */
  cardNumberValid: boolean;

  /** The payment card's number prefix. */
  cardNumberPrefix: string | undefined;

  /** The payment card's security code/value. */
  cvv: string | undefined;

  /** The payment card's expiry date. */
  expiryDate: DateResult;

  /** The card funding type (e.g., "DEBIT", "CREDIT", "CHARGE CARD"). */
  fundingType: string | undefined;

  /*
   * The category of the payment card (e.g., "PERSONAL", "BUSINESS", "PREPAID").
   * This information typically indicates the card's tier or service level.
   */
  cardCategory: string | undefined;

  /** The name of the financial institution that issued the payment card. */
  issuerName: string | undefined;

  /**
   * The ISO 3166-1 alpha-3 country code of the card issuer's country (e.g.,
   * "USA", "GBR", "HRV").
   */
  issuerCountryCode: string | undefined;

  /** The name of the card issuer's country. */
  issuerCountry: string | undefined;
};

/** Smart date result structure. */
export type DateResult = {
  /** Day in month [1-31] */
  day: number | undefined;

  /** Month in year [1-12] */
  month: number | undefined;

  /** Four digit year */
  year: number;

  /** Original date string from the document */
  originalString: string | undefined;

  /** Indicates whether this date is filled by internal domain knowledge */
  filledByDomainKnowledge: boolean | undefined;

  /** Indicates whether date was parsed successfully */
  successfullyParsed: boolean | undefined;
};

/** Represents the outcome of a single check. */
export type CheckResult = "not-available" | "pass" | "fail";
