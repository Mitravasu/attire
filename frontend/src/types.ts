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
