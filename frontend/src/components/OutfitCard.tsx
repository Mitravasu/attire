import { useState } from 'react';
import { Outfit } from 'src/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faEdit,
	faTrash,
	faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';

interface OutfitCardProps {
	outfit: Outfit;
	onEdit: (outfit: Outfit) => void;
	onDelete: (id: number) => void;
}

export default function OutfitCard({
	outfit,
	onEdit,
	onDelete,
}: OutfitCardProps) {
	const [isHovered, setIsHovered] = useState(false);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	return (
		<div
			className='border-2 border-white rounded-lg backdrop-blur-md bg-black bg-opacity-20 overflow-hidden transition-all duration-300 hover:bg-opacity-30 hover:shadow-lg'
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}>
			{/* Header with outfit name and actions */}
			<div className='p-4 border-b border-gray-600 flex justify-between items-start'>
				<div className='flex-1 min-w-0'>
					<h3 className='text-lg font-semibold text-white truncate mb-1'>
						{outfit.name}
					</h3>
					<div className='flex items-center text-sm text-gray-300'>
						<FontAwesomeIcon
							icon={faCalendarAlt}
							className='mr-1'
						/>
						<span>Created {formatDate(outfit.createdAt)}</span>
					</div>
				</div>

				<div
					className={`flex gap-2 transition-opacity duration-200 ${
						isHovered ? 'opacity-100' : 'opacity-0'
					}`}>
					<button
						onClick={() => onEdit(outfit)}
						className='p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'
						title='Edit outfit'>
						<FontAwesomeIcon icon={faEdit} />
					</button>
					<button
						onClick={() => onDelete(outfit.id)}
						className='p-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors'
						title='Delete outfit'>
						<FontAwesomeIcon icon={faTrash} />
					</button>
				</div>
			</div>

			{/* Items grid */}
			<div className='p-4'>
				<div className='flex items-center justify-between mb-3'>
					<span className='text-sm text-gray-300'>
						{outfit.items.length}{' '}
						{outfit.items.length === 1 ? 'item' : 'items'}
					</span>
				</div>

				{outfit.items.length === 0 ? (
					<div className='text-center py-8 text-gray-400'>
						<p>No items in this outfit</p>
					</div>
				) : (
					<div className='grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto'>
						{outfit.items.slice(0, 6).map((item) => (
							<div
								key={item.id}
								className='aspect-square relative group'>
								<div className='w-full h-full rounded-md overflow-hidden border border-gray-600'>
									<img
										src={`${import.meta.env.VITE_API_URL}${
											item.frontImgUrl
										}`}
										alt={item.title}
										className='w-full h-full object-cover'
									/>
								</div>
								{/* Item info tooltip on hover */}
								<div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity'>
									{item.title}
								</div>
							</div>
						))}
						{/* Show count if more than 6 items */}
						{outfit.items.length > 6 && (
							<div className='aspect-square flex items-center justify-center bg-gray-800 border border-gray-600 rounded-md text-gray-300 text-sm font-medium'>
								+{outfit.items.length - 6} more
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
