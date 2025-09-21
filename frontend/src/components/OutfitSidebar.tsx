import { useState } from 'react';
import { Outfit, DraggedOutfit } from '../types';
import Pagination from './Pagination';
import { getImageUrl } from '../utils/api';

interface OutfitSidebarProps {
	outfits: Outfit[];
	totalCount: number;
	currentPage: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
	onDragStart?: (dragData: DraggedOutfit) => void;
	isLoading?: boolean;
}

interface OutfitItemProps {
	outfit: Outfit;
	onDragStart?: (dragData: DraggedOutfit) => void;
}

function OutfitItem({ outfit, onDragStart }: OutfitItemProps) {
	const handleDragStart = (e: React.DragEvent) => {
		const dragData: DraggedOutfit = {
			outfit,
			sourceType: 'sidebar',
		};

		e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
		e.dataTransfer.effectAllowed = 'copy';

		if (onDragStart) {
			onDragStart(dragData);
		}
	};

	return (
		<div
			className='bg-gray-700 rounded-lg p-3 cursor-move hover:bg-gray-600 transition-colors group border border-gray-600 hover:border-gray-500'
			draggable
			onDragStart={handleDragStart}>
			<div className='flex items-start space-x-3'>
				{/* Outfit Preview */}
				<div className='flex-shrink-0'>
					<div className='flex space-x-1'>
						{outfit.items.slice(0, 2).map((item) => (
							<div
								key={item.id}
								className='w-10 h-10 rounded-sm bg-gray-600 bg-cover bg-center border border-gray-500'
								style={{
									backgroundImage: `url(${getImageUrl(
										item.frontImgUrl
									)})`,
								}}
								title={item.title}
							/>
						))}
						{outfit.items.length > 2 && (
							<div className='w-10 h-10 rounded-sm bg-gray-600 border border-gray-500 flex items-center justify-center text-xs text-gray-300'>
								+{outfit.items.length - 2}
							</div>
						)}
					</div>
				</div>

				{/* Outfit Info */}
				<div className='flex-1 min-w-0'>
					<h3 className='text-white font-medium text-sm line-clamp-2 mb-1'>
						{outfit.name}
					</h3>
					<p className='text-gray-400 text-xs'>
						{outfit.items.length} item
						{outfit.items.length !== 1 ? 's' : ''}
					</p>

					{/* Item Types */}
					<div className='mt-2'>
						<div className='flex flex-wrap gap-1'>
							{Array.from(
								new Set(outfit.items.map((item) => item.type))
							)
								.slice(0, 3)
								.map((type) => (
									<span
										key={type}
										className='px-1.5 py-0.5 bg-gray-600 text-gray-300 text-xs rounded'>
										{type}
									</span>
								))}
						</div>
					</div>
				</div>

				{/* Drag Handle */}
				<div className='flex-shrink-0 text-gray-400 group-hover:text-gray-300 transition-colors'>
					<svg
						className='w-4 h-4'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M4 8h16M4 16h16'
						/>
					</svg>
				</div>
			</div>
		</div>
	);
}

export default function OutfitSidebar({
	outfits,
	totalCount,
	currentPage,
	itemsPerPage,
	onPageChange,
	onDragStart,
	isLoading = false,
}: OutfitSidebarProps) {
	const [searchTerm, setSearchTerm] = useState('');

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

	return (
		<div className='w-80 bg-gray-800 border-l border-gray-600 flex flex-col h-full'>
			{/* Header */}
			<div className='p-4 border-b border-gray-600'>
				<h2 className='text-white text-lg font-semibold mb-3'>
					Available Outfits
				</h2>

				{/* Search */}
				<div className='relative'>
					<input
						type='text'
						placeholder='Search outfits...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
					/>
					<svg
						className='absolute right-3 top-2.5 h-4 w-4 text-gray-400'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
						/>
					</svg>
				</div>
			</div>

			{/* Outfit List */}
			<div className='flex-1 overflow-y-auto p-4'>
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

			{/* Pagination */}
			{!searchTerm && totalCount > itemsPerPage && (
				<div className='p-4 border-t border-gray-600'>
					<Pagination
						currentPage={currentPage}
						totalPages={Math.ceil(totalCount / itemsPerPage)}
						totalItems={totalCount}
						itemsPerPage={itemsPerPage}
						onPageChange={onPageChange}
						hasNext={
							currentPage < Math.ceil(totalCount / itemsPerPage)
						}
						hasPrev={currentPage > 1}
					/>
				</div>
			)}

			{/* Instructions */}
			<div className='p-4 border-t border-gray-600 bg-gray-750'>
				<p className='text-gray-400 text-xs text-center'>
					Drag outfits to days to plan your week
				</p>
			</div>
		</div>
	);
}
