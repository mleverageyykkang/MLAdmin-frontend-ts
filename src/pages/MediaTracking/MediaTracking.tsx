import React from "react";
import "./MediaTracking.module.scss";

const MediaTracking: React.FC = () => {
  return (
    <div className="container-fluid p-3">
      {/* 필터 */}
      <div className="d-flex mb-3 align-items-center">
        <label className="mr-2">이름</label>
        <select>
          <option>마케터1</option>
          <option>마케터2</option>
        </select>
        <label className="mr-2 ml-3">기간</label>
        <select className="mr-2">
          <option>2024년</option>
        </select>
        <select>
          <option>12월</option>
        </select>
      </div>

      {/* 매체 + 바이럴 테이블 */}
      <h6>매체 + 바이럴</h6>
      <table className="table">
        <thead>
          <tr>
            <th>년도/월</th>
            <th>매체</th>
            <th>광고주명</th>
            <th>광고주ID</th>
            <th>광고비 (VAT-)</th>
            <th>수수료율</th>
            <th>지급수수료(VAT-)</th>
            <th>지급수수료(VAT+)</th>
            <th>페이백(%)</th>
            <th>페이백(액)</th>
            <th>매출합계</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {Array(11)
              .fill("")
              .map((_, idx) => (
                <td key={idx}></td>
              ))}
          </tr>
        </tbody>
      </table>

      {/* 카드수수료 테이블 */}
      <h6 className="mt-4">카드수수료</h6>
      <table className="table">
        <thead>
          <tr>
            <th>년도/월</th>
            <th>매체</th>
            <th>광고주명</th>
            <th>광고주ID</th>
            <th>광고비(VAT-)</th>
            <th>수수료율</th>
            <th>지급수수료(VAT-)</th>
            <th>지급수수료(VAT+)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {Array(8)
              .fill("")
              .map((_, idx) => (
                <td key={idx}></td>
              ))}
          </tr>
        </tbody>
      </table>

      {/* 세전 & 인센티브액 테이블 */}
      <div className="d-flex mt-4">
        <div style={{ flex: 1 }}>
          <h6>세전</h6>
          <table>
            <tbody>
              {[
                "2024년 12월",
                "인센티브 요율",
                "인센티브 지급",
                "기본급",
                "합계",
              ].map((label, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      backgroundColor: "#e9e9e9",
                      fontWeight: "bold",
                    }}
                  >
                    {label}
                  </td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ flex: 1, marginLeft: "20px" }}>
          <h6>인센티브액</h6>
          <table>
            <tbody>
              {["신고액", "소득/인센 합계", "송금액"].map((label, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      backgroundColor: "#e9e9e9",
                      fontWeight: "bold",
                    }}
                  >
                    {label}
                  </td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MediaTracking;
