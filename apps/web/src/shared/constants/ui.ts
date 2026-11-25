/** Layering and timing of app-wide UI pieces. */
export const UI = {
  /** Above Mantine's header (100) and modals (200) */
  notificationsZIndex: 1000,
  notificationAutoCloseMs: 4000,
} as const;

/** The product name, in the header, the footer and every document title. */
export const APP_NAME = "StoreSeeker";
