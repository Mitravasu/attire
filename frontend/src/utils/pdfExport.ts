import { WeekDay, InventoryItem, PlannerEntry, Outfit } from '../types';
import { getPlannerEntries, getImageUrl } from './api';

// Helper function to load image as base64
export const loadImageAsBase64 = (url: string): Promise<string> => {
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

// Helper function to add item to PDF with image
export const addItemToPDF = async (
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

// Get unique clothing items from selected days
export const getUniqueClothingItems = async (
	weekDays: WeekDay[],
	selectedDays: Set<string>
): Promise<InventoryItem[]> => {
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
export const getSelectedDayData = async (
	weekDays: WeekDay[],
	selectedDays: Set<string>
): Promise<WeekDay[]> => {
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
					isToday: date === new Date().toISOString().split('T')[0],
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

// Generate PDF export
export const generatePDF = async (
	weekDays: WeekDay[],
	selectedDays: Set<string>
): Promise<void> => {
	if (selectedDays.size === 0) {
		throw new Error('Please select at least one day to export.');
	}

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
	const selectedDayData = await getSelectedDayData(weekDays, selectedDays);
	const uniqueItems = await getUniqueClothingItems(weekDays, selectedDays);

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
			Math.min(remainingRowsOnCurrentPage, maxRowsPerPage) * itemHeight +
			15;
	} else {
		yPosition = margin + remainingRowsOnCurrentPage * itemHeight + 15;
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
		pdf.rect(margin, currentTableY, dateColumnWidth, dayContentHeight);
		pdf.rect(
			margin + dateColumnWidth,
			currentTableY,
			outfitColumnWidth,
			dayContentHeight
		);

		// Date cell content
		pdf.setFontSize(9);
		pdf.setFont('helvetica', 'bold');
		const dateLines = pdf.splitTextToSize(fullDate, dateColumnWidth - 10);
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
							30,
							30
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
				outfitY += 30; // spacing between outfits
			}
		}

		currentTableY += dayContentHeight;
	}

	// Save the PDF
	const startDate = selectedDayData[0]?.date;
	const endDate = selectedDayData[selectedDayData.length - 1]?.date;
	const filename = `packing-list-${startDate}-to-${endDate}.pdf`;
	pdf.save(filename);
};
