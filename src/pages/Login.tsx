import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // React Router v6 사용
import logo from "../assets/img/ml_logo.png";
import axios from "axios";

const API_URL = "http://localhost:20220";

function LoginPage() {
  const [uid, setUid] = useState(""); // uid의 타입은 TypeScript가 추론
  const [password, setPassword] = useState(""); // password의 타입도 추론
  const [error, setError] = useState<string | null>(null); // error는 string 또는 null

  const navigate = useNavigate(); // React Router v6의 useNavigate 사용

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/token`, { uid, password });
      console.log(response.data);
      // localStorage.setItem("token", response.data.token);
      navigate("/dashboard"); // 로그인 성공 시 대시보드로 이동
    } catch (err) {
      console.log(uid, password);
      setError("로그인 실패. 다시 시도해주세요."); // 에러 메시지 설정
      alert(error);
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
          <button
            type="button"
            className="w-75 bg-white py-2 rounded border border-primary"
            onClick={() => navigate("/signup")} // 회원가입 버튼 클릭 시 이동
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
