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
import { IoFilterSharp } from "react-icons/io5";

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
  const [excelData, setExcelData] = useState<IMediaViralSum>();
  const selectedMediaFiles = useRef<HTMLInputElement | null>(null);
  const [mediaSum, setMediaSum] = useState<{
    type: string;
    data: IMediaViralSum;
  }>();
  const [viralSum, setViralSum] = useState<{
    type: string;
    data: IMediaViralSum;
  }>();
  const [cardSum, setCardSum] = useState<ICardSum>();
  const [cardData, setCardData] = useState<ICardSum>();
  const [viralData, setViralData] = useState<IMediaViral[]>([]);
  const [salesResult, setSalesResult] = useState<ISalesResult[]>([]);
  const [unmappedAccounts, setUnmappedAccounts] = useState<IMediaViral[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("전체");
  const [tooltipOpen, setTooltipOpen] = useState<{
    table: string;
    field: string;
  } | null>(null);
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
  const [columns, setColumns] = useState([
    { field: "marketerUid", label: "담당자ID", group: "info", width: "120px" },
    { field: "marketerName", label: "담당자명", group: "info", width: "120px" },
    { field: "media", label: "매체", group: "info", width: "100px" },
    { field: "clientName", label: "광고주명", group: "info", width: "250px" },
    { field: "clientId", label: "광고주ID", group: "money", width: "120px" },
    {
      field: "advCost",
      label: "광고비 (VAT-)",
      group: "money",
      width: "120px",
    },
    {
      field: "commissionRate",
      label: "수수료율",
      group: "money",
      width: "120px",
    },
    {
      field: "payVatExclude",
      label: "지급수수료(VAT-)",
      group: "money",
      width: "120px",
    },
    {
      field: "payVatInclude",
      label: "지급수수료(VAT+)",
      group: "money",
      width: "120px",
    },
    {
      field: "paybackRate",
      label: "페이백(%)",
      group: "money",
      width: "120px",
    },
    {
      field: "paybackAmount",
      label: "페이백(액)",
      group: "money",
      width: "120px",
    },
    { field: "total", label: "매출합계", group: "money", width: "120px" },
  ]);

  const moveColumn = (fromIndex: number, toIndex: number) => {
    setColumns((prevColumns) => {
      const updatedColumns = [...prevColumns];
      const [movedColumn] = updatedColumns.splice(fromIndex, 1);
      updatedColumns.splice(toIndex, 0, movedColumn);
      return updatedColumns;
    });
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLTableHeaderCellElement>,
    index: number
  ) => {
    e.dataTransfer.setData("colIndex", index.toString());
  };

  const handleDrop = (
    e: React.DragEvent<HTMLTableHeaderCellElement>,
    targetIndex: number
  ) => {
    const fromIndex = parseInt(e.dataTransfer.getData("colIndex"), 10);
    if (columns[fromIndex].group !== columns[targetIndex].group) {
      return;
    }
    moveColumn(fromIndex, targetIndex);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableHeaderCellElement>) => {
    e.preventDefault();
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
            name: marketer.uid === "leverage1259" ? "마레" : marketer.name,
          }));
        setMarketerList(marketers);
      }
    } catch (error) {
      console.error("Failed to fetch Logined User info:", error);
    }
  };

  // 매체 매출 합계
  const getMediaSum = async () => {
    try {
      const url = `/traking/totalMedia?${
        selectedMarketer == ""
          ? ""
          : userRole == "system" || userRole == "admin"
          ? `marketerUid=${selectedMarketer}&`
          : `marketerUid=${userId}&`
      }year=${selectedYear}&month=${selectedMonth}`;
      const response = await axios.get(url);
      setMediaSum(() => ({ type: "매체", data: response.data.body }));
    } catch (error: any) {
      console.error(
        "매체 데이터 불러오기 실패:",
        error.response?.data?.result?.message
      );
    }
  };

  // 바이럴 매출 합계
  const getViralSum = async () => {
    try {
      const url = `/traking/totalViral?${
        selectedMarketer == ""
          ? ""
          : userRole == "system" || userRole == "admin"
          ? `marketerUid=${selectedMarketer}&`
          : `marketerUid=${userId}&`
      }year=${selectedYear}&month=${selectedMonth}`;
      const response = await axios.get(url);
      setViralSum(() => ({ type: "바이럴", data: response.data.body }));
    } catch (error: any) {
      console.error(
        "매체 데이터 불러오기 실패:",
        error.response?.data?.result?.message
      );
    }
  };

  // 카드 수수료 매출 합계
  const getCardSum = async () => {
    try {
      const url = `/traking/totalCard?${
        selectedMarketer == ""
          ? ""
          : userRole == "system" || userRole == "admin"
          ? `marketerUid=${selectedMarketer}&`
          : `marketerUid=${userId}&`
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

  // 엑셀 파일 (매체 테이블 리스트) 불러오기
  const getExcelMedias = async () => {
    try {
      const url = `/traking/media?${
        selectedMarketer == ""
          ? ""
          : userRole == "system" || userRole == "admin"
          ? `marketerUid=${selectedMarketer}&`
          : `marketerUid=${userId}&`
      }year=${selectedYear}&month=${selectedMonth}`;
      const response = await axios.get(url);
      setExcelData(response.data.body);
    } catch (error) {
      console.error("Failed to fetch Uploaded Media Data:", error);
    }
  };

  // 바이럴 데이터 불러오기
  const getVirals = async () => {
    try {
      const url = `/traking/viral?${
        selectedMarketer == ""
          ? ""
          : userRole == "system" || userRole == "admin"
          ? `marketerUid=${selectedMarketer}&`
          : `marketerUid=${userId}&`
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

  // 카드 수수료 데이터 불러오기
  const getCards = async () => {
    try {
      const url = `/traking/card?${
        selectedMarketer == ""
          ? ""
          : userRole == "system" || userRole == "admin"
          ? `marketerUid=${selectedMarketer}&`
          : `marketerUid=${userId}&`
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
  //초기 데이터 로드
  useEffect(() => {
    const initializeData = async () => {
      await fetchUser();
      if (userRole && userId) {
        getMediaSum();
        getViralSum();
        getCardSum();
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

  // 마케터 필터 변경 처리
  const handleMarketerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const marketerUid = e.target.value;
    setSelectedMarketer(marketerUid);
  };

  const getMediaColor = (media: string) => {
    // 매체별 색깔 지정
    if (media === "네이버" || media === "NOSP" || media === "GFA")
      return "#6aa84f";
    else if (media === "모먼트") return "#e69138";
    else if (media === "당근") return "#ff9900";
    else if (media === "구글") return "#4285f4";
    else if (media === "바이럴") return "#7f6000";
    else if (media === "카카오" || media === "모먼트") return "#e69138";
    else return "#a0a0a0";
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleSort = async (
    field: string,
    order: "asc" | "desc",
    table: "media" | "viral" | "card"
  ) => {
    try {
      let url = `/traking/${
        table == "media" ? "media" : table == "viral" ? "viral" : "card"
      }?${
        selectedMarketer == ""
          ? ""
          : userRole == "system" || userRole == "admin"
          ? `marketerUid=${selectedMarketer}&`
          : `marketerUid=${userId}&`
      }year=${selectedYear}&month=${selectedMonth}&sortField=${field}&sortOrder=${order}`;
      const response = await axios.get(url);

      if (response.status === 200) {
        if (table === "media") setExcelData(response.data.body);
        if (table === "viral") setViralData(response.data.body);
        if (table === "card") setCardData(response.data.body);
        setTooltipOpen(null); // 말풍선 닫기
      }
    } catch (error) {
      console.error(`Failed to Sort ${table} Data`, error);
    }
  };

  const toggleTooltip = (field: string, table: "media" | "viral" | "card") => {
    setTooltipOpen(
      tooltipOpen?.field === field && tooltipOpen?.table === table
        ? null
        : { field, table }
    );
  };

  const getAdjustedColumns = (tableType: "media" | "viral" | "card") => {
    // 필드별 label 매핑 정의
    const labelMappings: Record<
      string,
      Record<"media" | "viral" | "card", string>
    > = {
      clientId: {
        media: "광고주ID",
        viral: "순매출 합",
        card: "충전비(VAT+)",
      },
      advCost: {
        media: "광고비 (VAT-)",
        viral: "순매출 계산",
        card: "충전비(VAT-)",
      },
    };

    // columns 배열 복사
    const adjustedColumns = [...columns];

    // label 수정
    adjustedColumns.forEach((column) => {
      if (
        labelMappings[column.field] &&
        labelMappings[column.field][tableType]
      ) {
        column.label = labelMappings[column.field][tableType];
      }
    });

    return adjustedColumns;
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
          {(userRole == "system" || userRole == "admin") && (
            <>
              <label>이름</label>
              <select value={selectedMarketer} onChange={handleMarketerChange}>
                <option value="" key="total" defaultValue="">
                  전체
                </option>
                {marketerList.map((marketer: any) => (
                  <option value={marketer.uid} key={marketer.uid}>
                    {marketer.name}
                  </option>
                ))}
              </select>
            </>
          )}
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
      <div className="pl-3 mt-3">
        <h5>인센티브</h5>
        {userRole === "user" ? (
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
                                  ? "#00ff00"
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
        ) : (
          <div>
            {/* 전체 매출, 지급수수료(+/-) 합 */}
            <table
              className={`${styles["totalSum-table"]} my-3 table-bordered`}
            >
              <thead>
                <tr className="text-center">
                  <th>구분</th>
                  <th>담당자명</th>
                  <th>충전비(VAT+)</th>
                  <th>충전비(VAT-)</th>
                  <th>광고비(VAT-) 합계</th>
                  <th>지급수수료(VAT-) 합계</th>
                  <th>지급수수료(VAT+) 합계</th>
                  <th>페이백(액) 합계</th>
                  <th>총 매출 합계</th>
                </tr>
              </thead>
              <tbody>
                {[mediaSum, viralSum].map((item) => (
                  <>
                    <tr className="text-right">
                      <td className="text-center">합계</td>
                      <td className="text-center">-</td>
                      <td className="text-center">-</td>
                      <td className="text-center">-</td>
                      <td>{item?.data?.totalAdvCost?.toLocaleString() || 0}</td>
                      <td>
                        {item?.data?.totalPayVatExclude?.toLocaleString() || 0}
                      </td>
                      <td>
                        {item?.data?.totalPayVatInclude?.toLocaleString() || 0}
                      </td>
                      <td>
                        {item?.data?.totalPaybackAmount?.toLocaleString() || 0}
                      </td>
                      <td>
                        {item?.data?.grandTotalSum?.toLocaleString() || 0}
                      </td>
                    </tr>
                    {/* 상세 데이터 행 */}
                    {Array.isArray(item?.data?.details) &&
                      item?.data?.details?.map(
                        (detailItem: any, detailIndex: number) => (
                          <tr key={detailIndex} className="text-right">
                            <td className="text-center">{item?.type}</td>
                            <td className="text-center">
                              {detailItem.marketerUid}
                            </td>
                            <td className="text-center">-</td>
                            <td className="text-center">-</td>
                            <td>
                              {detailItem.advCostSum?.toLocaleString() || 0}
                            </td>
                            <td>
                              {detailItem.payVatExcludeSum?.toLocaleString() ||
                                0}
                            </td>
                            <td>
                              {detailItem.payVatIncludeSum?.toLocaleString() ||
                                0}
                            </td>
                            <td>
                              {detailItem.paybackAmountSum?.toLocaleString() ||
                                0}
                            </td>
                            <td>
                              {detailItem.totalSum?.toLocaleString() || 0}
                            </td>
                          </tr>
                        )
                      )}
                  </>
                ))}

                <tr className="text-right">
                    <td className="text-center">카드수수료</td>
                    <td>-</td>
                  <td>
                    {cardSum?.totalChargeVatInclude?.toLocaleString() || 0}
                  </td>
                  <td>
                    {cardSum?.totalChargeVatExclude?.toLocaleString() || 0}
                  </td>
                  <td className="text-center">-</td>
                  <td>{cardSum?.totalPayVatInclude?.toLocaleString() || 0}</td>
                  <td>{cardSum?.totalPayVatExclude?.toLocaleString() || 0}</td>
                  <td className="text-center">-</td>
                  <td className="text-center">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(activeFilter == "전체" || activeFilter == "매체") && mediaSum && (
        <>
          <div className="d-flex ml-3 mb-3 mt-3">
            <h5>매체</h5>
            {(userRole === "system" || userRole === "admin") &&
              activeFilter == "전체" && (
                <div className="d-flex">
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
              )}
          </div>
          <table className={`${styles["horizontal-table"]} ml-3 mb-3`}>
            <thead>
              <tr className="text-center">
                <th>년도/월</th>
                {getAdjustedColumns("media").map((header, index) => (
                  <th
                    key={header.field}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragOver={handleDragOver}
                    style={{
                      position: "relative",
                      cursor: "move",
                      width: header.width,
                    }}
                  >
                    <div
                      className={styles["tooltip-container"]}
                      onClick={() => toggleTooltip(header.field, "media")}
                    >
                      <span>{header.label}</span>
                      <IoFilterSharp />
                      {tooltipOpen?.field === header.field &&
                        tooltipOpen?.table === "media" && (
                          <div className={styles["tooltip"]}>
                            <button
                              onClick={() =>
                                handleSort(header.field, "asc", "media")
                              }
                              className={styles["tooltip-button"]}
                            >
                              오름차순
                            </button>
                            <button
                              onClick={() =>
                                handleSort(header.field, "desc", "media")
                              }
                              className={styles["tooltip-button"]}
                            >
                              내림차순
                            </button>
                          </div>
                        )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr
                className="text-center"
                style={{ backgroundColor: "#666666", color: "white" }}
              >
                <td>합계</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td className="text-right">
                  {mediaSum.data?.totalAdvCost?.toLocaleString() || 0}
                </td>
                <td className="text-right">- %</td>
                <td className="text-right">
                  {mediaSum.data?.totalPayVatExclude?.toLocaleString() || 0}
                </td>
                <td className="text-right">
                  {mediaSum.data?.totalPayVatInclude?.toLocaleString() || 0}
                </td>
                <td className="text-right">- %</td>
                <td className="text-right">
                  {mediaSum.data?.totalPaybackAmount?.toLocaleString() || 0}
                </td>
                <td className="text-right">
                  {mediaSum.data?.grandTotalSum?.toLocaleString() || 0}
                </td>
              </tr>
              {excelData &&
                Array.isArray(excelData) &&
                excelData.map((item: IMediaViral, rowIndex) => (
                  <tr key={rowIndex} className="text-center">
                    <td>
                      {item.monthDate
                        ? dayjs(item.monthDate).format("YYYY년 MM월")
                        : ""}
                    </td>
                    {columns.map((column) => (
                      <td
                        key={column.field}
                        style={{
                          backgroundColor:
                            column.field === "media"
                              ? getMediaColor(item.media || "")
                              : "",
                          color:
                            Number(item.paybackRate) > 0
                              ? !["total", "media"].includes(column.field)
                                ? "#ff00ff"
                                : "white"
                              : "",
                        }}
                        className={
                          [
                            "marketerUid",
                            "marketerName",
                            "media",
                            "clientName",
                            "clientId",
                          ].includes(column.field)
                            ? "text-center"
                            : "text-right"
                        }
                      >
                        {(() => {
                          switch (column.field) {
                            case "marketerUid":
                              return item.marketerUid || "-";
                            case "marketerName":
                              return item.marketerName || "-";
                            case "media":
                              return item.media || "-";
                            case "clientName":
                              return item.clientName || "-";
                            case "clientId":
                              return item.clientId || "-";
                            case "advCost":
                              return item.advCost?.toLocaleString() || 0;
                            case "commissionRate":
                              return `${
                                item.commissionRate?.toFixed(2) || "0.00"
                              } %`;
                            case "payVatExclude":
                              return item.payVatExclude?.toLocaleString() || 0;
                            case "payVatInclude":
                              return item.payVatInclude?.toLocaleString() || 0;
                            case "paybackRate":
                              return `${
                                item.paybackRate?.toFixed(2) || "0.00"
                              } %`;
                            case "paybackAmount":
                              return item.paybackAmount?.toLocaleString() || 0;
                            case "total":
                              return item.total?.toLocaleString() || 0;
                            default:
                              return "-";
                          }
                        })()}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}

      {(activeFilter == "전체" || activeFilter == "바이럴") &&
        viralData?.length > 0 && (
          <>
            <h5 className="mt-3 mb-3 ml-3">바이럴</h5>
            <table className={`${styles["horizontal-table"]} ml-3 mb-3`}>
              <thead>
                <tr className="text-center">
                  <th>년도/월</th>
                  {getAdjustedColumns("viral").map((header, index) => (
                    <th
                      key={header.field}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragOver={handleDragOver}
                      style={{
                        position: "relative",
                        cursor: "move",
                        width: header.width,
                      }}
                    >
                      <div
                        className={styles["tooltip-container"]}
                        onClick={() => {
                          if (
                            !["paybackRate", "paybackAmount", "total"].includes(
                              header.field
                            )
                          )
                            toggleTooltip(header.field, "viral");
                        }}
                      >
                        <span>{header.label}</span>
                        {!["paybackRate", "paybackAmount", "total"].includes(
                          header.field
                        ) && <IoFilterSharp />}
                        {tooltipOpen?.field === header.field &&
                          tooltipOpen?.table === "viral" && (
                            <div className={styles["tooltip"]}>
                              <button
                                onClick={() =>
                                  handleSort(
                                    header.field == "clientId"
                                      ? "netSales"
                                      : header.field,
                                    "asc",
                                    "viral"
                                  )
                                }
                                className={styles["tooltip-button"]}
                              >
                                오름차순
                              </button>
                              <button
                                onClick={() =>
                                  handleSort(
                                    header.field == "clientId"
                                      ? "netSales"
                                      : header.field,
                                    "desc",
                                    "viral"
                                  )
                                }
                                className={styles["tooltip-button"]}
                              >
                                내림차순
                              </button>
                            </div>
                          )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>합계</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="text-right">
                    {viralSum?.data.totalAdvCost?.toLocaleString() || 0}
                  </td>
                  <td className="text-right">- %</td>
                  <td className="text-right">
                    {viralSum?.data.totalPayVatExclude?.toLocaleString()}
                  </td>
                  <td className="text-right">
                    {viralSum?.data.totalPayVatInclude?.toLocaleString()}
                  </td>
                  <td className="text-right"></td>
                  <td className="text-right">
                    {viralSum?.data.totalPaybackAmount || ""}
                  </td>
                  <td className="text-right">
                    {viralSum?.data.grandTotalSum || ""}
                  </td>
                </tr>
                {viralData &&
                  Array.isArray(viralData) &&
                  viralData.map((item: IMediaViral, rowIndex) => (
                    <tr key={rowIndex}>
                      <td>
                        {item.monthDate
                          ? dayjs(item.monthDate).format("YYYY년 MM월")
                          : ""}
                      </td>
                      {columns.map((column) => (
                        <td
                          key={column.field}
                          style={
                            column.field === "media"
                              ? {
                                  backgroundColor: getMediaColor(
                                    item.media || ""
                                  ),
                                }
                              : undefined
                          }
                          className={
                            [
                              "marketerUid",
                              "marketerName",
                              "media",
                              "clientName",
                            ].includes(column.field)
                              ? "text-center"
                              : "text-right"
                          }
                        >
                          {(() => {
                            switch (column.field) {
                              case "marketerUid":
                                return item.marketerUid || "-";
                              case "marketerName":
                                return item.marketerName || "-";
                              case "media":
                                return item.media || "";
                              case "clientName":
                                return item.clientName || "-";
                              case "clientId":
                                return item.netSales?.toLocaleString() || 0;
                              case "advCost":
                                return item.advCost?.toLocaleString() || 0;
                              case "commissionRate":
                                return `${
                                  item.commissionRate?.toFixed(2) || "0.00"
                                } %`;
                              case "payVatExclude":
                                return (
                                  item.payVatExclude?.toLocaleString() || 0
                                );
                              case "payVatInclude":
                                return (
                                  item.payVatInclude?.toLocaleString() || 0
                                );
                              case "paybackRate":
                                return item.paybackRate
                                  ? `${
                                      item.paybackRate?.toFixed(2) || "0.00"
                                    } %`
                                  : "";
                              case "paybackAmount":
                                return item.paybackAmount
                                  ? item.paybackAmount?.toLocaleString() || 0
                                  : "";
                              case "total":
                                return item.total
                                  ? item.total?.toLocaleString() || 0
                                  : "";
                              default:
                                return "-";
                            }
                          })()}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}

      {(activeFilter === "전체" || activeFilter === "카드수수료") &&
        cardSum && (
          <>
            <div className="mb-3 ml-3">
              <h5>카드 수수료</h5>
            </div>
            <table className={`${styles["horizontal-table"]} ml-3 mb-3`}>
              <thead>
                <tr className="text-center">
                  <th>년도/월</th>
                  {getAdjustedColumns("card").map((header, index) => (
                    <th
                      key={header.field}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragOver={handleDragOver}
                      style={{
                        position: "relative",
                        cursor: "move",
                        width: header.width,
                      }}
                    >
                      <div
                        className={styles["tooltip-container"]}
                        onClick={() => {
                          if (
                            ![
                              "paybackRate",
                              "paybackAmount",
                              "total",
                              "clientName",
                            ].includes(header.field)
                          ) {
                            toggleTooltip(header.field, "card");
                          }
                        }}
                      >
                        <span>{header.label}</span>
                        {![
                          "paybackRate",
                          "paybackAmount",
                          "total",
                          "clientName",
                        ].includes(header.field) && <IoFilterSharp />}
                        {tooltipOpen?.field === header.field &&
                          tooltipOpen?.table === "card" && (
                            <div className={styles["tooltip"]}>
                              <button
                                onClick={() =>
                                  handleSort(
                                    header.field == "clientId"
                                      ? "chargeVatInclude"
                                      : header.field == "advCost"
                                      ? "chargeVatExclude"
                                      : header.field,
                                    "asc",
                                    "card"
                                  )
                                }
                                className={styles["tooltip-button"]}
                              >
                                오름차순
                              </button>
                              <button
                                onClick={() =>
                                  handleSort(
                                    header.field == "clientId"
                                      ? "chargeVatInclude"
                                      : header.field == "advCost"
                                      ? "chargeVatExclude"
                                      : header.field,
                                    "desc",
                                    "card"
                                  )
                                }
                                className={styles["tooltip-button"]}
                              >
                                내림차순
                              </button>
                            </div>
                          )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr
                  className="text-center"
                  style={{ backgroundColor: "#666666", color: "white" }}
                >
                  <td>합계</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="text-right">
                    {cardSum.totalChargeVatInclude?.toLocaleString() || 0}
                  </td>
                  <td className="text-right">
                    {cardSum.totalChargeVatExclude?.toLocaleString() || 0}
                  </td>
                  <td className="text-right">- %</td>
                  <td className="text-right">
                    {cardSum.totalPayVatExclude?.toLocaleString() || 0}
                  </td>
                  <td className="text-right">
                    {cardSum.totalPayVatInclude?.toLocaleString() || 0}
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                {cardData &&
                  Array.isArray(cardData) &&
                  cardData.map((item: ICard, rowIndex) => (
                    <tr key={rowIndex} className="text-center">
                      <td>
                        {item.monthDate
                          ? dayjs(item.monthDate).format("YYYY년 MM월")
                          : ""}
                      </td>
                      {columns.map((column) => (
                        <td
                          key={column.field}
                          style={
                            column.field === "media"
                              ? {
                                  backgroundColor: getMediaColor(
                                    item.media || ""
                                  ),
                                }
                              : undefined
                          }
                          className={
                            [
                              "marketerUid",
                              "marketerName",
                              "media",
                              "clientName",
                            ].includes(column.field)
                              ? "text-center"
                              : "text-right"
                          }
                        >
                          {(() => {
                            switch (column.field) {
                              case "marketerUid":
                                return item.marketerUid || "-";
                              case "marketerName":
                                return item.marketerName || "-";
                              case "media":
                                return item.media || "";
                              case "clientName":
                                return "";
                              case "clientId":
                                return (
                                  item.chargeVatInclude?.toLocaleString() || 0
                                );
                              case "advCost":
                                return (
                                  item.chargeVatExclude?.toLocaleString() || 0
                                );
                              case "commissionRate":
                                return `${
                                  item.commissionRate?.toFixed(2) || "0.00"
                                } %`;
                              case "payVatExclude":
                                return (
                                  item.payVatExclude?.toLocaleString() || "0"
                                );
                              case "payVatInclude":
                                return (
                                  item.payVatInclude?.toLocaleString() || "0"
                                );
                              case "paybackRate":
                                return item.paybackRate
                                  ? `${
                                      item.paybackRate?.toFixed(2) || "0.00"
                                    } %`
                                  : "";
                              case "paybackAmount":
                                return item.paybackAmount
                                  ? item.paybackAmount?.toLocaleString() || "0"
                                  : "";
                              case "total":
                                return item.total
                                  ? item.total?.toLocaleString() || "0"
                                  : "";
                              default:
                                return "-";
                            }
                          })()}
                        </td>
                      ))}
                    </tr>
                  ))}
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
