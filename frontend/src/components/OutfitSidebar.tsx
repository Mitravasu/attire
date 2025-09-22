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
	const [totalOutfits, setTotalOutfits] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;

	// Initial load
	useEffect(() => {
		loadOutfits(currentPage);
	}, [currentPage]);

	// Load available outfits
	const loadOutfits = async (page: number = 1) => {
		try {
			setIsLoading(true);
			const result = await getOutfits(page, itemsPerPage);
			setOutfits(result.outfits);
			setTotalOutfits(result.total);
		} catch (error) {
			console.error('Error loading outfits:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const filteredOutfits = (outfits || []).filter(
		(outfit) =>
			outfit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			outfit.items.some(
				(item) =>
					item.title
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					item.tags.some((tag) =>
						tag.toLowerCase().includes(searchTerm.toLowerCase())
					)
			)
	);

	// Calculate pagination values
	const totalPages = Math.ceil(totalOutfits / itemsPerPage);

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
				) : filteredOutfits.length === 0 ? (
					<div className='text-center text-gray-400 py-8'>
						{searchTerm
							? 'No outfits match your search'
							: 'No outfits available'}
					</div>
				) : (
					<div className='space-y-3'>
						{filteredOutfits.map((outfit) => (
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
				{!searchTerm && totalOutfits > itemsPerPage && (
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
