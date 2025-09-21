import { WeekDay } from '../types';

export function getCurrentWeekDates(date: Date = new Date()): WeekDay[] {
	const today = new Date(date);
	const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
	const monday = new Date(today);

	// Adjust to get Monday as the first day of the week
	const daysToSubtract = currentDay === 0 ? 6 : currentDay - 1;
	monday.setDate(today.getDate() - daysToSubtract);

	const weekDays: WeekDay[] = [];
	const dayNames = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday',
	];

	// Get the actual current date (not the reference date) for today comparison
	const actualToday = new Date();
	const actualTodayString = actualToday.toDateString();

	for (let i = 0; i < 7; i++) {
		const currentDate = new Date(monday);
		currentDate.setDate(monday.getDate() + i);

		// Only mark as today if this is actually today's date
		const isToday = currentDate.toDateString() === actualTodayString;

		weekDays.push({
			date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
			dayName: dayNames[i],
			dayNumber: currentDate.getDate(),
			isToday,
			outfits: [],
		});
	}

	return weekDays;
}

export function getWeekDateRange(weekDays: WeekDay[]): {
	startDate: string;
	endDate: string;
} {
	return {
		startDate: weekDays[0].date,
		endDate: weekDays[6].date,
	};
}

export function formatDateForDisplay(date: string): string {
	// Parse the date string as local date to avoid timezone issues
	const [year, month, day] = date.split('-').map(Number);
	const dateObj = new Date(year, month - 1, day);
	return dateObj.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
	});
}

export function getNextWeek(currentWeekDays: WeekDay[]): WeekDay[] {
	// Parse the date string as local date to avoid timezone issues
	const [year, month, day] = currentWeekDays[0].date.split('-').map(Number);
	const firstDay = new Date(year, month - 1, day);
	firstDay.setDate(firstDay.getDate() + 7);
	return getCurrentWeekDates(firstDay);
}

export function getPreviousWeek(currentWeekDays: WeekDay[]): WeekDay[] {
	// Parse the date string as local date to avoid timezone issues
	const [year, month, day] = currentWeekDays[0].date.split('-').map(Number);
	const firstDay = new Date(year, month - 1, day);
	firstDay.setDate(firstDay.getDate() - 7);
	return getCurrentWeekDates(firstDay);
}
