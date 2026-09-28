/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

import { LicenseError } from "@microblink/biometrics-common";
import { expect, it } from "vitest";

import { createBiometricsCapture } from "./capture";

it("requires a license", async () => {
  await expect(createBiometricsCapture({ licenseKey: "" })).rejects.toBeInstanceOf(LicenseError);
});
