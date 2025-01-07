import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { useAuth } from "providers/authProvider";
import ISalesResult from "../../common/models/salesResult/ISalesResult";
import IMediaViral from "../../common/models/mediaViral/IMediaViral";
import ICardSum from "../../common/models/cardSum/ICardSum";
import ICard from "../../common/models/card/ICard";
import IMediaViralSum from "../../common/models/mediaViralSum/IMediaViralSum";
import UnmappedModal from "./UnmappedModal";

interface User {
  uid: string;
  role: string;
}

const years = Array.from({ length: 6 }, (_, i) => dayjs().year() - 1 + i); // 연도 범위 생성 (현재 연도 +/- 5)
const months = Array.from({ length: 12 }, (_, i) => i + 1); // 월 범위 생성
const currentYear = dayjs().subtract(1, "month").year(); // 전달의 연도
const currentMonth = dayjs().subtract(1, "month").month() + 1; // 전달의 월 (1월이 0으로 표시되므로 +1)

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
  const [excelData, setExcelData] = useState<IMediaViral[]>();
  const selectedMediaFiles = useRef<HTMLInputElement | null>(null);
  const selectedCardFiles = useRef<HTMLInputElement>(null);
  const [mediaData, setMediaData] = useState<IMediaViralSum[]>([]);
  const [cardData, setCardData] = useState<ICardSum>();
  const [viralData, setViralData] = useState<IMediaViral[]>([]);
  const [salesResult, setSalesResult] = useState<ISalesResult[]>([]);
  const [unmappedAccounts, setUnmappedAccounts] = useState<IMediaViral[]>([]);
  const [showModal, setShowModal] = useState(false);

  const labels: any = {
    payVatExcludeSum: `${selectedYear}년 ${selectedMonth}월`,
    deductSum: `${selectedYear}년 ${selectedMonth}월 차감액`,
    payDeductSum: "합산",
    incenctiveRate: "인센티브 요율",
    incentive: "년월 인센티브 지급",
    mentorAccProp: "사수 계정비중",
    amtProp: "비중 금액",
    mentorPayProp: "사수 지급비중",
    mentorPay: "사수 지급액",
    mentorPaySum: "지급 받을 사수 지급액",
    finalIncentive: "최종 인센티브 지급",
    basicSalary: "기본급",
    total: "합계",
    finalAmount: "신고금액",
    dutyAmount: "소득/주민세 합계",
    sendAmount: "송금액",
  };

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
      const url = `/traking/mediaViral?marketerUid=${
        userRole === "system" || userRole == "admin" ? selectedMarketer : userId
      }&year=${selectedYear}&month=${selectedMonth}`;
      const response = await axios.get(url);
      setMediaData(response.data.body);
    } catch (error) {
      console.error("Failed to fetch media Data:", error);
    }
  };

  const getVirals = async () => {
    try {
      const url = `/traking/viral?marketerUid=${
        userRole === "system" || userRole === "admin"
          ? selectedMarketer
          : userId
      }&year=${selectedYear}&month=${selectedMonth}`;
      const response = await axios.get(url);
      if (response.status === 200) {
        setViralData(response.data.body?.mediaViralInfo);
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch Viral Data:",
        error.response?.data?.result?.message
      );
      // 에러 발생 시 기존 데이터 초기화
      setViralData([]);
    }
  };

  const getCards = async () => {
    try {
      const url = `/traking/card?marketerUid=${
        userRole === "system" || userRole === "admin"
          ? selectedMarketer
          : userId
      }&year=${selectedYear}&month=${selectedMonth}`;
      const response = await axios.get(url);
      if (response.status === 200) {
        setCardData(response.data.body);
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch Card Data:",
        error.response?.data?.result?.message
      );
      setCardData(undefined);
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
      console.error("Failed to fetch SalesResults Data:", error);
    }
  };

  const getExcelMedias = async () => {
    try {
      const url = `/traking/media?marketerUid=${
        userRole === "system" || userRole === "admin"
          ? selectedMarketer
          : userId
      }&year=${selectedYear}&month=${selectedMonth}`;
      const response = await axios.get(url);
      setExcelData(response.data.body);
    } catch (error) {
      console.error("Failed to fetch Uploaded Media Data:", error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchUser();
      if (userRole && userId) {
        getMedias();
        getExcelMedias();
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

  const getUnmappedAccounts = async () => {
    try {
      const response = await axios.get(
        `/traking/unmappedAccount?year=${selectedYear}&month=${selectedMonth}`
      );
      setUnmappedAccounts(response.data.body);
      if (unmappedAccounts) {
        console.log("unmappedAccounts:", unmappedAccounts);
        setShowModal(true);
        console.log(showModal);
      }
    } catch (error) {
      console.error("Failed to fetch unmappedAccounts:", error);
    }
  };

  const handleMediaFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files; // 선택된 파일들

    if (!files || files.length === 0) {
      console.error("No files selected");
      return;
    }

    const formData = new FormData();
    // 서버에서 "file" 필드 이름을 기대하므로 "file"로 설정
    Array.from(files).forEach((file) => {
      formData.append("file", file);
    });

    const url = `/traking/media?marketerUid=${
      userRole === "admin" || userRole === "system" ? selectedMarketer : userId
    }&year=${selectedYear}&month=${selectedMonth}`;

    try {
      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200) {
        alert("파일 업로드 성공!"); // 업로드 성공 메시지
      }
      await getExcelMedias();

      // 미지정 데이터 확인
      getUnmappedAccounts();
    } catch (error) {
      console.error("Error uploading files:", error);
      alert(error || "파일 업로드 실패. 다시 시도해주세요."); // 업로드 실패 메시지
    } finally {
      event.target.value = ""; // 파일 입력 초기화
    }
  };

  const handleViralFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {};

  const handleCardFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {};

  // 마케터 필터 변경 처리
  const handleMarketerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const marketerUid = e.target.value;
    setSelectedMarketer(marketerUid);
  };

  const getMediaColor = (media: string) => {
    if (
      media === "네이버" ||
      media === "naver" ||
      media === "nosp" ||
      media === "네이버NOSP" ||
      media === "gfa" ||
      media === "네이버GFA"
    )
      return "#6aa84f";
    else if (media === "다음" || media === "daum") return "#6d9eeb";
    else if (media === "모먼트" || media === "moment") return "#e69138";
    else if (media === "당근" || media === "carot") return "#ff9900";
    else if (media === "구글" || media === "google") return "#4285f4";
    else if (media === "바이럴" || media === "viral") return "#7f6000";
    else if (
      media === "카카오" ||
      media === "카카오모먼트" ||
      media === "kakao" ||
      media === "momnet"
    )
      return "#e69138";
    else return "transparent";
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
        <div className="d-flex">
          <input
            type="file"
            id="fileInput"
            accept=".xlsx, .xls"
            ref={selectedMediaFiles}
            // className="d-none"
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
      </div>
      <table className="table table-bordered table-striped">
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
          {mediaData.length > 0 ? (
            <>
              <tr
                className="text-center"
                style={{ backgroundColor: "#666666", color: "white" }}
              >
                {mediaData.map((item) => (
                  <>
                    <td>합계</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>{item.advCostSum?.toLocaleString() || 0}</td>
                    <td>- %</td>
                    <td>{item.payVatExcludeSum?.toLocaleString() || 0}</td>
                    <td>{item.payVatIncludeSum?.toLocaleString() || 0}</td>
                    <td>- %</td>
                    <td>{item.paybackAmountSum?.toLocaleString() || 0}</td>
                    <td>{item.totalSum?.toLocaleString() || 0}</td>
                  </>
                ))}
              </tr>
              {excelData &&
                excelData?.map((data: any) =>
                  data.mediaViralInfo?.map((item: IMediaViral) => (
                    <>
                      <tr className="text-center">
                        <td>
                          {item.monthDate
                            ? dayjs(item.monthDate).format("YYYY년 MM월")
                            : ""}
                        </td>
                        <td
                          style={{
                            backgroundColor: getMediaColor(item.media || ""),
                            color:
                              getMediaColor(item.media || "") !== "transparent"
                                ? "white"
                                : "trasparent",
                          }}
                        >
                          {item.media || ""}
                        </td>
                        <td>{item.clientName || ""}</td>
                        <td>{item.clientId || ""}</td>
                        <td>{item.advCost?.toLocaleString() || 0}</td>
                        <td>{item.commissionRate || 0} %</td>
                        <td>{item.payVatExclude?.toLocaleString() || 0}</td>
                        <td>{item.payVatInclude?.toLocaleString() || 0}</td>
                        <td>{item.paybackRate || 0} %</td>
                        <td>{item.paybackAmount?.toLocaleString() || 0}</td>
                        <td>{item.total?.toLocaleString() || 0}</td>
                      </tr>
                    </>
                  ))
                )}
            </>
          ) : (
            <tr>
              <td colSpan={11} className="text-center">
                데이터가 없습니다.
              </td>
            </tr>
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
          불러오기
        </button>
      </div>
      <table className="table table-bordered table-striped">
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
          {Array.isArray(viralData) && viralData.length > 0 ? (
            viralData.map((item) => (
              <>
                <tr className="text-center">
                  <td>
                    {item.monthDate
                      ? dayjs(item.monthDate).format("YYYY년 MM월")
                      : ""}
                  </td>
                  <td
                    style={{
                      backgroundColor: getMediaColor(item.media || ""),
                      color:
                        getMediaColor(item.media || "") !== "transparent"
                          ? "white"
                          : "trasparent",
                    }}
                  >
                    {item.media || ""}
                  </td>
                  <td>{item.clientName || ""}</td>
                  <td>{item.clientId || ""}</td>
                  <td>{item.advCost?.toLocaleString() || 0}</td>
                  <td>{item.commissionRate?.toLocaleString() || 0} %</td>
                  <td>{item.payVatExclude?.toLocaleString() || 0}</td>
                  <td>{item.payVatInclude?.toLocaleString() || 0}</td>
                </tr>
              </>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center text-secondary">
                데이터가 없습니다.
              </td>
            </tr>
          )}
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
          불러오기
        </button>
      </div>
      <table className="table table-bordered table-striped">
        <thead>
          <tr className="text-center">
            <th>년도/월</th>
            <th>매체</th>
            <th>충전비(VAT+)</th>
            <th>충전비(VAT-)</th>
            <th>수수료율</th>
            <th>지급수수료(VAT-)</th>
            <th>지급수수료(VAT+)</th>
          </tr>
        </thead>
        <tbody>
          {cardData ? (
            <>
              <tr
                className="text-center"
                style={{ backgroundColor: "#666666", color: "white" }}
              >
                <td>합계</td>
                <td>-</td>
                <td>{cardData?.chargeVatIncludeSum?.toLocaleString() || 0}</td>
                <td>{cardData?.chargeVatExcludeSum?.toLocaleString() || 0}</td>
                <td>- %</td>
                <td>{cardData?.payVatExcludeSum?.toLocaleString() || 0}</td>
                <td>{cardData?.payVatIncludeSum?.toLocaleString() || 0}</td>
              </tr>
              {Array.isArray(cardData?.cardInfo) &&
                cardData?.cardInfo.map((item: ICard) => (
                  <>
                    <tr className="text-center">
                      <td>
                        {item.monthDate
                          ? dayjs(item.monthDate).format("YYYY년 MM월")
                          : ""}
                      </td>
                      <td
                        style={{
                          backgroundColor: getMediaColor(item.media || ""),
                          color:
                            getMediaColor(item.media || "") !== "transparent"
                              ? "white"
                              : "trasparent",
                        }}
                      >
                        {item.media}
                      </td>
                      <td>{item.chargeVatInclude?.toLocaleString()}</td>
                      <td>{item.chargeVatExclude?.toLocaleString()}</td>
                      <td>{item.commissionRate} %</td>
                      <td>{item.payVatExclude?.toLocaleString()}</td>
                      <td>{item.payVatInclude?.toLocaleString()}</td>
                    </tr>
                  </>
                ))}
            </>
          ) : (
            <tr className="text-center text-secondary">
              <td colSpan={7}>데이터가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 세전 및 인센티브 테이블 */}
      <div className="d-flex">
        <div className="col-3 pl-0">
          <h5 className="mt-4 mb-4">세전</h5>
          <table className="table table-bordered">
            {salesResult.map((item, index) => (
              <tbody key={index}>
                {Object.entries(item.preTax || {}).map(([key, value]) => (
                  <tr key={key}>
                    <td
                      className="w-50"
                      style={{
                        backgroundColor:
                          key === "deductSum" ? "#ffc000" : "#434343",
                        color: "#fff",
                        fontWeight: key === "deductSum" ? "bold" : "normal",
                      }}
                    >
                      {labels[key]}
                    </td>
                    <td className="text-right">{value?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        <div className="col-3">
          <h5 className="mt-4 mb-4">인센티브 계산</h5>
          <table className="table table-bordered">
            {salesResult.map((item, index) => (
              <tbody key={index}>
                {Object.entries(item.incentiveCalculation || {}).map(
                  ([key, value]) => (
                    <tr key={key}>
                      <td
                        className="w-50"
                        style={{
                          backgroundColor:
                            key === "incentive" || key === "incenctiveRate"
                              ? "#434343"
                              : "#38761d",
                          color: "white",
                          fontWeight:
                            key === "incentive" || key === "incenctiveRate"
                              ? "normal"
                              : "bold",
                        }}
                      >
                        {labels[key]}
                      </td>
                      <td className="text-right">{value?.toLocaleString()}</td>
                    </tr>
                  )
                )}
              </tbody>
            ))}
          </table>
        </div>

        <div className="col-3">
          <h5 className="mt-4 mb-4">세전 인센티브 합</h5>
          <table className="table table-bordered">
            {salesResult.map((item, index) => (
              <tbody key={index}>
                {Object.entries(item.preTaxSalary || {}).map(([key, value]) => (
                  <tr key={key}>
                    <td
                      className="w-50"
                      style={{
                        backgroundColor: "#454545",
                        color: "white",
                      }}
                    >
                      {labels[key]}
                    </td>
                    <td className="text-right">{value?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        <div className="col-3 pr-0">
          <h5 className="mt-4 mb-4">인센티브액</h5>
          <table className="table table-bordered">
            {salesResult.map((item, index) => (
              <tbody key={index}>
                {Object.entries(item.afterTaxIncentive || {}).map(
                  ([key, value]) => (
                    <tr key={key}>
                      <td
                        className="w-50"
                        style={{
                          backgroundColor: "#454545",
                          color: "white",
                        }}
                      >
                        {labels[key]}
                      </td>
                      <td className="text-right">{value?.toLocaleString()}</td>
                    </tr>
                  )
                )}
              </tbody>
            ))}
          </table>
        </div>
      </div>

      {/* 미지정 데이터 모달 */}
      {/* {showModal && unmappedAccounts.length > 0 && (
        <UnmappedModal
          showModal={showModal}
          setShowModal={setShowModal}
          unmappedAccounts={unmappedAccounts}
        />
      )} */}
    </div>
  );
};

export default MediaTracking;
