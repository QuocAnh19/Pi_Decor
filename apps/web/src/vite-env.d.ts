/// <reference types="vite/client" />
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "@vitest/expect" {
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any> {}
}
/* eslint-enable @typescript-eslint/no-explicit-any */
