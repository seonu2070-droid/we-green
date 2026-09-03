import { Button } from "../ui/Button";

export function SupplierSection() {
  return (
    <section
      className="section supplier-section"
      id="suppliers"
      aria-labelledby="supplier-title"
    >
      <div className="container supplier-panel">
        <div className="supplier-copy">
          <p className="eyebrow eyebrow-light">FOR LANDSCAPERS</p>
          <h2 id="supplier-title">좋은 작업을 더 많은 지역 고객에게</h2>
          <p>
            WE:GREEN은 지역 조경업체가 전문 분야와 대표 사례를 부담 없이
            알리고 새로운 고객과 연결될 수 있는 공간을 준비하고 있습니다.
          </p>
          <Button as="link" to="/register" variant="light">
            무료 업체 등록하기
          </Button>
        </div>
        <ul className="supplier-benefits">
          <li>
            <span>01</span> 별도 광고비 없이 업체 정보 소개
          </li>
          <li>
            <span>02</span> 서비스 가능 지역과 전문 분야 안내
          </li>
          <li>
            <span>03</span> 시공 사례를 찾는 잠재 고객과 연결
          </li>
        </ul>
      </div>
    </section>
  );
}
