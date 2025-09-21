import { PlannerEntry, Outfit } from '../types';

const API_BASE = 'http://localhost:3001/api';
const SERVER_BASE = 'http://localhost:3001';

// Helper function to convert relative image URLs to absolute URLs
export function getImageUrl(relativeUrl: string): string {
	if (relativeUrl.startsWith('http')) {
		return relativeUrl; // Already absolute
	}
	return `${SERVER_BASE}${relativeUrl}`;
}

// Planner API functions
export async function getPlannerEntries(
	startDate: string,
	endDate: string
): Promise<(PlannerEntry & { outfit: Outfit })[]> {
	const response = await fetch(
		`${API_BASE}/planner?startDate=${startDate}&endDate=${endDate}`
	);

	if (!response.ok) {
		throw new Error('Failed to fetch planner entries');
	}

	return response.json();
}

export async function createPlannerEntry(
	date: string,
	outfitId: number,
	notes?: string
): Promise<PlannerEntry> {
	const response = await fetch(`${API_BASE}/planner`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ date, outfitId, notes }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to create planner entry');
	}

	return response.json();
}

export async function updatePlannerEntry(
	id: number,
	updates: { date?: string; outfitId?: number; notes?: string }
): Promise<PlannerEntry> {
	const response = await fetch(`${API_BASE}/planner/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(updates),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to update planner entry');
	}

	return response.json();
}

export async function deletePlannerEntry(id: number): Promise<void> {
	const response = await fetch(`${API_BASE}/planner/${id}`, {
		method: 'DELETE',
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to delete planner entry');
	}
}

// Outfit API functions
export async function getOutfits(
	page: number = 1,
	limit: number = 20
): Promise<{ outfits: Outfit[]; total: number }> {
	const response = await fetch(`${API_BASE}/outfits`);

	if (!response.ok) {
		throw new Error('Failed to fetch outfits');
	}

	const allOutfits = (await response.json()) as Outfit[];

	// Implement client-side pagination for now
	const startIndex = (page - 1) * limit;
	const endIndex = startIndex + limit;
	const paginatedOutfits = allOutfits.slice(startIndex, endIndex);

	return {
		outfits: paginatedOutfits,
		total: allOutfits.length,
	};
}
