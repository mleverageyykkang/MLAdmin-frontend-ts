import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useAuth } from "providers/authProvider";
import ISalesResult from "../../common/models/salesResult/ISalesResult";
import IMediaViral from "../../common/models/mediaViral/IMediaViral";
import ICardSum from "../../common/models/cardSum/ICardSum";
import ICard from "../../common/models/card/ICard";
import IMediaViralSum from "../../common/models/mediaViralSum/IMediaViralSum";
import UnmappedModal from "./UnmappedModal";
import styles from "./MediaTracking.module.scss";
import { FaSortDown, FaSortUp } from "react-icons/fa6";

interface User {
  uid: string;
  role: string;
}
const mediaLabels: Record<string, string> = {
  meta: "메타",
  google: "구글",
  carot: "당근",
  kakao: "카카오",
  dable: "데이블",
  gfa: "네이버GFA",
  nosp: "네이버NOSP",
  moment: "모먼트",
  naver: "네이버",
};

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
  const [excelData, setExcelData] = useState<IMediaViralSum>();
  const selectedMediaFiles = useRef<HTMLInputElement | null>(null);
  const [mediaSum, setMediaSum] = useState<IMediaViralSum>();
  const [cardSum, setCardSum] = useState<ICardSum>();
  const [cardData, setCardData] = useState<ICardSum>();
  const [viralData, setViralData] = useState<IMediaViralSum>();
  const [salesResult, setSalesResult] = useState<ISalesResult[]>([]);
  const [unmappedAccounts, setUnmappedAccounts] = useState<IMediaViral[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("전체");
  const [sortColumn, setSortColumn] = useState<{
    field: string;
    order: "asc" | "desc";
  }>({ field: "", order: "asc" });
  // 세전 및 인센티브 테이블 레이블 설정정
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
          .filter(
            (marketer: any) =>
              marketer.departmentUuid === "3" || marketer.uid === "leverage1259"
          )
          .sort((a: any, b: any) => a.positionUuid - b.positionUuid)
          .map((marketer: any) => ({
            uid: marketer.uid,
            name:
              marketer.uid === "leverage1259"
                ? "마케팅레버리지"
                : marketer.name,
          }));
        setMarketerList(marketers);
      }
    } catch (error) {
      console.error("Failed to fetch Logined User info:", error);
    }
  };
  // 매체 테이블 합계 데이터 불러오기
  const getMediasSum = async () => {
    try {
      const url = `/traking/totalMediaViral?${
        userRole === "user" ? `marketerUid=${userId}&` : ""
      }year=${selectedYear}&month=${selectedMonth}`;
      const response = await axios.get(url);
      setMediaSum(response.data.body);
    } catch (error: any) {
      console.error(
        "매체 데이터 불러오기 실패:",
        error.response?.data?.result?.message
      );
    }
  };
  // 바이럴 데이터 불러오기
  const getVirals = async () => {
    try {
      const url = `/traking/viral?${
        userRole === "user" ? `marketerUid=${userId}&` : ""
      }year=${selectedYear}&month=${selectedMonth}`;
      const response = await axios.get(url);
      if (response.status === 200) {
        setViralData(response.data.body);
      }
    } catch (error: any) {
      console.error(
        "바이럴 데이터 불러오기 실패:",
        error.response?.data?.result?.message
      );
      // 에러 발생 시 기존 데이터 초기화
    }
  };

  // 카드 수수료 합
  const getCardSum = async () => {
    try {
      const url = `/traking/totalCard?${
        userRole === "user" ? `marketerUid=${userId}&` : ""
      }year=${selectedYear}&month=${selectedMonth}`;
      const response = await axios.get(url);
      setCardSum(response.data.body);
    } catch (error: any) {
      console.error(
        "매체 데이터 불러오기 실패:",
        error.response?.data?.result?.message
      );
    }
  };

  // 카드 수수료 데이터 불러오기
  const getCards = async () => {
    try {
      const url = `/traking/card?${
        userRole === "user" ? `marketerUid=${userId}&` : ""
      }&year=${selectedYear}&month=${selectedMonth}`;
      const response = await axios.get(url);
      if (response.status === 200) {
        setCardData(response.data.body);
      }
    } catch (error: any) {
      console.error(
        "카드 수수료 데이터 불러오기 실패:",
        error.response?.data?.result?.message
      );
      setCardData(undefined);
    }
  };
  // 세전 및 인센티브 데이터 불러오기
  const getSalesResults = async () => {
    try {
      if (userRole === "user") {
        const url = `/traking/salesResult?marketerUid=${userId}&year=${selectedYear}&month=${selectedMonth}`;
        const response = await axios.get(url);
        setSalesResult(response.data.body);
      }
    } catch (error) {
      console.error("Failed to fetch SalesResults Data:", error);
    }
  };
  // 엑셀 파일 (매체 테이블 리스트) 불러오기
  const getExcelMedias = async () => {
    try {
      const url = `/traking/media?${
        userRole === "user" ? `marketerUid=${userId}&` : ""
      }year=${selectedYear}&month=${selectedMonth}`;
      const response = await axios.get(url);
      setExcelData(response.data.body);
    } catch (error) {
      console.error("Failed to fetch Uploaded Media Data:", error);
    }
  };
  //초기 데이터 로드
  useEffect(() => {
    const initializeData = async () => {
      await fetchUser();
      if (userRole && userId) {
        getMediasSum();
        getVirals();
        getExcelMedias();
        getCardSum();
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
  // 년도 월 선택
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };
  // 미지정 데이터 불러오기
  const getUnmappedAccounts = async () => {
    try {
      const response = await axios.get(
        `/traking/unmappedAccount?year=${selectedYear}&month=${selectedMonth}`
      );
      setUnmappedAccounts(response.data.body);
      if (unmappedAccounts) {
        setShowModal(true);
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
      console.error("선택된 파일이 없습니다.");
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
        await getExcelMedias();
      }
      // 미지정 데이터 확인
      getUnmappedAccounts();
    } catch (error: any) {
      console.error("파일 업로드 실패:", error);
      alert(
        error.response?.data?.result?.message ||
          "파일 업로드 실패. 다시 시도해주세요."
      ); // 업로드 실패 메시지
    } finally {
      event.target.value = ""; // 파일 입력 초기화
    }
  };

  const getMediaColor = (media: string) => {
    // 매체별 색깔 지정
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

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleSort = async (field: string) => {
    const order = sortColumn?.order === "asc" ? "desc" : "asc";
    setSortColumn({ field, order });
    try {
      const url = `/traking/media?${
        userRole === "user" ? `marketerUid=${userId}&` : ""
      }year=${selectedYear}&month=${selectedMonth}&sortField=${field}&sortOrder=${
        sortColumn?.order
      }`;
      const response = await axios.get(url);
      if (response.status == 200) {
        setExcelData(response.data.body);
      }
    } catch (error) {
      console.error("Failed to Sort Datas", error);
    }
  };

  return (
    <div>
      {/* 필터 */}
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
        <div className={styles["divider-container"]}>
          <ul>
            {["전체", "매체", "바이럴", "카드수수료"].map((filter) => (
              <li
                key={filter}
                className={activeFilter === filter ? styles["active"] : ""}
                onClick={() => handleFilterClick(filter)}
              >
                {filter}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 세전 및 인센티브 테이블 */}
      {userRole === "user" ? (
        <div className="pr-3">
          <h5>결과</h5>
          <div className="d-flex mt-3">
            <div className="col-3 pl-0 mb-3">
              <table className={`${styles["vertical-table"]} mb-2`}>
                {salesResult.map((item, index) => (
                  <tbody key={index}>
                    {Object.entries(item.preTax || {}).map(([key, value]) => (
                      <tr key={key}>
                        <td
                          className="w-50"
                          style={{
                            backgroundColor:
                              key === "deductSum" ? "#ffc000" : "#434343",
                            color: "white",
                          }}
                        >
                          {labels[key]}
                        </td>
                        <td className="text-right">
                          {Number(value)?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
              <table className={styles["vertical-table"]}>
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
                              display:
                                value === 0 &&
                                key !== "incentive" &&
                                key !== "incenctiveRate"
                                  ? "none"
                                  : "",
                            }}
                          >
                            {labels[key]}
                          </td>
                          <td
                            className={`
                          ${
                            key === "incenctiveRate" ? "text-danger" : ""
                          } text-right`}
                            style={
                              key !== "incentive" && key !== "incenctiveRate"
                                ? { display: value === 0 ? "none" : "" }
                                : undefined
                            }
                          >
                            {Number(value)?.toLocaleString()}
                            {key === "incenctiveRate" ||
                            key === "mentorAccProp" ||
                            key === "mentorPayProp"
                              ? " %"
                              : ""}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                ))}
              </table>
            </div>

            <div className="col-3">
              <table className={`${styles["vertical-table"]} mb-2`}>
                {salesResult.map((item, index) => (
                  <tbody key={index}>
                    {Object.entries(item.preTaxSalary || {}).map(
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
                          <td
                            className="text-right"
                            style={{
                              color: key === "finalIncentive" ? "orange" : "",
                            }}
                          >
                            {Number(value)?.toLocaleString()}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                ))}
              </table>
              <table className={styles["vertical-table"]}>
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
                          <td
                            className="text-right"
                            style={{
                              color:
                                key === "finalAmount"
                                  ? "orange"
                                  : key === "sendAmount"
                                  ? "#3282F6"
                                  : "",
                            }}
                          >
                            {Number(value)?.toLocaleString()}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                ))}
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div>{/* 전체 매출, 지급수수료(+/-) 합 */}</div>
      )}

      {/* 매체 테이블 */}
      {(activeFilter == "전체" || activeFilter == "매체") && (
        <>
          <div className="d-flex align-items-center ml-3 mb-3 mt-3">
            <h5>매체 + 바이럴</h5>
            <div className="d-flex ml-3">
              <button
                className={styles["btn"]}
                onClick={() => {
                  selectedMediaFiles.current?.click();
                }}
              >
                파일 등록
              </button>
              <input
                type="file"
                id="fileInput"
                accept=".xlsx, .xls"
                ref={selectedMediaFiles}
                style={{ display: "none" }}
                onChange={handleMediaFileUpload}
              />
            </div>
          </div>
          <table className={`${styles["horizontal-table"]} ml-3 mb-3`}>
            <thead>
              <tr className="text-center">
                <th>년도/월</th>
                {[
                  { field: "marketerUid", label: "담당자ID" },
                  { field: "marketerName", label: "담당자명" },
                  { field: "media", label: "매체" },
                  { field: "clientName", label: "광고주명" },
                  { field: "clientId", label: "광고주ID" },
                  { field: "advCost", label: "광고비 (VAT-)" },
                  { field: "commissionRate", label: "수수료율" },
                  { field: "payVatExclude", label: "지급수수료(VAT-)" },
                  { field: "payVatInclude", label: "지급수수료(VAT+)" },
                  { field: "paybackRate", label: "페이백(%)" },
                  { field: "paybackAmount", label: "페이백(액)" },
                  { field: "total", label: "매출합계" },
                ].map((header) => (
                  <th
                    key={header.field}
                    onClick={() => {
                      handleSort(header.field);
                    }}
                  >
                    <div className="align-items-center">
                      <span>{header.label}</span>
                      {sortColumn?.field === header.field &&
                      sortColumn.order === "asc" ? (
                        <FaSortUp />
                      ) : (
                        <FaSortDown />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mediaSum ? (
                <>
                  <tr
                    className="text-center"
                    style={{ backgroundColor: "#666666", color: "white" }}
                  >
                    <td>합계</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>{mediaSum.totalAdvCost?.toLocaleString() || 0}</td>
                    <td>- %</td>
                    <td>
                      {mediaSum.totalPayVatExclude?.toLocaleString() || 0}
                    </td>
                    <td>
                      {mediaSum.totalPayVatInclude?.toLocaleString() || 0}
                    </td>
                    <td>- %</td>
                    <td>
                      {mediaSum.totalPaybackAmount?.toLocaleString() || 0}
                    </td>
                    <td>{mediaSum.grandTotalSum?.toLocaleString() || 0}</td>
                  </tr>
                  {Array.isArray(excelData) &&
                    excelData.map((item: IMediaViral) => (
                      <>
                        <tr className="text-center">
                          <td>
                            {item.monthDate
                              ? dayjs(item.monthDate).format("YYYY년 MM월")
                              : ""}
                          </td>
                          <td>{item.marketerUid}</td>
                          <td>{item.marketerName}</td>
                          <td
                            style={{
                              backgroundColor: getMediaColor(item.media || ""),
                              color:
                                getMediaColor(item.media || "") !==
                                "transparent"
                                  ? "white"
                                  : "trasparent",
                            }}
                          >
                            {item.media || ""}
                          </td>
                          <td>{item.clientName || ""}</td>
                          <td>{item.clientId || ""}</td>
                          <td>{item.advCost?.toLocaleString() || 0}</td>
                          <td>
                            {item.commissionRate
                              ? item.commissionRate.toFixed(2)
                              : "0.00"}{" "}
                            %
                          </td>
                          <td>{item.payVatExclude?.toLocaleString() || 0}</td>
                          <td>{item.payVatInclude?.toLocaleString() || 0}</td>
                          <td>
                            {item.paybackRate
                              ? item.paybackRate.toFixed(2)
                              : "0.00"}{" "}
                            %
                          </td>
                          <td>{item.paybackAmount?.toLocaleString() || 0}</td>
                          <td>{item.total?.toLocaleString() || 0}</td>
                        </tr>
                      </>
                    ))}
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
        </>
      )}

      {/* 바이럴 테이블 */}
      {(activeFilter == "전체" || activeFilter == "바이럴") && (
        <>
          <table
            style={{ backgroundColor: "transparent" }}
            className={`${styles["horizontal-table"]} no-first-row-style mb-3 ml-3`}
          >
            <thead>
              <tr>
                <th>년도/월</th>
                {[
                  { field: "marketerUid", label: "담당자ID" },
                  { field: "marketerName", label: "담당자명" },
                  { field: "media", label: "매체" },
                  { field: "clientName", label: "광고주명" },
                  { field: "clientId", label: "광고주ID" },
                  { field: "advCost", label: "광고비 (VAT-)" },
                  { field: "commissionRate", label: "수수료율" },
                  { field: "payVatExclude", label: "지급수수료(VAT-)" },
                  { field: "payVatInclude", label: "지급수수료(VAT+)" },
                ].map((header) => (
                  <th
                    key={header.field}
                    onClick={() => {
                      handleSort(header.field);
                    }}
                  >
                    <div className="align-items-center">
                      <span>{header.label}</span>
                      {sortColumn?.field === header.field &&
                      sortColumn.order === "asc" ? (
                        <FaSortUp />
                      ) : (
                        <FaSortDown />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(viralData) &&
                viralData.map((data: any) =>
                  data?.mediaViralInfo.map((item: IMediaViral) => (
                    <>
                      <tr className="text-center">
                        <td>
                          {item.monthDate
                            ? dayjs(item.monthDate).format("YYYY년 MM월")
                            : ""}
                        </td>
                        <td>{data.marketerUid}</td>
                        <td>{data.marketerName}</td>
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
                        <td>
                          {item.commissionRate
                            ? item.commissionRate.toFixed(2)
                            : "0.00"}{" "}
                          %
                        </td>
                        <td>{item.payVatExclude?.toLocaleString() || 0}</td>
                        <td>{item.payVatInclude?.toLocaleString() || 0}</td>
                      </tr>
                    </>
                  ))
                )}
            </tbody>
          </table>
        </>
      )}

      {/* 카드수수료 테이블 */}
      {(activeFilter === "전체" || activeFilter === "카드수수료") && (
        <>
          <div className="d-flex align-items-center mb-3 ml-3">
            <h5>카드 수수료</h5>
          </div>
          <table className={`${styles["horizontal-table"]} ml-3 mb-3`}>
            <thead>
              <tr className="text-center">
                <th>년도/월</th>
                {[
                  { field: "marketerUid", label: "담당자ID" },
                  { field: "marketerName", label: "담당자명" },
                  { field: "media", label: "매체" },
                  { field: "chargeVatExclude", label: "충전비(VAT-)" },
                  { field: "chargeVatInclude", label: "충전비(VAT+)" },
                  { field: "commissionRate", label: "수수료율" },
                  { field: "payVatExclude", label: "지급수수료(VAT-)" },
                  { field: "payVatInclude", label: "지급수수료(VAT+)" },
                ].map((header) => (
                  <th
                    key={header.field}
                    onClick={() => {
                      handleSort(header.field);
                    }}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cardSum ? (
                <>
                  <tr
                    className="text-center"
                    style={{ backgroundColor: "#666666", color: "white" }}
                  >
                    <td>합계</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>
                      {cardSum.totalChargeVatExclude?.toLocaleString() || 0}
                    </td>
                    <td>{cardSum.totalPayVatInclude?.toLocaleString() || 0}</td>
                    <td>- %</td>
                    <td>{cardSum.totalPayVatExclude?.toLocaleString() || 0}</td>
                    <td>{cardSum.totalPayVatInclude?.toLocaleString() || 0}</td>
                  </tr>
                  {Array.isArray(cardData) &&
                    cardData.map((item: ICard) => (
                      <>
                        <tr className="text-center">
                          <td>
                            {item.monthDate
                              ? dayjs(item.monthDate).format("YYYY년 MM월")
                              : ""}
                          </td>
                          <td>{item.marketerUid}</td>
                          <td>{item.marketerName}</td>
                          <td
                            style={{
                              backgroundColor: getMediaColor(item.media || ""),
                              color:
                                getMediaColor(item.media || "") ===
                                "transparent"
                                  ? "black"
                                  : "white",
                            }}
                          >
                            {mediaLabels[item?.media || ""]}
                          </td>
                          <td>{item.chargeVatInclude?.toLocaleString()}</td>
                          <td>{item.chargeVatExclude?.toLocaleString()}</td>
                          <td>
                            {item.commissionRate
                              ? item.commissionRate.toFixed(2)
                              : "0.00"}{" "}
                            %
                          </td>
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
        </>
      )}

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
