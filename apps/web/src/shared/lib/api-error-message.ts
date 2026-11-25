import { ApiError } from "@/shared/api/base-api";

export const SERVER_DOWN_MESSAGE =
  "Poslužitelj trenutno ne odgovara. Provjeri je li API pokrenut i pokušaj ponovo.";

const GENERAL_MESSAGE = "Dogodila se neočekivana greška. Pokušaj ponovo za koji trenutak.";

/** The sentence the UI shows for a failed request; internal error texts never reach the user. */
export function apiErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return GENERAL_MESSAGE;
  if (error.code === "network" || error.code === "unavailable") return SERVER_DOWN_MESSAGE;
  return error.message;
}
