import type { JobStatus } from "@storeseeker/shared";
import type { PluralForms } from "@/shared/lib/plural";

export const JOB_FORMS: PluralForms = { one: "posao", few: "posla", other: "poslova" };

export const REFRESH_TEXT = {
  button: "Osvježi cijene",
  workerOffline:
    "Osvježavanje je u redu čekanja i krenut će kad se radnik pokrene. Prikazujem spremljene cijene.",
  next: "Osvježavanje kreće za koji trenutak.",
  rateLimited: "Previše osvježavanja.",
  retryAt: "Pokušaj ponovo nakon",
  retryLater: "Pokušaj ponovo kasnije.",
} as const;

/** What a job that is no longer queued says about itself. */
export const JOB_STATUS_TEXT: Record<Exclude<JobStatus, "queued">, string> = {
  running: "Osvježavam cijene. Dok ne završi, prikazujem spremljene.",
  succeeded: "Cijene su osvježene.",
  partial: "Dio trgovina nije osvježen. Za njih prikazujem spremljene cijene.",
  failed: "Osvježavanje nije uspjelo. Prikazujem spremljene cijene.",
};
