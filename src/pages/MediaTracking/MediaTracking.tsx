import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { useAuth } from "providers/authProvider";
import ITracking from "../../common/models/traking/ITraking";
import ISalesResult from "../../common/models/salesResult/ISalesResult";
import IMediaViral from "../../common/models/mediaViral/IMediaViral";
import ICardSum from "../../common/models/cardSum/ICardSum";

interface User {
  uid: string;
  role: string;
}

const years = Array.from({ length: 6 }, (_, i) => dayjs().year() + i); // 연도 범위 생성 (현재 연도 +/- 5)
const months = Array.from({ length: 12 }, (_, i) => i + 1); // 월 범위 생성
const currentYear = dayjs().year();
const currentMonth = dayjs().month(); // 현재 월 -1

const MediaTracking: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [marketerList, setMarketerList] = useState<
    { uid: string; name: string }[]
  >([]);
  const [selectedMarketer, setSelectedMarketer] = useState<string>("");
  const { isLoggedIn } = useAuth();
  const [excelData, setExcelData] = useState<string[][] | null>(null);
  const selectedMediaFiles = useRef<HTMLInputElement>(null);
  const selectedCardFiles = useRef<HTMLInputElement>(null);
  const [mediaData, setMediaData] = useState<ITracking[]>([]);
  const [cardData, setCardData] = useState<ICardSum[]>([]);
  const [viralData, setViralData] = useState<IMediaViral[]>([]);
  const [salesResult, setSalesResult] = useState<ISalesResult[]>([]);

  const fetchUser = async () => {
    try {
      const response = await axios.get("/user", {
        withCredentials: true,
      });
      const user: User = response.data.context.user;
      setUserRole(user.role);
      setUserId(user.uid);
      if (user.role === "admin" || user.role === "system") {
        const marketerResponse = response.data.body;
        const marketers = marketerResponse
          .filter((marketer: any) => marketer.departmentUuid === "3")
          .sort((a: any, b: any) => a.positionUuid - b.positionUuid)
          .map((marketer: any) => ({ uid: marketer.uid, name: marketer.name }));
        setMarketerList(marketers);
        if (marketerList.length >= 0 && !selectedMarketer) {
          setSelectedMarketer(marketers[0].uid);
        }
      }
    } catch (error) {
      console.error("Failed to fetch Logined User info:", error);
    }
  };

  const getMedias = async () => {
    try {
      const url = `/traking?marketerUid=${
        userRole === "system" || userRole == "admin" ? selectedMarketer : userId
      }&year=${selectedYear}&month=${selectedMonth}`;
      const response = await axios.get(url);
      setMediaData(response.data.body);
    } catch (error) {
      console.error("Failed to fetch Data:", error);
    }
  };

  const getVirals = async () => {
    try {
      const url = `/traking/viral?marketerUid=${
        userRole === "system" || userRole === "admin"
          ? selectedMarketer
          : userId
      }`;
      const response = await axios.get(url);
      if (response.status === 200) {
        console.log("viral:", response.data.body?.mediaViralInfo);
        setViralData(response.data.body?.mediaViralInfo);
      }
    } catch (error) {
      console.error("Failed to fetch Card Data:", error);
    }
  };

  const getCards = async () => {
    try {
      const url = `/traking/card?marketerUid=${
        userRole === "system" || userRole === "admin"
          ? selectedMarketer
          : userId
      }`;
      const response = await axios.get(url);
      if (response.status === 200) {
        setCardData(response.data.body);
        console.log("cardData:", cardData);
      }
    } catch (error) {
      console.error("Failed to fetch Card Data:", error);
    }
  };

  const getSalesResults = async () => {
    try {
      const url = `/traking/salesResult?marketerUid=${
        userRole === "system" || userRole === "admin"
          ? selectedMarketer
          : userId
      }&year=${selectedYear}&month=${selectedMonth}`;
      const response = await axios.get(url);
      setSalesResult(response.data.body);
    } catch (error) {
      console.error("Failed to fetch Card Data:", error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchUser();
      if (userRole && userId) {
        console.log(userRole, userId);
        getMedias();
        getVirals();
        getCards();
        getSalesResults();
      }
    };
    initializeData();
  }, [
    isLoggedIn,
    selectedMarketer,
    userRole,
    userId,
    selectedMonth,
    selectedYear,
  ]);

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

  const handleViralFileUpload = (
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

  // 마케터 필터 변경 처리
  const handleMarketerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const marketerUid = e.target.value;
    setSelectedMarketer(marketerUid);
  };

  return (
    <div className="container-fluid">
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
        {(userRole === "system" || userRole === "admin") && (
          <>
            <label className="mr-2">이름:</label>
            <select value={selectedMarketer} onChange={handleMarketerChange}>
              {marketerList.map((marketer: any, index) => (
                <option
                  key={marketer.uid}
                  value={marketer.uid}
                  selected={index === 0}
                >
                  {marketer.name}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* 매체 테이블 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>매체</h5>
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
      <table className="table table-bordered">
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
            {mediaData.map((item) => (
              <>
                <td>합계</td>
                <td>{}</td>
                <td>{}</td>
                <td>{}</td>
                <td>{item.mediaViral?.advCostSum || 0}</td>
                <td>- %</td>
                <td>{item.mediaViral?.payVatExcludeSum || 0}</td>
                <td>{item.mediaViral?.payVatIncludeSum || 0}</td>
                <td>- %</td>
                <td>{item.mediaViral?.paybackAmountSum || 0}</td>
                <td>{item.mediaViral?.totalSum || 0}</td>
              </>
            ))}
          </tr>
          {mediaData.map((media) =>
            media.mediaViral?.mediaViralInfo?.map((item) => (
              <>
                <tr className="text-center">
                  <td>{dayjs(item.monthDate).format("YYYY년 MM월")}</td>
                  <td>{item.media || 0}</td>
                  <td>{item.clientName || 0}</td>
                  <td>{item.clientId || 0}</td>
                  <td>{item.advCost || 0}</td>
                  <td>{item.commissionRate || 0} %</td>
                  <td>{item.payVatExclude || 0}</td>
                  <td>{item.payVatInclude || 0}</td>
                  <td>{item.paybackRate || 0} %</td>
                  <td>{item.paybackAmount || 0}</td>
                  <td>{item.total || 0}</td>
                </tr>
              </>
            ))
          )}
        </tbody>
      </table>

      {/* 바이럴 테이블 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>바이럴</h5>
        <input
          type="file"
          accept=".xlsx, .xls"
          ref={selectedMediaFiles}
          className="d-none"
          multiple={true}
          onChange={handleViralFileUpload}
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
      <table className="table table-bordered">
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
          </tr>
        </thead>
        <tbody>
          <tr className="text-center">
            {Array.isArray(viralData) &&
              viralData.map((item) => (
                <>
                  <td>{item.media}</td>
                  <td>{item.clientName}</td>
                  <td>{item.clientId}</td>
                  <td>{item.advCost}</td>
                  <td>{item.commissionRate}</td>
                  <td>{item.payVatExclude}</td>
                  <td>{item.payVatInclude}</td>
                </>
              ))}
          </tr>
        </tbody>
      </table>

      {/* 카드수수료 테이블 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>카드 수수료</h5>
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
      <table className="table table-bordered">
        <thead>
          <tr className="text-center">
            <th>년도/월</th>
            <th>매체</th>
            <th>매체</th>
            <th>충전비(VAT+)</th>
            <th>충전비(VAT-)</th>
            <th>수수료율</th>
            <th>지급수수료(VAT-)</th>
            <th>지급수수료(VAT+)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="text-center">
            {Array.isArray(cardData) &&
              cardData.map((item) => (
                <>
                  <td>합계</td>
                  <td>매체</td>
                  <td>매체</td>
                  <td>{item.chargeVatIncludeSum || 0}</td>
                  <td>{item.chargeVatExcludeSum || 0}</td>
                  <td>- %</td>
                  <td>{item.payVatExcludeSum || 0}</td>
                  <td>{item.payVatIncludeSum || 0}</td>
                </>
              ))}
          </tr>
          <tr className="text-center">
            {Array.isArray(cardData) &&
              cardData.map((card) =>
                card.cardInfo?.map((item: any) => (
                  <>
                    <td>{dayjs(item.monthDate).format("YYYY년 MM월")}</td>
                    <td>{item.media}</td>
                    <td></td>
                    <td></td>
                    <td>{item.chargeVatExclude}</td>
                    <td>{item.commissionRate} %</td>
                    <td>{item.payVatExclude}</td>
                    <td>{item.payVatInclude}</td>
                  </>
                ))
              )}
          </tr>
        </tbody>
      </table>

      {/* 세전 및 인센티브 테이블 */}
      <h5 className="mt-4 mb-4">세전 및 인센티브</h5>
      <table className="table table-bordered table-responsive">
        <tbody>
          <tr className="text-center text-nowrap">
            <td rowSpan={2} className="bg-dark text-white">
              세전
            </td>
            <td>년월</td>
            <td>인센티브 요율</td>
            <td>인센티브 지급</td>
            <td>사수 계정비중</td>
            <td>비중 금액</td>
            <td>사수 지급비중</td>
            <td>사수 지급액</td>
            <td>최종 인센티브 지급</td>
            <td>기본급</td>
            <td>합계</td>
            <td rowSpan={2} className="bg-dark text-white">
              인센
              <br />
              티브
            </td>
            <td>신고금액</td>
            <td>소득/주민세 합계</td>
            <td>송금액</td>
          </tr>
          {salesResult.map((item) => (
            <>
              <tr className="text-center text-nowrap">
                <td>{dayjs(item.monthDate).format("YYYY년 MM월")}</td>
                <td>{item.incentiveCalculation?.incentiveRate || 0} %</td>
                <td>{item.incentiveCalculation?.incentive || 0}</td>
                <td>{item.incentiveCalculation?.mentorAccProp || 0} %</td>
                <td>{item.incentiveCalculation?.amtProp || 0}</td>
                <td>{item.incentiveCalculation?.mentorPayProp || 0} %</td>
                <td>{item.incentiveCalculation?.mentorPay || 0}</td>
                {/* 사수 입장에서 받을 합산 */}
                {/* <td>{item.incentiveCalculation?.mentorPaySum || 0}</td> */}
                <td>{item.preTaxSalary?.finalIncentive || 0}</td>
                <td>{item.preTaxSalary?.basicSalary}</td>
                <td>{item.preTaxSalary?.total || 0}</td>
                <td>{item.afterTaxIncentive?.finalAmount || 0}</td>
                <td>{item.afterTaxIncentive?.dutyAmount || 0}</td>
                <td>{item.afterTaxIncentive?.sendIncentive || 0}</td>
                {/* <td>{item.preTaxSalary || 0}</td> */}
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MediaTracking;
