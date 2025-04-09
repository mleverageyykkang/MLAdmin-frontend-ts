import React from "react";

interface PaginationProps {
  page: number; // 현재 페이지 번호
  totalCount: number; // 전체 항목 수
  setPage: (page: number) => void; // 페이지 변경 함수
  pageSize: number; // 한 페이지당 항목 수
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalCount,
  setPage,
  pageSize,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleClick = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];

    // 현재 페이지 기준으로 표시할 페이지 번호 계산
    const startPage = Math.floor((page - 1) / 10) * 10 + 1;
    const endPage = Math.min(startPage + 9, totalPages);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handleClick(i)}
          style={{
            margin: "0 5px",
            padding: "5px 10px",
            backgroundColor: i === page ? "#007BFF" : "#FFF",
            color: i === page ? "#FFF" : "#000",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "20px",
      }}
    >
      <button
        onClick={() => handleClick(page - 1)}
        disabled={page === 1}
        style={{
          margin: "0 5px",
          padding: "5px 10px",
          backgroundColor: "#FFF",
          color: "#000",
          border: "1px solid #ddd",
          borderRadius: "4px",
          cursor: page === 1 ? "not-allowed" : "pointer",
        }}
      >
        Prev
      </button>
      {renderPageNumbers()}
      <button
        onClick={() => handleClick(page + 1)}
        disabled={page === totalPages}
        style={{
          margin: "0 5px",
          padding: "5px 10px",
          backgroundColor: "#FFF",
          color: "#000",
          border: "1px solid #ddd",
          borderRadius: "4px",
          cursor: page === totalPages ? "not-allowed" : "pointer",
        }}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
