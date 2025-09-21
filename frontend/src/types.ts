export type InventoryItem = {
	id: number;
	title: string;
	tags: string[];
	frontImgUrl: string;
	backImgUrl?: string; // Optional back image
	status: 'dirty' | 'washed' | 'ironed';
	color: string;
	type: string;
	isFavorite: boolean;
	createdAt: string;
	updatedAt?: string;
};

export type Outfit = {
	id: number;
	name: string;
	items: InventoryItem[];
	createdAt: string;
	updatedAt?: string;
};

export type CurrentOutfit = {
	name: string;
	items: InventoryItem[];
};

export type PlannerEntry = {
	id: number;
	date: string; // ISO date string (YYYY-MM-DD)
	outfitId: number;
	notes?: string;
	createdAt: string;
	updatedAt?: string;
};

export type WeekDay = {
	date: string; // ISO date string
	dayName: string; // Monday, Tuesday, etc.
	dayNumber: number; // Day of month
	isToday: boolean;
	outfits: (Outfit & { notes?: string })[];
};

export type DraggedOutfit = {
	outfit: Outfit;
	sourceType: 'sidebar' | 'day';
	sourceDate?: string;
};
