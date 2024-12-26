import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import ITracking from "../../common/models/traking/ITraking";

const years = Array.from({ length: 6 }, (_, i) => dayjs().year() + i); // 연도 범위 생성 (현재 연도 +/- 5)
const months = Array.from({ length: 12 }, (_, i) => i + 1); // 월 범위 생성
const currentYear = dayjs().year();
const currentMonth = dayjs().month() + 1;

const MediaTracking: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [excelData, setExcelData] = useState<string[][] | null>(null);
  const selectedMediaFiles = useRef<HTMLInputElement>(null);
  const selectedCardFiles = useRef<HTMLInputElement>(null);
  const [trackingData, setTrackingData] = useState<ITracking[]>([]);

  useEffect(() => {
    const getMedias = async () => {
      try {
        const response = await axios.get(
          `/tracking?year=${selectedYear}&month=${selectedMonth}`
        );
        console.log(response.data.body);
      } catch (error) {
        console.error("Failed to fetch Data:", error);
      }
    };
    getMedias();
  }, []);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };
  const handleMediaFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0]; // 첫 번째 시트만 읽음
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // 2차원 배열 형식으로 변환
          setExcelData(jsonData as string[][]);
        }
      };
      console.log(excelData);

      reader.onerror = () => {
        console.error("파일을 읽는 중 오류가 발생했습니다.");
      };

      reader.readAsBinaryString(file); // 바이너리로 파일 읽기
    }
  };

  const handleCardFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0]; // 첫 번째 시트만 읽음
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // 2차원 배열 형식으로 변환
          setExcelData(jsonData as string[][]);
        }
      };
      console.log(excelData);

      reader.onerror = () => {
        console.error("파일을 읽는 중 오류가 발생했습니다.");
      };

      reader.readAsBinaryString(file); // 바이너리로 파일 읽기
    }
  };

  return (
    <div className="container-fluid p-3">
      {/* 필터 */}
      <div className="mb-3">
        <label className="mr-2">기간</label>
        <select
          className="mr-2"
          value={selectedYear}
          onChange={handleYearChange}
        >
          {years.map((year) => (
            <option value={year} key={year}>
              {year}년
            </option>
          ))}
        </select>
        <select
          className="mr-2"
          value={selectedMonth}
          onChange={handleMonthChange}
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {month}월
            </option>
          ))}
        </select>
        <label className="mr-2">이름</label>
        <select>
          <option>마케터1</option>
          <option>마케터2</option>
        </select>
      </div>

      {/* 매체 + 바이럴 테이블 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>매체 + 바이럴</h5>
        <input
          type="file"
          accept=".xlsx, .xls"
          ref={selectedMediaFiles}
          className="d-none"
          multiple={true}
          onChange={handleMediaFileUpload}
        />
        <button
          className="btn btn-primary"
          onClick={() => {
            selectedMediaFiles.current?.click();
          }}
        >
          파일 등록
        </button>
      </div>
      <table className="table">
        <thead>
          <tr className="text-center">
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
          <tr className="text-center">
            {Array(11)
              .fill("")
              .map((_, idx) => (
                <td key={idx}>값 {idx + 1}</td>
              ))}
          </tr>
        </tbody>
      </table>

      {/* 카드수수료 테이블 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>카드수수료</h5>
        <input
          type="file"
          accept=".xlsx, .xls"
          ref={selectedCardFiles}
          className="d-none"
          multiple={true}
          onChange={handleCardFileUpload}
        />
        <button
          className="btn btn-primary"
          onClick={() => {
            selectedCardFiles.current?.click();
          }}
        >
          파일 등록
        </button>
      </div>
      <table className="table">
        <thead>
          <tr className="text-center">
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
          <tr className="text-center">
            {Array(8)
              .fill("")
              .map((_, idx) => (
                <td key={idx}>값 {idx + 1}</td>
              ))}
          </tr>
        </tbody>
      </table>

      {/* 세전 & 인센티브액 테이블 */}
      <div className="d-flex mt-4">
        <div className="col-3">
          <h5 className="mb-3">세전</h5>
          <table className="table table-bordered">
            <tbody>
              {[
                `${selectedYear}년 ${selectedMonth}월`,
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
                      width: "50%",
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

        <div className="col-3">
          <h5 className="mb-3">인센티브액</h5>
          <table className="table table-bordered">
            <tbody>
              {["신고액", "소득/인센 합계", "송금액"].map((label, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      backgroundColor: "#e9e9e9",
                      fontWeight: "bold",
                      width: "50%",
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
