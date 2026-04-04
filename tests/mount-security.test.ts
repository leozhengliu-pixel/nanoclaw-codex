import { describe, expect, it } from "vitest";

import { normalizeAllowlist } from "../src/mount-security.js";

describe("mount security", () => {
  it("accepts the legacy allowlist example format", () => {
    const allowlist = normalizeAllowlist({
      allowlist: [
        { hostPath: ".", readonly: false },
        { hostPath: "./groups", readonly: true }
      ]
    });

    expect(allowlist.allowedRoots).toEqual([
      { path: ".", allowReadWrite: true },
      { path: "./groups", allowReadWrite: false }
    ]);
    expect(allowlist.blockedPatterns).toEqual([]);
    expect(allowlist.nonMainReadOnly).toBe(true);
  });
});
