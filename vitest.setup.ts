/**
 * Vitest global setup — runs once before every test file.
 *
 * Registers jest-dom matchers (`toBeInTheDocument`, `toHaveValue`, ...) so
 * component tests can use them. Importing this file is enough; it extends
 * Vitest's `expect` automatically.
 */
import "@testing-library/jest-dom/vitest";
