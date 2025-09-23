import { Outfit, DraggedOutfit, WeekDay, InventoryItem } from 'src/types';
import { getImageUrl } from 'src/utils/api';
import { useState } from 'react';

export default function PlannerOutfitCard({
	onDragStart,
	day,
	onRemoveOutfit,
}: {
	day: WeekDay;
	onRemoveOutfit: (entryId: number) => void;
	onDragStart?: (dragData: DraggedOutfit) => void;
}) {
	const [hoveredItem, setHoveredItem] = useState<InventoryItem | null>(null);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const handleOutfitDragStart = (
		e: React.DragEvent,
		outfit: Outfit,
		entryId: number
	) => {
		const dragData: DraggedOutfit = {
			outfit,
			sourceType: 'day',
			sourceDate: day.date,
		};

		e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
		e.dataTransfer.effectAllowed = 'move';

		if (onDragStart) {
			onDragStart(dragData);
		}

		// Store entry ID for removal
		e.dataTransfer.setData('entryId', entryId.toString());
	};

	const handleRemoveOutfit = (entryId: number) => {
		onRemoveOutfit(entryId);
	};

	const handleItemMouseEnter = (item: InventoryItem, e: React.MouseEvent) => {
		setHoveredItem(item);
		setMousePosition({ x: e.clientX, y: e.clientY });
	};

	const handleItemMouseMove = (e: React.MouseEvent) => {
		setMousePosition({ x: e.clientX, y: e.clientY });
	};

	const handleItemMouseLeave = () => {
		setHoveredItem(null);
	};

	return (
		<div className='space-y-2'>
			{day.outfits.map((outfit) => (
				<div
					key={`${day.date}-${outfit.id}`}
					className='bg-white rounded-lg p-3 cursor-move hover:shadow-lg shadow-md transition-colors group'
					draggable
					onDragStart={(e) =>
						handleOutfitDragStart(
							e,
							outfit,
							(outfit as any).entryId
						)
					}>
					<div className='flex justify-between items-start'>
						<div className='flex-1'>
							<h4 className='font-medium text-sm mb-1 line-clamp-1'>
								{outfit.name}
							</h4>
							<p className='text-xs'>
								{outfit.items.length} item
								{outfit.items.length !== 1 ? 's' : ''}
							</p>
							{(outfit as any).notes && (
								<p className=' text-xs mt-1 line-clamp-2'>
									{(outfit as any).notes}
								</p>
							)}
						</div>
						<button
							onClick={() =>
								handleRemoveOutfit((outfit as any).entryId)
							}
							className='opacity-0 group-hover:opacity-100 text-white hover:bg-red-700 transition-opacity bg-red-600 font-bold p-1 rounded-full cursor-pointer'
							title='Remove outfit'>
							<svg
								className='w-4 h-4'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M6 18L18 6M6 6l12 12'
								/>
							</svg>
						</button>
					</div>

					{/* Outfit Items Preview */}
					<div className='flex flex-col p-2 space-y-1 items-center overflow-x-auto'>
						{outfit.items.slice(0, 4).map((item) => (
							<div
								key={item.id}
								className='flex-shrink-0 w-20 h-20 rounded-sm bg-gray-600 bg-cover bg-center cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all'
								style={{
									backgroundImage: `url(${getImageUrl(
										item.frontImgUrl
									)})`,
								}}
								title={item.title}
								onMouseEnter={(e) =>
									handleItemMouseEnter(item, e)
								}
								onMouseMove={handleItemMouseMove}
								onMouseLeave={handleItemMouseLeave}
							/>
						))}
						{outfit.items.length > 3 && (
							<div className='flex-shrink-0 w-8 h-8 rounded-sm bg-gray-600 flex items-center justify-center text-xs text-gray-300'>
								+{outfit.items.length - 4}
							</div>
						)}
					</div>
				</div>
			))}

			{/* Image Hover Preview */}
			{hoveredItem && (
				<div
					className='fixed z-50 pointer-events-none'
					style={{
						left: mousePosition.x + 10,
						top: mousePosition.y + 10,
					}}>
					<div className='bg-white rounded-lg shadow-xl border border-gray-200 p-2 max-w-xs'>
						<img
							src={getImageUrl(hoveredItem.frontImgUrl)}
							alt={hoveredItem.title}
							className='w-64 h-64 object-cover rounded-md'
						/>
						<div className='mt-2 p-1'>
							<h4 className='font-medium text-sm text-gray-900 line-clamp-2'>
								{hoveredItem.title}
							</h4>
							<p className='text-xs text-gray-600 mt-1'>
								{hoveredItem.type} • {hoveredItem.color}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
