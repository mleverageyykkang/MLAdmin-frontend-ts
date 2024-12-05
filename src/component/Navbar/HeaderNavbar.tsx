import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./HeaderNavbar.css";
import logo from "../../assets/img/ml_logo.png";

function HeaderNavbar({ routes }: { routes: any[] }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로에 따른 페이지 이름을 가져오기
  const getPageName = () => {
    for (const route of routes) {
      if (route.items) {
        const subRoute = route.items.find(
          (item: any) => `${item.layout}${item.path}` === location.pathname
        );
        if (subRoute) return subRoute.name;
      }
      if (`${route.layout || ""}${route.path}` === location.pathname) {
        return route.name;
      }
    }
    return "Dashboard"; // 기본 페이지 이름
  };

  // 로그아웃 버튼 클릭 핸들러
  const handleLogout = () => {
    navigate("/"); // 로그인 페이지로 이동
  };

  return (
    <div className="header">
      <div>
        <div className="header-title">{getPageName()}</div>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
}

export default HeaderNavbar;
