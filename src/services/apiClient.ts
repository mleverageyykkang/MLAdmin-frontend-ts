import axios from "axios";

const API_URL = "http://localhost:20220";

// API 요청 예제
export async function fetchProtectedData() {
  const token = localStorage.getItem("token"); // localStorage에서 토큰 가져오기

  try {
    const response = await axios.get(`${API_URL}/protected`, {
      headers: {
        Authorization: `Bearer ${token}`, // Authorization 헤더에 토큰 포함
      },
    });
    console.log("Protected Data:", response.data);
    return response.data;
  } catch (err) {
    console.error("Failed to fetch protected data:", err);
    throw err;
  }
}
fetchProtectedData();
