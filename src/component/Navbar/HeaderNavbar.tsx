import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./HeaderNavbar.scss";
import axios from "axios";
import { useAuth } from "providers/authProvider";

function HeaderNavbar({ routes }: { routes: any[] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, username, userrole, logout } = useAuth();

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
    return "메인"; // 기본 페이지 이름
  };

  // 로그아웃 버튼 클릭 핸들러
  const handleLogout = async () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      try {
        const response = await axios.delete("/token", {
          withCredentials: true,
        });
        if (response.status === 200 || response.status === 204) {
          // 성공적으로 응답 받으면 로컬 스토리지나 쿠키 비우기
          localStorage.removeItem("token");
          logout();
          navigate("/"); // 로그인 페이지로 이동
        }
      } catch (err) {
        console.error("로그아웃 중 오류가 발생했습니다. :", err);
        alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="header">
      <div>
        <div className="header-title">{getPageName()}</div>
      </div>
      <div>
        {isLoggedIn && (
          <>
            <span>
              {username}({userrole}) 님
            </span>
            <button className="logout-button" onClick={handleLogout}>
              Log Out
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default HeaderNavbar;
