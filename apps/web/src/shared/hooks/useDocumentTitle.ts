import { useEffect } from "react";
import { pageTitle } from "@/shared/lib/page-title";

/** Sets the browser tab title of the page; see `pageTitle`. */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = pageTitle(title);
  }, [title]);
}
