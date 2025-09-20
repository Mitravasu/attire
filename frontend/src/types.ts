export type InventoryItem = {
	id: number;
	title: string;
	tags: string[];
	imgUrl: string;
	status: 'dirty' | 'washed' | 'ironed';
	createdAt: string;
	updatedAt?: string;
};
