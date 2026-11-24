/** The token stores match in robots.txt groups. */
export const BOT_TOKEN = "StoreSeekerBot";
const REPOSITORY_URL = "https://github.com/HrvojeZec/WebScrapingApp";

// An honest bot name with a link, so a store can see who we are and how to reach us
export function botUserAgent(version = process.env.npm_package_version ?? "0"): string {
  return `${BOT_TOKEN}/${version} (+${REPOSITORY_URL})`;
}
