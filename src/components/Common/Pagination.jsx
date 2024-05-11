"use client";
import React, { useEffect } from "react";

const Pagination = ({ data, currentPage, setCurrentPage, perPageData }) => {
  const handleClick = (e) => {
    setCurrentPage(e);
  };

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(data?.length / perPageData); i++) {
    pageNumbers.push(i);
  }
  const handleprevPage = () => {
    let prevPage = currentPage - 1;
    setCurrentPage(prevPage);
  };
  const handlenextPage = () => {
    let nextPage = currentPage + 1;
    setCurrentPage(nextPage);
  };

  useEffect(() => {
    if (pageNumbers?.length && pageNumbers?.length < currentPage) {
      setCurrentPage(pageNumbers?.length);
    }
  }, [pageNumbers?.length, currentPage, setCurrentPage]);
  return (
    <>
      <div className="justify-end my-3">
        <div className="col-sm-auto">
          <ul className="pagination-block pagination pagination-separated justify-center">
            {currentPage <= 0 ? (
              <span
                style={{ cursor: "pointer" }}
                className="page-item pagination-prev disabled"
              >
                Previous
              </span>
            ) : (
              <li
                role={currentPage >= 1 ? "button" : ""}
                className={
                  currentPage >= 1 ? "page-item" : "page-item disabled"
                }
              >
                <span
                  style={{ cursor: "pointer" }}
                  className="page-link fs-2"
                  onClick={handleprevPage}
                >
                  Previous
                </span>
              </li>
            )}
            {pageNumbers.map((item, key) => (
              <React.Fragment key={key}>
                <li className="page-item" role={"button"}>
                  <span
                    className={
                      currentPage === item - 1
                        ? "page-link active fs-2"
                        : "page-link fs-2"
                    }
                    onClick={() => handleClick(item - 1)}
                  >
                    {item}
                  </span>
                </li>
              </React.Fragment>
            ))}
            {/* {<span> </span>}
            {'...'}
            {currentPage >= pageNumbers.length - 1 ? (
              <span
                style={{ cursor: 'pointer' }}
                className="page-item pagination-next disabled"
              >
                Next
              </span>
            ) : (
              <li
                role={currentPage <= 0 ? 'button' : ''}
                className={
                  currentPage >= 0 ? 'page-item' : 'page-item disabled'
                }
              >
                <span
                  style={{ cursor: 'pointer' }}
                  className="page-link fs-2"
                  onClick={handlenextPage}
                >
                  Next
                </span>
              </li>
            )} */}
            {/*  */}
            {currentPage >= pageNumbers.length - 1 ? (
              <span
                style={{ cursor: "pointer" }}
                className="page-item pagination-next disabled"
              >
                Next
              </span>
            ) : (
              <li
                role={currentPage <= 0 ? "button" : ""}
                className={
                  currentPage >= 0 ? "page-item" : "page-item disabled"
                }
              >
                <span
                  style={{ cursor: "pointer" }}
                  className="page-link fs-2"
                  onClick={handlenextPage}
                >
                  Next
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Pagination;
