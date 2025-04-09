import axios from "axios";
import IOtherWork, { workType } from "../../common/models/otherWork/IOtherWork";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const workTypeLabels: Record<string, string> = {
  outside: "외근",
  content: "컨텐츠 제작",
  develop: "개발",
  recruit: "채용",
  etc: "기타",
};

const years = Array.from({ length: 6 }, (_, i) => dayjs().year() -1 + i); // 연도 범위 생성 (현재 연도 +/- 5)
const months = Array.from({ length: 12 }, (_, i) => i + 1); // 월 범위 생성
const currentYear = dayjs().year();
const currentMonth = dayjs().month() + 1;

const OtherWork: React.FC = () => {
  const [otherWorkData, setOtherWorkData] = useState<IOtherWork[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedWork, setSelectedWork] = useState<IOtherWork | null>(null);

  useEffect(() => {
    const getWorks = async () => {
      try {
        const response = await axios.get(
          `/otherWork/?year=${selectedYear}&month=${selectedMonth}`
        );
        console.log(response.data.body);
        setOtherWorkData(response.data.body);
      } catch (error) {
        console.error("Failed to fetch Work Data:", error);
      }
    };
    getWorks();
  }, []);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };

  const handleCheckboxChange = (work: IOtherWork) => {
    setSelectedWork((prev) => (prev?.uuid === work.uuid ? null : work));
  };

  const handleSaveClick = async () => {};
  const handleDeleteClick = async () => {};
  const handleCancelClick = async () => {};

  return (
    <div className="p-3">
      {/* 필터 */}
      <div className="mb-4">
        <label className="mr-2">기간</label>
        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="mr-2"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}년
            </option>
          ))}
        </select>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="mr-2"
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {month}월
            </option>
          ))}
        </select>
      </div>

      {/* 리스트 */}
      <div>
        <div className="table-full-width px-0 table-responsive">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>리스트</h5>
            <div>
              <button className="btn btn-primary mr-2">수정</button>
              <button className="btn btn-danger mr-2">삭제</button>
              <button className="btn btn-success mr-2">등록</button>
              <button className="btn btn-secondary">취소</button>
            </div>
          </div>
          <table className="table">
            <thead className="text-nowrap text-center">
              <th>선택</th>
              <th>업무종류</th>
              <th>진행일자</th>
              <th>장소</th>
              <th>내용</th>
            </thead>
            <tbody>
              {Array.isArray(otherWorkData) &&
                otherWorkData.map((row) => (
                  <tr className="text-nowrap text-center">
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedWork?.uuid === row.uuid}
                        onChange={() => handleCheckboxChange(row)}
                      />
                    </td>
                    <td>{workTypeLabels[row.workType] || row.workType}</td>
                    <td>{dayjs(row.workDate).format("YYYY-MM-DD")}</td>
                    <td>{row.location}</td>
                    <td>{row.content}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default OtherWork;
