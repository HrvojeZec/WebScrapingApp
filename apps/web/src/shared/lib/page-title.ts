import { APP_NAME } from "@/shared/constants/ui";

/** The document title of a page: `"<title> · StoreSeeker"`, or the app name alone. */
export function pageTitle(title?: string): string {
  return title ? `${title} · ${APP_NAME}` : APP_NAME;
}
