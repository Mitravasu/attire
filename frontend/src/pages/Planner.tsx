import { useState, useEffect } from 'react';
import { WeekDay, Outfit, DraggedOutfit, PlannerEntry } from '../types';
import WeekView from '../components/WeekView';
import OutfitSidebar from '../components/OutfitSidebar';
import {
	getCurrentWeekDates,
	getWeekDateRange,
	getNextWeek,
	getPreviousWeek,
	formatDateForDisplay,
} from '../utils/dateUtils';
import {
	getPlannerEntries,
	createPlannerEntry,
	deletePlannerEntry,
	getOutfits,
} from '../utils/api';
import Button from '@components/Button';

export default function Planner() {
	const [weekDays, setWeekDays] = useState<WeekDay[]>(getCurrentWeekDates());
	const [currentPage, setCurrentPage] = useState(1);
	const [isDragging, setIsDragging] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const itemsPerPage = 10;

	// Load planner entries for the current week
	const loadPlannerEntries = async () => {
		try {
			const { startDate, endDate } = getWeekDateRange(weekDays);
			const entries = await getPlannerEntries(startDate, endDate);

			// Group entries by date
			const entriesByDate: Record<
				string,
				(PlannerEntry & { outfit: Outfit })[]
			> = {};
			entries.forEach((entry) => {
				if (!entriesByDate[entry.date]) {
					entriesByDate[entry.date] = [];
				}
				entriesByDate[entry.date].push(entry);
			});

			// Update week days with outfits
			setWeekDays((prev) =>
				prev.map((day) => ({
					...day,
					outfits:
						entriesByDate[day.date]?.map((entry) => ({
							...entry.outfit,
							notes: entry.notes,
							entryId: entry.id, // Add entry ID for removal
						})) || [],
				}))
			);
		} catch (error) {
			console.error('Error loading planner entries:', error);
		}
	};

	// Initial load
	useEffect(() => {
		const loadInitialData = async () => {
			setIsLoading(true);
			await loadPlannerEntries();
			setIsLoading(false);
		};

		loadInitialData();
	}, []);

	// Reload planner entries when week changes
	useEffect(() => {
		if (!isLoading) {
			loadPlannerEntries();
		}
	}, [weekDays[0].date]); // Trigger when the first day of the week changes

	// Handle outfit drop on a day
	const handleDropOutfit = async (
		date: string,
		outfit: Outfit,
		notes?: string
	) => {
		try {
			await createPlannerEntry(date, outfit.id, notes);
			await loadPlannerEntries(); // Reload to get the latest data
		} catch (error) {
			console.error('Error creating planner entry:', error);
			alert(
				'Failed to add outfit to the day. It might already be planned for this day.'
			);
		}
	};

	// Handle outfit removal
	const handleRemoveOutfit = async (entryId: number) => {
		try {
			await deletePlannerEntry(entryId);
			await loadPlannerEntries(); // Reload to get the latest data
		} catch (error) {
			console.error('Error removing planner entry:', error);
			alert('Failed to remove outfit from the day.');
		}
	};

	// Handle drag start
	const handleDragStart = (_dragData: DraggedOutfit) => {
		setIsDragging(true);
	};

	// Week navigation
	const handlePreviousWeek = () => {
		setWeekDays(getPreviousWeek(weekDays));
	};

	const handleNextWeek = () => {
		setWeekDays(getNextWeek(weekDays));
	};

	const handleToday = () => {
		setWeekDays(getCurrentWeekDates());
	};

	// Add drag end listener
	useEffect(() => {
		const handleGlobalDragEnd = () => {
			setIsDragging(false);
		};

		document.addEventListener('dragend', handleGlobalDragEnd);
		return () =>
			document.removeEventListener('dragend', handleGlobalDragEnd);
	}, []);

	if (isLoading) {
		return (
			<div className='flex flex-col h-screen bg-gray-900'>
				<div className='flex-1 flex items-center justify-center'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
						<p className='text-white text-lg'>Loading planner...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col h-full bg-white'>
			{/* Week Navigation */}
			<div className='px-6 py-4 shadow-md bg-gray-200'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-4'>
						<button
							onClick={handlePreviousWeek}
							className='p-2 text-white transition-colors rounded-full bg-gray-700 cursor-pointer'
							title='Previous week'>
							<svg
								className='w-5 h-5'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M15 19l-7-7 7-7'
								/>
							</svg>
						</button>

						<h1 className='text-xl font-semibold'>
							{formatDateForDisplay(weekDays[0].date)} -{' '}
							{formatDateForDisplay(weekDays[6].date)}
						</h1>

						<button
							onClick={handleNextWeek}
							className='p-2 text-white transition-colors rounded-full bg-gray-700 cursor-pointer'
							title='Next week'>
							<svg
								className='w-5 h-5'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M9 5l7 7-7 7'
								/>
							</svg>
						</button>
					</div>
					<Button label='Today' onClick={handleToday} />
				</div>
			</div>

			{/* Main Content */}
			<div className='flex-1 flex min-h-0 pt-2 space-x-3'>
				<div className='flex-1 flex flex-col min-h-0'>
					<WeekView
						weekDays={weekDays}
						onDropOutfit={handleDropOutfit}
						onRemoveOutfit={handleRemoveOutfit}
						onDragStart={handleDragStart}
						isDragging={isDragging}
					/>
				</div>
				<OutfitSidebar onDragStart={handleDragStart} />
			</div>

			{/* Drag overlay */}
			{isDragging && (
				<div className='fixed inset-0 pointer-events-none z-50 bg-black/20' />
			)}
		</div>
	);
}
