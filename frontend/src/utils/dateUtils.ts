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

	for (let i = 0; i < 7; i++) {
		const currentDate = new Date(monday);
		currentDate.setDate(monday.getDate() + i);

		const isToday = currentDate.toDateString() === today.toDateString();

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
	const dateObj = new Date(date);
	return dateObj.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
	});
}

export function getNextWeek(currentWeekDays: WeekDay[]): WeekDay[] {
	const firstDay = new Date(currentWeekDays[0].date);
	firstDay.setDate(firstDay.getDate() + 7);
	return getCurrentWeekDates(firstDay);
}

export function getPreviousWeek(currentWeekDays: WeekDay[]): WeekDay[] {
	const firstDay = new Date(currentWeekDays[0].date);
	firstDay.setDate(firstDay.getDate() - 7);
	return getCurrentWeekDates(firstDay);
}
