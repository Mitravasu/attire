import { useState, useEffect } from 'react';
import {
	WeekDay,
	Outfit,
	DraggedOutfit,
	PlannerEntry,
	InventoryItem,
} from '../types';
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
	getImageUrl,
} from '../utils/api';
import Button from '@components/Button';

export default function Planner() {
	const [weekDays, setWeekDays] = useState<WeekDay[]>(getCurrentWeekDates());
	const [isDragging, setIsDragging] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
		// Keep selections when navigating - don't clear them
	};

	const handleNextWeek = () => {
		setWeekDays(getNextWeek(weekDays));
		// Keep selections when navigating - don't clear them
	};

	const handleToday = async () => {
		const currentWeek = getCurrentWeekDates();
		const isAlreadyOnCurrentWeek = weekDays[0].date === currentWeek[0].date;

		setWeekDays(currentWeek);

		// If we're already on the current week, we need to manually reload
		// the planner entries since the useEffect won't trigger
		if (isAlreadyOnCurrentWeek) {
			await loadPlannerEntries();
		}
		// Keep selections when navigating - don't clear them
	};

	// Handle day selection for PDF export
	const handleDaySelection = (date: string, isSelected: boolean) => {
		setSelectedDays((prev) => {
			const newSet = new Set(prev);
			if (isSelected) {
				newSet.add(date);
			} else {
				newSet.delete(date);
			}
			return newSet;
		});
	};

	// Get unique clothing items from selected days
	const getUniqueClothingItems = async () => {
		const uniqueItems = new Map<number, InventoryItem>();

		// First, collect items from currently visible week
		weekDays.forEach((day) => {
			if (selectedDays.has(day.date)) {
				day.outfits.forEach((outfit) => {
					outfit.items.forEach((item) => {
						uniqueItems.set(item.id, item);
					});
				});
			}
		});

		// For selected days not in current week, we need to fetch their data
		const selectedDatesNotInCurrentWeek = Array.from(selectedDays).filter(
			(date) => !weekDays.some((day) => day.date === date)
		);

		if (selectedDatesNotInCurrentWeek.length > 0) {
			try {
				// Get the date range for all selected dates
				const allSelectedDates = Array.from(selectedDays).sort();
				const startDate = allSelectedDates[0];
				const endDate = allSelectedDates[allSelectedDates.length - 1];

				// Fetch planner entries for the full date range
				const entries = await getPlannerEntries(startDate, endDate);

				// Add items from entries for selected dates not in current week
				entries.forEach((entry) => {
					if (selectedDatesNotInCurrentWeek.includes(entry.date)) {
						entry.outfit.items.forEach((item) => {
							uniqueItems.set(item.id, item);
						});
					}
				});
			} catch (error) {
				console.error('Error fetching data for selected dates:', error);
			}
		}

		return Array.from(uniqueItems.values());
	};

	// Get selected day data including days from other weeks
	const getSelectedDayData = async () => {
		const result: WeekDay[] = [];

		// Add days from current week
		weekDays.forEach((day) => {
			if (selectedDays.has(day.date)) {
				result.push(day);
			}
		});

		// For selected days not in current week, we need to fetch their data and create WeekDay objects
		const selectedDatesNotInCurrentWeek = Array.from(selectedDays).filter(
			(date) => !weekDays.some((day) => day.date === date)
		);

		if (selectedDatesNotInCurrentWeek.length > 0) {
			try {
				// Get the date range for all selected dates
				const allSelectedDates = Array.from(selectedDays).sort();
				const startDate = allSelectedDates[0];
				const endDate = allSelectedDates[allSelectedDates.length - 1];

				// Fetch planner entries for the full date range
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

				// Create WeekDay objects for selected dates not in current week
				selectedDatesNotInCurrentWeek.forEach((date) => {
					const dateObj = new Date(date);
					const dayName = dateObj.toLocaleDateString('en-US', {
						weekday: 'long',
					});
					const dayNumber = dateObj.getDate();

					const weekDay: WeekDay = {
						date,
						dayName,
						dayNumber,
						isToday:
							date === new Date().toISOString().split('T')[0],
						outfits:
							entriesByDate[date]?.map((entry) => ({
								...entry.outfit,
								notes: entry.notes,
								entryId: entry.id,
							})) || [],
					};

					result.push(weekDay);
				});
			} catch (error) {
				console.error('Error fetching data for selected dates:', error);
			}
		}

		// Sort by date
		result.sort((a, b) => a.date.localeCompare(b.date));
		return result;
	};

	// Helper function to load image as base64
	const loadImageAsBase64 = (url: string): Promise<string> => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = () => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				if (!ctx) {
					reject(new Error('Could not get canvas context'));
					return;
				}

				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);

				try {
					const dataURL = canvas.toDataURL('image/jpeg', 0.7);
					resolve(dataURL);
				} catch (error) {
					reject(error);
				}
			};
			img.onerror = () => reject(new Error('Failed to load image'));
			img.src = url;
		});
	};

	// Generate PDF export
	const handleExportPDF = async () => {
		if (selectedDays.size === 0) {
			alert('Please select at least one day to export.');
			return;
		}

		setIsGeneratingPDF(true);
		try {
			// Dynamic import to avoid loading jsPDF until needed
			const jsPDF = (await import('jspdf')).default;

			const pdf = new jsPDF();
			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();
			const margin = 15; // Reduced margin
			let yPosition = margin;

			// Title
			pdf.setFontSize(16);
			pdf.setFont('helvetica', 'bold');
			pdf.text('Packing List', pageWidth / 2, yPosition, {
				align: 'center',
			});
			yPosition += 20;

			// Get selected days and their outfits
			const selectedDayData = await getSelectedDayData();
			const uniqueItems = await getUniqueClothingItems();

			// Packing List Section with Images
			pdf.setFontSize(12);
			pdf.setFont('helvetica', 'bold');
			pdf.text('Unique Clothing Items:', margin, yPosition);
			yPosition += 12;

			// Calculate grid layout for items (3 columns)
			const itemsPerRow = 3;
			const itemWidth = (pageWidth - margin * 2) / itemsPerRow;
			const itemHeight = 50; // Reduced height for more compact layout
			const imageSize = 35; // Slightly smaller image
			const startYForItems = yPosition;

			// Calculate how many rows fit on the first page
			const availableHeight = pageHeight - startYForItems - margin;
			const maxRowsPerPage = Math.floor(availableHeight / itemHeight);

			let currentPage = 1;
			let currentRowOnPage = 0;

			for (let i = 0; i < uniqueItems.length; i++) {
				const item = uniqueItems[i];
				const col = i % itemsPerRow;

				// Check if we need a new page (start of a new row that won't fit)
				if (col === 0 && currentRowOnPage >= maxRowsPerPage) {
					pdf.addPage();
					currentPage++;
					yPosition = margin;
					currentRowOnPage = 0;
				}

				const x = margin + col * itemWidth;
				const y =
					(currentPage === 1 ? startYForItems : margin) +
					currentRowOnPage * itemHeight;

				await addItemToPDF(pdf, item, x, y, imageSize, itemWidth);

				// Move to next row if this was the last column
				if (col === itemsPerRow - 1) {
					currentRowOnPage++;
				}
			}

			// Update yPosition for the calendar section
			const totalItemRows = Math.ceil(uniqueItems.length / itemsPerRow);
			const remainingRowsOnCurrentPage =
				totalItemRows - maxRowsPerPage * (currentPage - 1);

			if (currentPage === 1) {
				yPosition =
					startYForItems +
					Math.min(remainingRowsOnCurrentPage, maxRowsPerPage) *
						itemHeight +
					15;
			} else {
				yPosition =
					margin + remainingRowsOnCurrentPage * itemHeight + 15;
			}

			// Calendar Section - Start on new page
			pdf.addPage();
			yPosition = margin;

			pdf.setFontSize(12);
			pdf.setFont('helvetica', 'bold');
			pdf.text('Daily Outfits:', margin, yPosition);
			yPosition += 20;

			// Table setup
			const tableStartY = yPosition;
			const tableWidth = pageWidth - margin * 2;
			const dateColumnWidth = tableWidth * 0.25;
			const outfitColumnWidth = tableWidth * 0.75;
			const rowHeight = 20;
			let currentTableY = tableStartY;

			// Table headers
			pdf.setFontSize(10);
			pdf.setFont('helvetica', 'bold');

			// Draw header background
			pdf.setFillColor(240, 240, 240);
			pdf.rect(margin, currentTableY, tableWidth, rowHeight, 'F');

			// Draw header borders
			pdf.setDrawColor(0, 0, 0);
			pdf.rect(margin, currentTableY, dateColumnWidth, rowHeight);
			pdf.rect(
				margin + dateColumnWidth,
				currentTableY,
				outfitColumnWidth,
				rowHeight
			);

			// Header text
			pdf.text('Date', margin + 5, currentTableY + 12);
			pdf.text(
				'Outfits & Items',
				margin + dateColumnWidth + 5,
				currentTableY + 12
			);
			currentTableY += rowHeight;

			for (const day of selectedDayData) {
				// Format full date
				const dateObj = new Date(day.date);
				const fullDate = dateObj.toLocaleDateString('en-US', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				});

				// Calculate needed height for this day's content
				let dayContentHeight = rowHeight; // minimum for date cell
				if (day.outfits.length === 0) {
					dayContentHeight = Math.max(dayContentHeight, rowHeight);
				} else {
					let outfitContentHeight = 0;
					day.outfits.forEach((outfit) => {
						outfitContentHeight += 15; // outfit name
						outfitContentHeight += outfit.items.length * 12; // items
						outfitContentHeight += 5; // spacing after outfit
					});
					dayContentHeight = Math.max(
						dayContentHeight,
						outfitContentHeight + 10
					);
				}

				// Check if we need a new page
				if (currentTableY + dayContentHeight > pageHeight - margin) {
					pdf.addPage();
					currentTableY = margin;

					// Redraw table headers on new page
					pdf.setFillColor(240, 240, 240);
					pdf.rect(margin, currentTableY, tableWidth, rowHeight, 'F');
					pdf.setDrawColor(0, 0, 0);
					pdf.rect(margin, currentTableY, dateColumnWidth, rowHeight);
					pdf.rect(
						margin + dateColumnWidth,
						currentTableY,
						outfitColumnWidth,
						rowHeight
					);
					pdf.setFontSize(10);
					pdf.setFont('helvetica', 'bold');
					pdf.text('Date', margin + 5, currentTableY + 12);
					pdf.text(
						'Outfits & Items',
						margin + dateColumnWidth + 5,
						currentTableY + 12
					);
					currentTableY += rowHeight;
				}

				// Draw table cell borders
				pdf.setDrawColor(0, 0, 0);
				pdf.rect(
					margin,
					currentTableY,
					dateColumnWidth,
					dayContentHeight
				);
				pdf.rect(
					margin + dateColumnWidth,
					currentTableY,
					outfitColumnWidth,
					dayContentHeight
				);

				// Date cell content
				pdf.setFontSize(9);
				pdf.setFont('helvetica', 'bold');
				const dateLines = pdf.splitTextToSize(
					fullDate,
					dateColumnWidth - 10
				);
				pdf.text(dateLines, margin + 5, currentTableY + 12);

				// Outfit cell content
				let outfitY = currentTableY + 10;
				const outfitX = margin + dateColumnWidth + 5;

				if (day.outfits.length === 0) {
					pdf.setFontSize(9);
					pdf.setFont('helvetica', 'italic');
					pdf.text('No outfits planned', outfitX, outfitY);
				} else {
					for (const outfit of day.outfits) {
						// Outfit name
						pdf.setFontSize(9);
						pdf.setFont('helvetica', 'bold');
						pdf.text(`• ${outfit.name}`, outfitX, outfitY);
						outfitY += 12;

						// Outfit items
						for (const item of outfit.items) {
							// Small image
							try {
								const imageData = await loadImageAsBase64(
									getImageUrl(item.frontImgUrl)
								);
								pdf.addImage(
									imageData,
									'JPEG',
									outfitX + 10,
									outfitY - 8,
									8,
									8
								);
							} catch (error) {
								console.warn(
									'Failed to load image for item:',
									item.title,
									error
								);
								pdf.setDrawColor(200, 200, 200);
								pdf.rect(outfitX + 10, outfitY - 8, 8, 8);
							}

							// Item text
							pdf.setFontSize(8);
							pdf.setFont('helvetica', 'normal');
							const itemText = `${item.title} (${item.type}, ${item.color})`;
							const itemLines = pdf.splitTextToSize(
								itemText,
								outfitColumnWidth - 30
							);
							pdf.text(itemLines, outfitX + 22, outfitY - 2);
							outfitY += 10;
						}
						outfitY += 3; // spacing between outfits
					}
				}

				currentTableY += dayContentHeight;
			}

			// Save the PDF
			const startDate = selectedDayData[0]?.date;
			const endDate = selectedDayData[selectedDayData.length - 1]?.date;
			const filename = `packing-list-${startDate}-to-${endDate}.pdf`;
			pdf.save(filename);
		} catch (error) {
			console.error('Error generating PDF:', error);
			alert('Failed to generate PDF. Please try again.');
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	// Helper function to add item to PDF with image
	const addItemToPDF = async (
		pdf: any,
		item: InventoryItem,
		x: number,
		y: number,
		imageSize: number,
		itemWidth: number
	) => {
		try {
			const imageData = await loadImageAsBase64(
				getImageUrl(item.frontImgUrl)
			);
			pdf.addImage(imageData, 'JPEG', x + 3, y + 3, imageSize, imageSize);
		} catch (error) {
			console.warn('Failed to load image for item:', item.title, error);
			// Draw a placeholder rectangle
			pdf.setDrawColor(200, 200, 200);
			pdf.rect(x + 3, y + 3, imageSize, imageSize);
			pdf.setFontSize(7);
			pdf.text('No Image', x + 3 + imageSize / 2, y + 3 + imageSize / 2, {
				align: 'center',
			});
		}

		// Add item text - more compact
		pdf.setFontSize(7);
		pdf.setFont('helvetica', 'bold');
		const titleLines = pdf.splitTextToSize(item.title, itemWidth - 6);
		pdf.text(titleLines, x + 3, y + imageSize + 10);

		// Add type and color on separate line if space allows
		pdf.setFontSize(6);
		pdf.setFont('helvetica', 'normal');
		const detailText = `${item.type}, ${item.color}`;
		const detailLines = pdf.splitTextToSize(detailText, itemWidth - 6);
		pdf.text(detailLines, x + 3, y + imageSize + 14);
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
			<div className='px-6 py-4 shadow-md bg-gray-200 rounded-lg'>
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
					<div className='flex items-center space-x-2'>
						<div className='flex flex-col items-end'>
							<div className='flex items-center space-x-2'>
								<Button
									label={
										isGeneratingPDF
											? 'Generating...'
											: `Export PDF (${
													selectedDays.size
											  } day${
													selectedDays.size !== 1
														? 's'
														: ''
											  })`
									}
									onClick={handleExportPDF}
									disabled={
										selectedDays.size === 0 ||
										isGeneratingPDF
									}
								/>
								{selectedDays.size > 0 && (
									<Button
										label='Clear Selection'
										onClick={() =>
											setSelectedDays(new Set())
										}
										color='gray'
									/>
								)}
								<Button label='Today' onClick={handleToday} />
							</div>
							{(() => {
								const currentWeekDates = weekDays.map(
									(day) => day.date
								);
								const selectedFromOtherWeeks = Array.from(
									selectedDays
								).filter(
									(date) => !currentWeekDates.includes(date)
								).length;
								return (
									selectedFromOtherWeeks > 0 && (
										<span className='text-xs text-gray-600 mt-1'>
											{selectedFromOtherWeeks} day
											{selectedFromOtherWeeks !== 1
												? 's'
												: ''}{' '}
											from other weeks
										</span>
									)
								);
							})()}
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className='flex-1 flex min-h-0 pt-3 space-x-3'>
				<div className='flex-1 flex flex-col min-h-0'>
					<WeekView
						weekDays={weekDays}
						onDropOutfit={handleDropOutfit}
						onRemoveOutfit={handleRemoveOutfit}
						onDragStart={handleDragStart}
						isDragging={isDragging}
						selectedDays={selectedDays}
						onDaySelection={handleDaySelection}
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
