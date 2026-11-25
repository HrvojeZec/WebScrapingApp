import * as cheerio from "cheerio";

/**
 * Shrinks a saved store page to what the parsers read, so fixtures stay small enough to review.
 * Scripts are dropped unless `keepScript` keeps them (Mall's image IDs live in its __NUXT__ script).
 */
export function trimHtml(html: string, keepScript: (scriptText: string) => boolean = () => false) {
  const $ = cheerio.load(html);
  $("style, svg, noscript, link[rel='stylesheet']").remove();
  $("script").each((_, element) => {
    if (!keepScript($(element).text())) $(element).remove();
  });
  $.root()
    .find("*")
    .addBack()
    .contents()
    .filter((_, node) => node.type === "comment")
    .remove();
  return $.html();
}
