import {
	faChevronLeft,
	faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function SmallPagination({
	startIndex,
	endIndex,
	filteredAvailableItems,
	handlePreviousPage,
	currentPage,
	totalPages,
	handleNextPage,
	totalItems,
}: {
	startIndex: number;
	totalItems: number;
	endIndex: number;
	filteredAvailableItems: any[];
	handlePreviousPage: () => void;
	currentPage: number;
	totalPages: number;
	handleNextPage: () => void;
}) {
	return (
		<div className='flex items-center gap-3'>
			{/* <span className='text-sm'>
				{startIndex + 1}-{Math.min(endIndex, totalItems)} of{' '}
				{totalItems}
			</span> */}
			<div className='flex items-center gap-1'>
				<button
					onClick={handlePreviousPage}
					disabled={currentPage === 1}
					className={`w-8 h-8 rounded-md flex items-center justify-center text-sm transition-colors ${
						currentPage === 1
							? 'bg-gray-700 text-gray-500 cursor-not-allowed'
							: 'bg-gray-700 text-white hover:bg-gray-600 cursor-pointer'
					}`}
					title='Previous page'>
					<FontAwesomeIcon icon={faChevronLeft} />
				</button>
				<span className='text-sm px-2'>
					{currentPage} / {totalPages}
				</span>
				<button
					onClick={handleNextPage}
					disabled={currentPage === totalPages}
					className={`w-8 h-8 rounded-md flex items-center justify-center text-sm transition-colors ${
						currentPage === totalPages
							? 'bg-gray-700 text-gray-500 cursor-not-allowed'
							: 'bg-gray-700 text-white hover:bg-gray-600 cursor-pointer'
					}`}
					title='Next page'>
					<FontAwesomeIcon icon={faChevronRight} />
				</button>
			</div>
		</div>
	);
}
