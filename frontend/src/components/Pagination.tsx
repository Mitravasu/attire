import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faChevronLeft,
	faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	onPageChange: (page: number, newLimit?: number) => void;
	hasNext: boolean;
	hasPrev: boolean;
}

export default function Pagination({
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	onPageChange,
	hasNext,
	hasPrev,
}: PaginationProps) {
	const startItem = (currentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(currentPage * itemsPerPage, totalItems);

	// Generate page numbers to show
	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const maxPagesToShow = 7;

		if (totalPages <= maxPagesToShow) {
			// Show all pages if total pages is small
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Show first page
			pages.push(1);

			if (currentPage > 3) {
				pages.push('...');
			}

			// Show pages around current page
			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (currentPage < totalPages - 2) {
				pages.push('...');
			}

			// Show last page
			if (totalPages > 1) {
				pages.push(totalPages);
			}
		}

		return pages;
	};

	const pageNumbers = getPageNumbers();

	return (
		<div className='absolute bottom-2 flex space-x-10 justify-self-center items-center w-fit p-4 bg-black/40 text-white backdrop-blur-md rounded-xl text-md'>
			{/* Items count */}
			<div className='h-fit w-fit'>
				Showing {startItem}-{endItem} of {totalItems} items
			</div>

			{/* Pagination controls */}
			<div className='flex items-center space-x-2'>
				{/* Previous button */}
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={!hasPrev}
					className={`w-8 h-8 rounded-full transition-colors ${
						hasPrev
							? 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
							: 'hidden'
					}`}
					title='Previous page'>
					<FontAwesomeIcon icon={faChevronLeft} />
				</button>

				{/* Page numbers */}
				{pageNumbers.map((page, index) => (
					<div key={index}>
						{page === '...' ? (
							<span className='px-3 py-2 text-gray-400'>...</span>
						) : (
							<button
								onClick={() => onPageChange(page as number)}
								className={`h-8 w-8 rounded-full transition-colors ${
									page === currentPage
										? 'bg-blue-600 font-bold text-white'
										: 'bg-gray-700 hover:bg-gray-600 text-white cursor-pointer'
								}`}>
								{page}
							</button>
						)}
					</div>
				))}

				{/* Next button */}
				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={!hasNext}
					className={`w-8 h-8 rounded-full transition-colors ${
						hasNext
							? 'bg-gray-700 hover:bg-gray-600 text-white cursor-pointer'
							: 'hidden'
					}`}
					title='Next page'>
					<FontAwesomeIcon icon={faChevronRight} />
				</button>
			</div>

			{/* Items per page selector */}
			<div className='flex items-center space-x-2'>
				<span className=''>Items per page:</span>
				<select
					value={itemsPerPage}
					onChange={(e) => {
						// Reset to page 1 when changing items per page
						const newLimit = parseInt(e.target.value);
						onPageChange(1, newLimit);
					}}
					className='bg-white inset-shadow-sm text-black rounded-md px-2 py-1'>
					<option value={10}>10</option>
					<option value={20}>20</option>
					<option value={50}>50</option>
				</select>
			</div>
		</div>
	);
}
