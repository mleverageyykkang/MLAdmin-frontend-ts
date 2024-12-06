import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

// 인증 컨텍스트의 인터페이스 정의
interface AuthContextProps {
  isLoggedIn: boolean; // 로그인 상태
  login: (token: string) => void; // 로그인 함수
  logout: () => void; // 로그아웃 함수
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextProps | null>(null);

// AuthProvider 컴포넌트 정의
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리
  const navigate = useNavigate(); // 페이지 이동을 위한 React Router 사용

  // 컴포넌트가 마운트될 때 쿠키를 확인하여 로그인 상태 설정
  useEffect(() => {
    const token = Cookies.get("authToken"); // 쿠키에서 토큰 가져오기
    if (token) {
      setIsLoggedIn(true); // 토큰이 있으면 로그인 상태로 설정
    } else {
      setIsLoggedIn(false); // 없으면 로그아웃 상태
    }
  }, []);

  // 로그인 함수 정의
  const login = (token: string) => {
    Cookies.set("authToken", token, { expires: 1 }); // 쿠키에 토큰 저장 (유효기간: 1일)
    setIsLoggedIn(true); // 로그인 상태로 전환
  };

  // 로그아웃 함수 정의
  const logout = () => {
    Cookies.remove("authToken"); // 쿠키에서 토큰 제거
    setIsLoggedIn(false); // 로그아웃 상태로 전환
    navigate("/login"); // 로그아웃 후 로그인 페이지로 이동
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// AuthContext를 사용하는 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
