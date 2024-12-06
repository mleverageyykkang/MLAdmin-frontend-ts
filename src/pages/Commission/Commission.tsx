import React from "react";
function Commission() {
  return (
    <div>
      <div className="container-fluid">
        <div className="card">
          <table className="my-2 table text-nowrap text-center">
            <thead>
              <tr>
                <th>매체</th>
                <th>상위'공식'대행사 & 랩사</th>
                <th>상위 대행사</th>
                <th>수수료 요율</th>
                <th>카드 수수료</th>
                <th>진행방식</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>네이버</td>
                <td>(주)이인벤션</td>
                <td>드림인사이트</td>
                <td>14.8 %</td>
                <td>1.70 %</td>
                <td>광고비 충전</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default Commission;
