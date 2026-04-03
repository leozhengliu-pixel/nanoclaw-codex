import fs from "node:fs";
import path from "node:path";

import type { AdditionalMount } from "../types/host.js";

export interface MountAllowlistRule {
  hostPath: string;
  readonly?: boolean;
}

export class MountSecurity {
  private readonly rules: MountAllowlistRule[];

  public constructor(allowlistPath: string) {
    if (!fs.existsSync(allowlistPath)) {
      this.rules = [];
      return;
    }

    const contents = fs.readFileSync(allowlistPath, "utf8");
    const parsed = JSON.parse(contents) as { allowlist?: MountAllowlistRule[] };
    this.rules = parsed.allowlist ?? [];
  }

  public validateMounts(mounts: AdditionalMount[]): void {
    for (const mount of mounts) {
      const normalized = path.resolve(mount.hostPath);
      const matched = this.rules.find((rule) => normalized.startsWith(path.resolve(rule.hostPath)));
      if (!matched) {
        throw new Error(`Mount path is not allowlisted: ${mount.hostPath}`);
      }

      if (matched.readonly === true && !mount.readonly) {
        throw new Error(`Mount must be readonly: ${mount.hostPath}`);
      }
    }
  }
}
