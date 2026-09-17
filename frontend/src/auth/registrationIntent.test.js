import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import {
  clearRegistrationIntent,
  normalizeRegistrationIntent,
  readRegistrationIntent,
  storeRegistrationIntent,
} from "./registrationIntent";

const storageKey = "kudu.registration-intent";

describe("Registration-intent storage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  test.each(["seeker", "provider"])(
    "preserves the supported %s hint",
    (value) => {
      expect(normalizeRegistrationIntent(value)).toBe(value);
    }
  );

  test.each([
    undefined,
    null,
    "",
    "admin",
    "property_provider",
    " provider ",
    "https://attacker.example",
  ])("defaults unsupported hint %s to seeker", (value) => {
    expect(normalizeRegistrationIntent(value)).toBe("seeker");
  });

  test.each(["seeker", "provider"])(
    "stores only the %s hint under the expected key",
    (value) => {
      const write = vi.spyOn(Storage.prototype, "setItem");

      expect(storeRegistrationIntent(value)).toBe(value);
      expect(write).toHaveBeenCalledTimes(1);
      expect(write).toHaveBeenCalledWith(storageKey, value);
      expect(window.sessionStorage.getItem(storageKey)).toBe(value);
    }
  );

  test("defaults a missing saved hint to seeker", () => {
    expect(readRegistrationIntent()).toBe("seeker");
  });

  test.each(["seeker", "provider"])(
    "reads the saved %s hint",
    (value) => {
      window.sessionStorage.setItem(storageKey, value);

      expect(readRegistrationIntent()).toBe(value);
    }
  );

  test.each(["admin", "https://attacker.example"])(
    "defaults an unsupported saved hint %s to seeker",
    (value) => {
      window.sessionStorage.setItem(storageKey, value);

      expect(readRegistrationIntent()).toBe("seeker");
    }
  );

  test("clears only the registration hint and preserves unrelated data", () => {
    window.sessionStorage.setItem(storageKey, "provider");
    window.sessionStorage.setItem("unrelated-test-key", "keep-me");

    clearRegistrationIntent();

    expect(window.sessionStorage.getItem(storageKey)).toBeNull();
    expect(
      window.sessionStorage.getItem("unrelated-test-key")
    ).toBe("keep-me");
  });

  test("keeps write failures detectable by the sign-in handler", () => {
    const storageError = new Error("Mock storage write failure");

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw storageError;
    });

    expect(() => storeRegistrationIntent("provider")).toThrow(storageError);
  });

  test("keeps read failures detectable by the callback", () => {
    const storageError = new Error("Mock storage read failure");

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw storageError;
    });

    expect(readRegistrationIntent).toThrow(storageError);
  });

  test("cleanup does not throw when removing the hint fails", () => {
    window.sessionStorage.setItem(storageKey, "provider");

    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("Mock storage removal failure");
    });

    expect(clearRegistrationIntent).not.toThrow();
    expect(window.sessionStorage.getItem(storageKey)).toBe("provider");
  });

  test("handles an inaccessible sessionStorage property safely", () => {
    const storageError = new Error("Mock inaccessible storage");

    vi.spyOn(window, "sessionStorage", "get").mockImplementation(() => {
      throw storageError;
    });

    expect(() => storeRegistrationIntent("provider")).toThrow(storageError);
    expect(readRegistrationIntent).toThrow(storageError);
    expect(clearRegistrationIntent).not.toThrow();
  });
});