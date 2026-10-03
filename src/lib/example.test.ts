/**
 * ============================================================================
 * PLACEHOLDER TEST — SAFE TO DELETE
 * ============================================================================
 *
 * This file exists only to prove the Vitest setup works out of the box
 * (`npm test` should pass with a single green suite). It is NOT part of the
 * application and NOT required by anything.
 *
 * Delete it as soon as you add your first real test. Nothing imports it, no
 * config points at it, and the suite stays green without it.
 *
 * How to write a real test:
 *   - Put the file next to the code it covers: `src/lib/foo.test.ts`
 *   - Default environment is `node` (fast). For component/DOM tests, add this
 *     pragma as the very first line of the file:
 *
 *       // @vitest-environment jsdom
 *
 *   - The `@/*` alias resolves inside tests, same as in app code.
 *   - jest-dom matchers (`toBeInTheDocument`, ...) are registered globally
 *     via vitest.setup.ts.
 * ============================================================================
 */

import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("placeholder (safe to delete)", () => {
  it("resolves the @/ alias and runs a trivial assertion", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
