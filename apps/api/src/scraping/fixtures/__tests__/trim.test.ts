import { describe, expect, test } from "vitest";
import { trimHtml } from "../trim";

const PAGE = `<!-- top comment --><!doctype html><html><head>
<link rel="stylesheet" href="/a.css"><link rel="canonical" href="https://www.mall.hr/x">
<style>.a{color:red}</style>
<script>window.__NUXT__=(function(a){return {}}(1));</script>
<script src="/app.js"></script>
</head><body><!-- inner -->
<noscript><img src="/pixel"></noscript>
<div class="pbcr"><svg><path d="M0"/></svg><h3 class="pb-brief__title">iPhone</h3></div>
</body></html>`;

describe("trimHtml", () => {
  test("drops styles, SVGs, noscript, stylesheets, comments and scripts", () => {
    const trimmed = trimHtml(PAGE);

    for (const gone of ["<style", "<svg", "<noscript", "a.css", "<!--", "<script"]) {
      expect(trimmed).not.toContain(gone);
    }
    expect(trimmed).toContain('<h3 class="pb-brief__title">iPhone</h3>');
    expect(trimmed).toContain('rel="canonical"');
  });

  test("keeps the scripts the caller asks for", () => {
    const trimmed = trimHtml(PAGE, (text) => text.startsWith("window.__NUXT__"));

    expect(trimmed).toContain("window.__NUXT__=(function(a)");
    expect(trimmed).not.toContain("/app.js");
  });
});
