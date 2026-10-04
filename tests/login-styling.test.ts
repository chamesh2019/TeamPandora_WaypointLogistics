import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Login Styling Tokens in globals.css", () => {
  const cssPath = path.resolve(__dirname, "../app/globals.css");

  it("contains necessary Figma 1:1 auth class declarations", () => {
    const css = fs.readFileSync(cssPath, "utf-8");
    expect(css).toContain(".login-page");
    expect(css).toContain(".login-left");
    expect(css).toContain(".login-right");
    expect(css).toContain(".login-card");
    expect(css).toContain(".login-input");
    expect(css).toContain(".login-submit");
    expect(css).toContain(".btn-spinner");
    expect(css).toContain(".demo-hint");
    expect(css).toContain(".login-alert");
  });
});
