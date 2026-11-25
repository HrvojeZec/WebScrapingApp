import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { DealsRow } from "@/widgets/deals-row/ui/DealsRow/DealsRow";
import { HowItWorks } from "./ui/HowItWorks/HowItWorks";
import { Hero } from "./ui/Hero/Hero";

export function HomeView() {
  useDocumentTitle();

  return (
    <>
      <Hero />
      <DealsRow />
      <HowItWorks />
    </>
  );
}
