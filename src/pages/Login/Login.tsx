import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom"; // React Router v6 사용
import logo from "../../assets/img/ml_logo.png";
import axios from "axios";
import { useAuth } from "../../providers/authProvider";

const API_URL = "http://localhost:20220";

function LoginPage() {
  const [uid, setUid] = useState(""); // uid의 타입은 TypeScript가 추론
  const [password, setPassword] = useState(""); // password의 타입도 추론
  const [error, setError] = useState<string | null>(null); // error는 string 또는 null
  const { login } = useAuth();

  const navigate = useNavigate(); // React Router v6의 useNavigate 사용

  //로그인 요청
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post("/token", { uid, password });
      console.log(response);
      if (response.status === 200) {
        const data = await response;
        login(data.data.token);
        navigate("/dashboard"); // 로그인 성공 시 대시보드로 이동
      }
    } catch (err: any) {
      if (err.response) {
        alert(err.response.data.message || "로그인에 실패했습니다.");
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div>
        <img src={logo} alt="Logo" className="mb-5 w-75" />
        <form onSubmit={handleLogin}>
          <div>
            <input
              placeholder="아이디"
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              required
              className="w-75 mb-3 py-2"
            />
          </div>
          <div>
            <input
              placeholder="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-75 mb-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-75 bg-primary text-white mb-3 py-2 rounded border border-primary"
          >
            로그인
          </button>
          <div
            className="d-flex justify-content-center mb-3"
            style={{ gap: "25px" }}
          >
            <NavLink to="/signup" className="text-secondary">
              회원가입
            </NavLink>
            <span className="text-secondary">|</span>
            <NavLink to="/reset-id" className="text-secondary">
              아이디 재설정
            </NavLink>
            <span className="text-secondary">|</span>
            <NavLink to="/reset-password" className="text-secondary">
              비밀번호 재설정
            </NavLink>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
