import { useEffect, useState } from 'react';
import { Outfit, DraggedOutfit } from '../types';
import TextInput from './TextInput';
import OutfitItem from './OutfitItem';
import SmallPagination from './SmallPagination';
import { getOutfits } from 'src/utils/api';

interface OutfitSidebarProps {
	onDragStart?: (dragData: DraggedOutfit) => void;
}

export default function OutfitSidebar({ onDragStart }: OutfitSidebarProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [outfits, setOutfits] = useState<Outfit[]>([]);
	const [allOutfits, setAllOutfits] = useState<Outfit[]>([]);
	const [filteredOutfits, setFilteredOutfits] = useState<Outfit[]>([]);
	const [totalOutfits, setTotalOutfits] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;

	// Initial load
	useEffect(() => {
		loadAllOutfits();
	}, []);

	// Reset to page 1 when search term changes
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm]);

	// Update filtered outfits when search term or allOutfits changes
	useEffect(() => {
		if (searchTerm) {
			const filtered = allOutfits.filter(
				(outfit) =>
					outfit.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					outfit.items.some(
						(item) =>
							item.title
								.toLowerCase()
								.includes(searchTerm.toLowerCase()) ||
							item.tags.some((tag) =>
								tag
									.toLowerCase()
									.includes(searchTerm.toLowerCase())
							)
					)
			);
			setFilteredOutfits(filtered);
		} else {
			setFilteredOutfits([]);
		}
	}, [searchTerm, allOutfits]);

	// Update displayed outfits when page changes or filtered results change
	useEffect(() => {
		if (searchTerm) {
			// When searching, show paginated search results
			const startIndex = (currentPage - 1) * itemsPerPage;
			const endIndex = startIndex + itemsPerPage;
			const paginatedResults = filteredOutfits.slice(
				startIndex,
				endIndex
			);
			setOutfits(paginatedResults);
		} else {
			// When not searching, show paginated results from server
			loadOutfits(currentPage);
		}
	}, [currentPage, searchTerm, filteredOutfits]);

	// Load all outfits for search functionality
	const loadAllOutfits = async () => {
		try {
			setIsLoading(true);
			// Load all outfits by requesting a very high limit
			const result = await getOutfits(1, 10000);
			setAllOutfits(result.outfits);
			setTotalOutfits(result.total);
		} catch (error) {
			console.error('Error loading all outfits:', error);
		} finally {
			setIsLoading(false);
		}
	};

	// Load paginated outfits for non-search display
	const loadOutfits = async (page: number = 1) => {
		try {
			const result = await getOutfits(page, itemsPerPage);
			setOutfits(result.outfits);
		} catch (error) {
			console.error('Error loading outfits:', error);
		}
	};

	// Calculate pagination values
	const totalItems = searchTerm ? filteredOutfits.length : totalOutfits;
	const totalPages = Math.ceil(totalItems / itemsPerPage);

	const handlePreviousPage = () => {
		setCurrentPage((prev) => Math.max(1, prev - 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prev) => Math.min(totalPages, prev + 1));
	};

	return (
		<div className='w-80 bg-gray-200 shadow-md flex flex-col h-full rounded-md'>
			{/* Header */}
			<div className='px-2 pt-2 space-y-1'>
				<h2 className='text-lg font-semibold'>Available Outfits</h2>
				<p className='text-gray-400 text-sm'>
					Drag outfits to days to plan your week
				</p>

				{/* Search */}
				<div className='relative'>
					<TextInput
						id='search-outfits'
						value={searchTerm}
						handleInputChange={(e) => setSearchTerm(e.target.value)}
						placeholder='Search outfits...'
					/>
				</div>
			</div>
			{/* Outfit List */}
			<div className='flex-1 overflow-y-auto py-3 px-2'>
				{isLoading ? (
					<div className='flex items-center justify-center h-32'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
					</div>
				) : outfits.length === 0 ? (
					<div className='text-center text-gray-400 py-8'>
						{searchTerm
							? 'No outfits match your search'
							: 'No outfits available'}
					</div>
				) : (
					<div className='space-y-3'>
						{outfits.map((outfit) => (
							<OutfitItem
								key={outfit.id}
								outfit={outfit}
								onDragStart={onDragStart}
							/>
						))}
					</div>
				)}
			</div>

			<div className='w-full py-2 flex justify-center'>
				{/* Pagination */}
				{totalItems > itemsPerPage && (
					<SmallPagination
						handlePreviousPage={handlePreviousPage}
						currentPage={currentPage}
						totalPages={totalPages}
						handleNextPage={handleNextPage}
					/>
				)}
			</div>
		</div>
	);
}
