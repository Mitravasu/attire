import { useState } from 'react';
import { WeekDay, Outfit, DraggedOutfit } from '../types';
import { getImageUrl } from '../utils/api';

interface WeekViewProps {
	weekDays: WeekDay[];
	onDropOutfit: (date: string, outfit: Outfit, notes?: string) => void;
	onRemoveOutfit: (entryId: number) => void;
	onDragStart?: (dragData: DraggedOutfit) => void;
	isDragging: boolean;
}

interface DayColumnProps {
	day: WeekDay;
	onDropOutfit: (date: string, outfit: Outfit, notes?: string) => void;
	onRemoveOutfit: (entryId: number) => void;
	onDragStart?: (dragData: DraggedOutfit) => void;
	isDragging: boolean;
}

function DayColumn({
	day,
	onDropOutfit,
	onRemoveOutfit,
	onDragStart,
	isDragging,
}: DayColumnProps) {
	const [isDropZone, setIsDropZone] = useState(false);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDropZone(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDropZone(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDropZone(false);

		try {
			const dragData = JSON.parse(
				e.dataTransfer.getData('text/plain')
			) as DraggedOutfit;
			onDropOutfit(day.date, dragData.outfit);
		} catch (error) {
			console.error('Error parsing dropped data:', error);
		}
	};

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

	return (
		<div className='flex-1 h-full flex flex-col'>
			{/* Day Header */}
			<div
				className={`p-4 text-center border-b border-gray-600 flex-shrink-0 ${
					day.isToday
						? 'bg-blue-600 text-white'
						: 'bg-gray-700 text-gray-200'
				}`}>
				<div className='font-semibold text-sm uppercase tracking-wide'>
					{day.dayName}
				</div>
				<div className='text-lg font-bold mt-1'>{day.dayNumber}</div>
			</div>

			{/* Drop Zone */}
			<div
				className={`flex-1 p-2 transition-colors duration-200 overflow-y-auto ${
					isDropZone
						? 'bg-blue-500/20 border-2 border-dashed border-blue-400'
						: 'bg-gray-800 border border-gray-600'
				} ${isDragging ? 'border-dashed border-gray-400' : ''}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}>
				{day.outfits.length === 0 ? (
					<div className='flex items-center justify-center h-full text-gray-400 text-sm'>
						{isDragging ? 'Drop outfit here' : 'No outfits planned'}
					</div>
				) : (
					<div className='space-y-2'>
						{day.outfits.map((outfit) => (
							<div
								key={`${day.date}-${outfit.id}`}
								className='bg-gray-700 rounded-lg p-3 cursor-move hover:bg-gray-600 transition-colors group'
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
										<h4 className='text-white font-medium text-sm mb-1 line-clamp-1'>
											{outfit.name}
										</h4>
										<p className='text-gray-300 text-xs'>
											{outfit.items.length} item
											{outfit.items.length !== 1
												? 's'
												: ''}
										</p>
										{(outfit as any).notes && (
											<p className='text-gray-400 text-xs mt-1 line-clamp-2'>
												{(outfit as any).notes}
											</p>
										)}
									</div>
									<button
										onClick={() =>
											handleRemoveOutfit(
												(outfit as any).entryId
											)
										}
										className='opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity ml-2 p-1'
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
								<div className='flex mt-2 space-x-1 overflow-x-auto'>
									{outfit.items.slice(0, 3).map((item) => (
										<div
											key={item.id}
											className='flex-shrink-0 w-8 h-8 rounded-sm bg-gray-600 bg-cover bg-center border border-gray-500'
											style={{
												backgroundImage: `url(${getImageUrl(
													item.frontImgUrl
												)})`,
											}}
											title={item.title}
										/>
									))}
									{outfit.items.length > 3 && (
										<div className='flex-shrink-0 w-8 h-8 rounded-sm bg-gray-600 border border-gray-500 flex items-center justify-center text-xs text-gray-300'>
											+{outfit.items.length - 3}
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default function WeekView({
	weekDays,
	onDropOutfit,
	onRemoveOutfit,
	onDragStart,
	isDragging,
}: WeekViewProps) {
	return (
		<div className='bg-gray-900 rounded-lg overflow-hidden flex-1 min-h-0'>
			<div className='flex h-full'>
				{weekDays.map((day) => (
					<DayColumn
						key={day.date}
						day={day}
						onDropOutfit={onDropOutfit}
						onRemoveOutfit={onRemoveOutfit}
						onDragStart={onDragStart}
						isDragging={isDragging}
					/>
				))}
			</div>
		</div>
	);
}
