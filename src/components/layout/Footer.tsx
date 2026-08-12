import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link className="brand brand-footer" to="/">
            <img
              className="footer-logo"
              src="/assets/images/we-green-logo.png"
              width={742}
              height={500}
              alt="WE:GREEN 우리 동네 조경업체 찾기"
            />
          </Link>
          <p>지역과 조건에 맞는 조경업체를 더 쉽게 비교하는 방법.</p>
        </div>
        <div className="footer-links">
          <Link to="/#problem">서비스 소개</Link>
          <Link to="/companies">업체 찾기</Link>
          <Link to="/register">업체 등록</Link>
          <Link to="/#faq">FAQ</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© 2026 WE:GREEN. All rights reserved.</p>
        <p>지역 조경업체와 고객을 연결하는 디렉토리 서비스</p>
      </div>
    </footer>
  );
}
