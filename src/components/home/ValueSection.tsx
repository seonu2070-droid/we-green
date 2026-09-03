export function ValueSection() {
  return (
    <section
      className="section value-section"
      id="features"
      aria-labelledby="value-title"
    >
      <div className="container">
        <div className="value-intro">
          <div className="section-heading section-heading-left">
            <p className="eyebrow">CLEARER CHOICE</p>
            <h2 id="value-title">
              필요한 정보만 모아
              <br />
              비교는 더 명확하게
            </h2>
          </div>
          <p className="value-lead">
            WE:GREEN은 단순히 업체를 나열하지 않습니다. 사용자가 문의 전 꼭
            확인해야 할 정보에 집중합니다.
          </p>
        </div>
        <div className="value-grid">
          <article className="value-card">
            <div className="line-icon" aria-hidden="true">
              01
            </div>
            <div>
              <h3>지역 기반 탐색</h3>
              <p>내가 원하는 지역에서 실제 시공이 가능한 업체부터 확인합니다.</p>
              <span className="tag">가까운 업체</span>
            </div>
          </article>
          <article className="value-card">
            <div className="line-icon" aria-hidden="true">
              02
            </div>
            <div>
              <h3>전문 분야 비교</h3>
              <p>
                정원 조성, 잔디, 식재 등 필요한 작업에 맞는 업체를 비교합니다.
              </p>
              <span className="tag">명확한 비교</span>
            </div>
          </article>
          <article className="value-card">
            <div className="line-icon" aria-hidden="true">
              03
            </div>
            <div>
              <h3>시공 사례 확인</h3>
              <p>대표 작업과 스타일을 미리 보고 내 취향에 맞는지 판단합니다.</p>
              <span className="tag">신뢰할 단서</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
