/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

import { describe, expect, it } from "vitest";
import {
  ChainedUiStateProps,
  getChainedUiStateKey,
} from "./getChainedUiStateKey";

/**
 * Test file role:
 * - Verifies chained UI transitions in isolation (pure function behavior).
 * - No manager, timers, or frame-processing side effects here.
 */

describe("getChainedUiStateKey", () => {
  describe("PAGE_CAPTURED -> Transition states", () => {
    it('should return FLIP_CARD when paginationType is "other"', () => {
      const props: ChainedUiStateProps = {
        previousUiStateKey: "PAGE_CAPTURED",
        paginationType: "other",
      };
      expect(getChainedUiStateKey(props)).toBe("FLIP_CARD");
    });

    it('should return FLIP_CARD when paginationType is "other" with rotation "zero"', () => {
      const props: ChainedUiStateProps = {
        previousUiStateKey: "PAGE_CAPTURED",
        paginationType: "other",
        rotation: "zero",
      };
      expect(getChainedUiStateKey(props)).toBe("FLIP_CARD");
    });

    it('should return MOVE_LAST_PAGE when paginationType is "passport-with-barcode"', () => {
      const props: ChainedUiStateProps = {
        previousUiStateKey: "PAGE_CAPTURED",
        paginationType: "passport-with-barcode",
      };
      expect(getChainedUiStateKey(props)).toBe("MOVE_LAST_PAGE");
    });

    describe("passport-no-barcode rotations", () => {
      it('should return MOVE_TOP when rotation is "zero"', () => {
        const props: ChainedUiStateProps = {
          previousUiStateKey: "PAGE_CAPTURED",
          paginationType: "passport-no-barcode",
          rotation: "zero",
        };
        expect(getChainedUiStateKey(props)).toBe("MOVE_TOP");
      });

      it('should return MOVE_TOP when rotation is "upside-down" (TODO: should be bottom)', () => {
        const props: ChainedUiStateProps = {
          previousUiStateKey: "PAGE_CAPTURED",
          paginationType: "passport-no-barcode",
          rotation: "upside-down",
        };
        // TODO: should be "MOVE_BOTTOM", but not implemented yet
        expect(getChainedUiStateKey(props)).toBe("MOVE_TOP");
      });

      it('should return MOVE_RIGHT when rotation is "clockwise-90"', () => {
        const props: ChainedUiStateProps = {
          previousUiStateKey: "PAGE_CAPTURED",
          paginationType: "passport-no-barcode",
          rotation: "clockwise-90",
        };
        expect(getChainedUiStateKey(props)).toBe("MOVE_RIGHT");
      });

      it('should return MOVE_LEFT when rotation is "counter-clockwise-90"', () => {
        const props: ChainedUiStateProps = {
          previousUiStateKey: "PAGE_CAPTURED",
          paginationType: "passport-no-barcode",
          rotation: "counter-clockwise-90",
        };
        expect(getChainedUiStateKey(props)).toBe("MOVE_LEFT");
      });
    });
  });

  describe("Transition -> Intro states", () => {
    it('should return INTRO_BACK_PAGE when transitioning from FLIP_CARD with paginationType "other"', () => {
      const props: ChainedUiStateProps = {
        previousUiStateKey: "FLIP_CARD",
        paginationType: "other",
      };
      expect(getChainedUiStateKey(props)).toBe("INTRO_BACK_PAGE");
    });

    it('should return INTRO_LAST_PAGE when transitioning from MOVE_LAST_PAGE with paginationType "passport-with-barcode"', () => {
      const props: ChainedUiStateProps = {
        previousUiStateKey: "MOVE_LAST_PAGE",
        paginationType: "passport-with-barcode",
      };
      expect(getChainedUiStateKey(props)).toBe("INTRO_LAST_PAGE");
    });

    it('should return INTRO_TOP_PAGE when transitioning from MOVE_TOP with paginationType "passport-no-barcode"', () => {
      const props: ChainedUiStateProps = {
        previousUiStateKey: "MOVE_TOP",
        paginationType: "passport-no-barcode",
      };
      expect(getChainedUiStateKey(props)).toBe("INTRO_TOP_PAGE");
    });

    it('should return INTRO_RIGHT_PAGE when transitioning from MOVE_RIGHT with paginationType "passport-no-barcode"', () => {
      const props: ChainedUiStateProps = {
        previousUiStateKey: "MOVE_RIGHT",
        paginationType: "passport-no-barcode",
      };
      expect(getChainedUiStateKey(props)).toBe("INTRO_RIGHT_PAGE");
    });

    it('should return INTRO_LEFT_PAGE when transitioning from MOVE_LEFT with paginationType "passport-no-barcode"', () => {
      const props: ChainedUiStateProps = {
        previousUiStateKey: "MOVE_LEFT",
        paginationType: "passport-no-barcode",
      };
      expect(getChainedUiStateKey(props)).toBe("INTRO_LEFT_PAGE");
    });
  });

  describe("Edge cases and fallbacks", () => {
    it("should return undefined for unmatched state combinations", () => {
      const props: ChainedUiStateProps = {
        previousUiStateKey: "INTRO_FRONT_PAGE",
        paginationType: "other",
      };
      expect(getChainedUiStateKey(props)).toBeUndefined();
    });

    it("should return undefined for DOCUMENT_CAPTURED state", () => {
      const props: ChainedUiStateProps = {
        previousUiStateKey: "DOCUMENT_CAPTURED",
        paginationType: "other",
      };
      expect(getChainedUiStateKey(props)).toBeUndefined();
    });

    it("should return undefined for error states", () => {
      const props: ChainedUiStateProps = {
        previousUiStateKey: "BLUR_DETECTED",
        paginationType: "other",
      };
      expect(getChainedUiStateKey(props)).toBeUndefined();
    });

    it("should return undefined for intro states", () => {
      const props: ChainedUiStateProps = {
        previousUiStateKey: "INTRO_BACK_PAGE",
        paginationType: "other",
      };
      expect(getChainedUiStateKey(props)).toBeUndefined();
    });
  });

  describe("Pagination type variations", () => {
    it('should not match PAGE_CAPTURED with "passport-with-barcode" to FLIP_CARD', () => {
      const props: ChainedUiStateProps = {
        previousUiStateKey: "PAGE_CAPTURED",
        paginationType: "passport-with-barcode",
      };
      expect(getChainedUiStateKey(props)).not.toBe("FLIP_CARD");
      expect(getChainedUiStateKey(props)).toBe("MOVE_LAST_PAGE");
    });

    it('should not match PAGE_CAPTURED with "passport-no-barcode" to FLIP_CARD', () => {
      const props: ChainedUiStateProps = {
        previousUiStateKey: "PAGE_CAPTURED",
        paginationType: "passport-no-barcode",
        rotation: "zero",
      };
      expect(getChainedUiStateKey(props)).not.toBe("FLIP_CARD");
      expect(getChainedUiStateKey(props)).toBe("MOVE_TOP");
    });

    it('should not match FLIP_CARD with "passport-with-barcode" to INTRO_BACK_PAGE', () => {
      const props: ChainedUiStateProps = {
        previousUiStateKey: "FLIP_CARD",
        paginationType: "passport-with-barcode",
      };
      expect(getChainedUiStateKey(props)).not.toBe("INTRO_BACK_PAGE");
      expect(getChainedUiStateKey(props)).toBeUndefined();
    });
  });

  describe("Missing rotation for passport-no-barcode", () => {
    it("should return undefined when rotation is missing for passport-no-barcode", () => {
      const props: ChainedUiStateProps = {
        previousUiStateKey: "PAGE_CAPTURED",
        paginationType: "passport-no-barcode",
        // rotation is missing
      };
      expect(getChainedUiStateKey(props)).toBeUndefined();
    });
  });
});
