import { useState } from 'react';
import { WeekDay, Outfit, DraggedOutfit } from '../types';
import PlannerOutfitCard from './PlannerOutfitCard';

interface WeekViewProps {
	weekDays: WeekDay[];
	onDropOutfit: (date: string, outfit: Outfit, notes?: string) => void;
	onRemoveOutfit: (entryId: number) => void;
	onDragStart?: (dragData: DraggedOutfit) => void;
	isDragging: boolean;
	selectedDays: Set<string>;
	onDaySelection: (date: string, isSelected: boolean) => void;
}

interface DayColumnProps {
	day: WeekDay;
	onDropOutfit: (date: string, outfit: Outfit, notes?: string) => void;
	onRemoveOutfit: (entryId: number) => void;
	onDragStart?: (dragData: DraggedOutfit) => void;
	isDragging: boolean;
	isSelected: boolean;
	onDaySelection: (date: string, isSelected: boolean) => void;
}

function DayColumn({
	day,
	onDropOutfit,
	onRemoveOutfit,
	onDragStart,
	isDragging,
	isSelected,
	onDaySelection,
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

	return (
		<div className='flex-1 h-full flex flex-col'>
			{/* Day Header */}
			<div
				className={`p-4 text-center flex-shrink-0 shadow-md ${
					day.isToday ? 'bg-blue-600 text-white' : 'bg-gray-200'
				}`}>
				<div className='flex items-center justify-center mb-2'>
					<input
						type='checkbox'
						checked={isSelected}
						onChange={(e) =>
							onDaySelection(day.date, e.target.checked)
						}
						className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer'
						title='Select for packing list'
					/>
				</div>
				<div className='font-semibold text-sm uppercase tracking-wide'>
					{day.dayName}
				</div>
				<div className='text-lg font-bold mt-1'>{day.dayNumber}</div>
			</div>

			{/* Drop Zone */}
			<div
				className={`flex-1 transition-colors duration-200 overflow-y-auto p-3 inset-shadow-sm ${
					isDropZone ? 'bg-blue-500/20' : 'bg-gray-200'
				} ${isDragging ? 'border-dashed' : ''}`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}>
				{day.outfits.length === 0 ? (
					<div className='flex items-center justify-center h-full text-gray-400 text-sm'>
						{isDragging ? 'Drop outfit here' : 'No outfits planned'}
					</div>
				) : (
					<PlannerOutfitCard
						day={day}
						onRemoveOutfit={onRemoveOutfit}
						onDragStart={onDragStart}
					/>
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
	selectedDays,
	onDaySelection,
}: WeekViewProps) {
	return (
		<div className='bg-gray-200 rounded-lg overflow-hidden flex-1 min-h-0'>
			<div className='flex h-full'>
				{weekDays.map((day) => (
					<DayColumn
						key={day.date}
						day={day}
						onDropOutfit={onDropOutfit}
						onRemoveOutfit={onRemoveOutfit}
						onDragStart={onDragStart}
						isDragging={isDragging}
						isSelected={selectedDays.has(day.date)}
						onDaySelection={onDaySelection}
					/>
				))}
			</div>
		</div>
	);
}
