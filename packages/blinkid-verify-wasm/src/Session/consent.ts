/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

/** Optional customer identifiers attached to a consent record. */
export type ConsentCustomerContext = {
  customerId?: string;
  transactionId?: string;
};

/** Consent supplied when generating a BlinkID Verify Cloud API payload. */
export type Consent = {
  durationDays: number;
  userId: string;
  note?: string;
  givenOn?: string;
  customerContext?: ConsentCustomerContext;
};
