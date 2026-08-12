import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  return (
    <header className="site-header" data-header>
      <div className="container header-inner">
        <Link className="brand" to="/" aria-label="WE:GREEN 홈">
          <img
            className="brand-symbol"
            src="/assets/images/we-green-symbol.png"
            width={715}
            height={731}
            alt=""
          />
          <span>WE:GREEN</span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav
          className={`primary-nav${menuOpen ? " is-open" : ""}`}
          id="primary-navigation"
          aria-label="주요 메뉴"
        >
          <div className="nav-links">
            <Link to="/#problem">서비스 소개</Link>
            <NavLink
              to="/companies"
              className={({ isActive }) => (isActive ? "is-active" : undefined)}
            >
              업체 찾기
            </NavLink>
            <Link to="/#faq">FAQ</Link>
          </div>
          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <span className="nav-user">{user?.name}님</span>
                <Button size="small" variant="secondary" onClick={logout}>
                  로그아웃
                </Button>
              </>
            ) : (
              <Button as="link" to="/login" size="small" variant="secondary">
                로그인
              </Button>
            )}
            <Button as="link" to="/register" size="small" variant="primary">
              업체 등록
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
