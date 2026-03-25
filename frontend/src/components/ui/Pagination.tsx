type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <nav aria-label="Pagination" className="pagination">
      <button
        className="pagination__button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange?.(currentPage - 1)}
        type="button"
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        className="pagination__button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange?.(currentPage + 1)}
        type="button"
      >
        Next
      </button>
    </nav>
  );
}
