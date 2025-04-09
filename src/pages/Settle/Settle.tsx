import React, { useEffect, useState } from "react";
import styles from "./Settle.module.scss";
import dayjs from "dayjs";
import { useAuth } from "providers/authProvider";
import axios from "axios";

const years = Array.from({ length: 6 }, (_, i) => dayjs().year() - 1 + i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const currentYear = dayjs().subtract(1, "month").year(); // 전달의 연도
const currentMonth = dayjs().subtract(1, "month").month() + 1;
const Settle: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [settleData, setSettleData] = useState<Array<any>>([]);

  const getSettles = async () => {
    try {
      const response = await axios.get(
        `/traking/settle?year=${selectedYear}&month=${selectedMonth}`
      );
      console.log(response.data.body);
      setSettleData(response.data.body);
    } catch (error) {
      console.error("Failed to fetch Settle Data:", error);
    }
  };

  useEffect(() => {
    const initailizeData = async () => {
      await getSettles();
    };
    initailizeData();
  }, [selectedMonth, selectedYear]);

  // 년도 월 선택
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };
  return (
    <div>
      <div>
        <div className={styles["filter-container"]}>
          <div>
            <label>기간</label>
            <select value={selectedYear} onChange={handleYearChange}>
              {years.map((year) => (
                <option value={year} key={year}>
                  {year}년
                </option>
              ))}
            </select>
            <select value={selectedMonth} onChange={handleMonthChange}>
              {months.map((month) => (
                <option value={month} key={month}>
                  {month}월
                </option>
              ))}
            </select>
          </div>
        </div>
        {settleData?.[0] &&
          Object.entries(settleData[0]).map(([key, value]: any) => (
            <div key={key} className="my-3 px-3">
              <h5>{key.toUpperCase()}</h5>
              <table
                className={`${styles["settle-table"]} w-100 text-center mt-3`}
              >
                <thead>
                  <tr>
                    <th>년도/월</th>
                    <th colSpan={3}>구분</th>
                    <th>광고비 (VAT-)</th>
                    <th>페이백</th>
                    <th>지급수수료 (VAT-)</th>
                    <th>지급수수료 (VAT+)</th>
                  </tr>
                  <tr>
                    <th>합계</th>
                    <th>매체</th>
                    <th>광고주 명</th>
                    <th>광고주 ID</th>
                    <th>{value.advCostSum.toLocaleString()}</th>
                    <th>- %</th>
                    <th>{value.PayVatExcludeSum.toLocaleString()}</th>
                    <th>{value.payVatIncludeSum.toLocaleString()}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 하위 상세 데이터 */}
                  {value.detail.map((detail: any, detailIndex: number) => (
                    <tr key={detailIndex}>
                      <td>{dayjs(detail.monthDate).format("YY년 MM월")}</td>
                      <td>{detail.media}</td>
                      <td>{detail.clientName}</td>
                      <td>{detail.clientId}</td>
                      <td>{detail.advCost.toLocaleString()}</td>
                      <td>{detail.paybackRate}%</td>
                      <td>{detail.payVatExclude.toLocaleString()}</td>
                      <td>{detail.payVatInclude.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </div>
  );
};
export default Settle;
