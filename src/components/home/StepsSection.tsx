export function StepsSection() {
  return (
    <section
      className="section steps-section"
      id="how-it-works"
      aria-labelledby="steps-title"
    >
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">HOW IT WORKS</p>
          <h2 id="steps-title">복잡했던 탐색을 세 단계로</h2>
          <p>WE:GREEN이 준비하는 이용 경험을 미리 살펴보세요.</p>
        </div>
        <ol className="steps-list">
          <li className="step-item">
            <span className="step-number">1</span>
            <div>
              <h3>지역과 시공 유형 선택</h3>
              <p>우리 집 위치와 필요한 작업을 간단히 선택합니다.</p>
            </div>
          </li>
          <li className="step-item">
            <span className="step-number">2</span>
            <div>
              <h3>업체와 사례 비교</h3>
              <p>가능 지역, 전문 분야, 대표 사례를 같은 기준으로 살펴봅니다.</p>
            </div>
          </li>
          <li className="step-item">
            <span className="step-number">3</span>
            <div>
              <h3>적합한 업체에 문의</h3>
              <p>상담 방식과 준비 정보를 확인한 뒤 부담 없이 연락합니다.</p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
