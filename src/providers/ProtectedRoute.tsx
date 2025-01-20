import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/authProvider"; // 인증 상태 확인

const ProtectedRoute = () => {
  const { isLoggedIn } = useAuth();

  // 사용자가 인증되지 않았다면 로그인 페이지로 리디렉션
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // 인증된 경우 자식 컴포넌트를 렌더링
  return <Outlet />;
};

export default ProtectedRoute;