import { Button } from "../ui/Button";

export function FinalCtaSection() {
  return (
    <section
      className="section final-cta-section"
      aria-labelledby="final-cta-title"
    >
      <div className="container final-cta">
        <p className="eyebrow">A BETTER WAY TO CHOOSE</p>
        <h2 id="final-cta-title">
          좋은 정원의 시작,
          <br />
          더 명확한 비교에서
        </h2>
        <p>
          우리 지역에서 활동하는 조경업체의 전문 분야와 시공 사례를 확인해
          보세요.
        </p>
        <div className="final-actions">
          <Button as="link" to="/companies">
            업체 찾기
          </Button>
          <Button as="link" to="/register" variant="secondary">
            업체 등록
          </Button>
        </div>
      </div>
    </section>
  );
}
