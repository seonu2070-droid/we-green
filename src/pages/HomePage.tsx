import { AiRecommendSection } from "../components/home/AiRecommendSection";
import { CompanyPreviewSection } from "../components/home/CompanyPreviewSection";
import { FaqSection } from "../components/home/FaqSection";
import { FinalCtaSection } from "../components/home/FinalCtaSection";
import { HeroSection } from "../components/home/HeroSection";
import { ProblemSection } from "../components/home/ProblemSection";
import { StepsSection } from "../components/home/StepsSection";
import { SupplierSection } from "../components/home/SupplierSection";
import { ValueSection } from "../components/home/ValueSection";
import { useCompanies } from "../context/CompanyContext";
import { usePageTitle } from "../hooks/usePageTitle";

export function HomePage() {
  usePageTitle("WE:GREEN | 우리 동네 조경업체 찾기");
  const { companies } = useCompanies();
  const previewCompanies = companies
    .filter((company) => !company.isUserRegistered)
    .slice(0, 3);

  return (
    <main id="main-content">
      <HeroSection />
      <AiRecommendSection />
      <ProblemSection />
      <ValueSection />
      <StepsSection />
      <CompanyPreviewSection companies={previewCompanies} />
      <SupplierSection />
      <FaqSection />
      <FinalCtaSection />
    </main>
  );
}
