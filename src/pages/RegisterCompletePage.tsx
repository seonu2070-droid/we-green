import { Link, useParams } from "react-router-dom";
import { useCompanies } from "../context/CompanyContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHero } from "../components/layout/PageHero";
import { LoadingState } from "../components/ui/LoadingState";

export function RegisterCompletePage() {
  const { id = "" } = useParams();
  const { getCompanyById, isLoading } = useCompanies();
  const company = getCompanyById(id);

  usePageTitle(
    company
      ? `등록 완료 · ${company.name} | WE:GREEN`
      : "등록 완료 | WE:GREEN",
  );

  if (isLoading) {
    return (
      <main id="main-content">
        <section className="section">
          <div className="container">
            <LoadingState label="등록 결과를 확인하는 중..." />
          </div>
        </section>
      </main>
    );
  }

  if (!company) {
    return (
      <main id="main-content">
        <section className="section">
          <div className="container stack-gap">
            <EmptyState
              title="등록 결과를 찾을 수 없습니다."
              description="업체 목록에서 등록 여부를 확인해 주세요."
            />
            <Button as="link" to="/companies">
              업체 목록 보기
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="main-content">
      <PageHero
        eyebrow="REGISTRATION COMPLETE"
        title="업체 등록이 완료되었습니다"
        description={
          <>
            <strong>{company.name}</strong> 정보가 서버에 저장되었습니다. 목록과
            상세 페이지에서 바로 확인할 수 있습니다.
          </>
        }
      >
        <div className="final-actions page-hero-actions">
          <Button as="link" to={`/companies/${company.id}`}>
            내 업체 상세 보기
          </Button>
          <Button as="link" to="/companies" variant="secondary">
            업체 목록으로
          </Button>
        </div>
        <p className="form-footer-note">
          홈으로 돌아가려면 <Link to="/">여기</Link>를 눌러 주세요.
        </p>
      </PageHero>
    </main>
  );
}
