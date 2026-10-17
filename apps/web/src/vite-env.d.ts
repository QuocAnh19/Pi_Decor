/// <reference types="vite/client" />
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_BUSINESS_NAME?: string;
  readonly VITE_BUSINESS_TELEPHONE?: string;
  readonly VITE_BUSINESS_EMAIL?: string;
  readonly VITE_BUSINESS_STREET_ADDRESS?: string;
  readonly VITE_BUSINESS_LOCALITY?: string;
  readonly VITE_BUSINESS_REGION?: string;
  readonly VITE_BUSINESS_POSTAL_CODE?: string;
  readonly VITE_BUSINESS_COUNTRY?: string;
  readonly VITE_BUSINESS_LATITUDE?: string;
  readonly VITE_BUSINESS_LONGITUDE?: string;
  readonly VITE_BUSINESS_OPENING_HOURS?: string;
  readonly VITE_BUSINESS_DATA_PROTECTION_EMAIL?: string;
  readonly VITE_RETENTION_DAYS?: string;
  readonly VITE_PRIVACY_POLICY_REVIEWED?: string;
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
