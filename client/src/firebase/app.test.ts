import { beforeEach, afterEach, describe, expect, test, vi } from "vitest";
import { deleteApp, getApps } from "firebase/app";

const envKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
  "VITE_FIREBASE_DATABASE_URL",
  "VITE_FIREBASE_FUNCTIONS_REGION",
  "VITE_USE_FIREBASE_EMULATORS",
] as const;

async function resetFirebase() {
  const apps = getApps();
  await Promise.all(apps.map((app) => deleteApp(app)));
}

function clearFirebaseEnv() {
  envKeys.forEach((key) => {
    delete process.env[key];
  });
}

function applyEnv(values: Partial<Record<(typeof envKeys)[number], string>>) {
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
}

describe("firebase config", () => {
  beforeEach(async () => {
    vi.resetModules();
    clearFirebaseEnv();
    await resetFirebase();
  });

  afterEach(async () => {
    clearFirebaseEnv();
    await resetFirebase();
  });

  test("uses provided env values when available", async () => {
    applyEnv({
      VITE_FIREBASE_API_KEY: "test-api-key",
      VITE_FIREBASE_AUTH_DOMAIN: "test-app.firebaseapp.com",
      VITE_FIREBASE_PROJECT_ID: "test-project",
      VITE_FIREBASE_STORAGE_BUCKET: "test-app.appspot.com",
      VITE_FIREBASE_MESSAGING_SENDER_ID: "123456789",
      VITE_FIREBASE_APP_ID: "1:123456789:web:abcdef",
      VITE_FIREBASE_DATABASE_URL: "https://test-project.firebaseio.com",
      VITE_FIREBASE_FUNCTIONS_REGION: "us-central1",
      VITE_USE_FIREBASE_EMULATORS: "false",
    });

    const { database, isPreviewMode } = await import("./app");

    expect(isPreviewMode).toBe(false);
    expect(database.app.options.projectId).toBe("test-project");
    expect(database.app.options.databaseURL).toBe(
      "https://test-project.firebaseio.com",
    );
  });

  test("falls back to preview mode when env is missing", async () => {
    const { database, isPreviewMode } = await import("./app");

    expect(isPreviewMode).toBe(true);
    expect(database.app.options.databaseURL).toBe(
      "https://demo-project.firebaseio.com",
    );
  });
});
