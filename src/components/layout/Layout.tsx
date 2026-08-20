import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

function scrollToHash(hash: string): void {
  const id = hash.replace(/^#/, "");
  if (!id) {
    window.scrollTo(0, 0);
    return;
  }

  const tryScroll = () => {
    const target = document.getElementById(id);
    if (!target) return false;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  };

  if (tryScroll()) return;

  // 다른 라우트에서 홈 앵커로 올 때 DOM 마운트 대기
  requestAnimationFrame(() => {
    if (tryScroll()) return;
    window.setTimeout(() => {
      if (!tryScroll()) window.scrollTo(0, 0);
    }, 50);
  });
}

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      scrollToHash(location.hash);
      return;
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash, location.key]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        본문으로 바로가기
      </a>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
