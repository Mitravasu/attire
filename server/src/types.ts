import { Request } from 'express';

export interface InventoryItem {
	id: number;
	title: string;
	frontImgUrl: string;
	backImgUrl?: string; // Optional back image
	tags: string[];
	status: 'dirty' | 'washed' | 'ironed';
	color: string;
	type: string;
	isFavorite: boolean;
	createdAt: string;
	updatedAt?: string;
}

export interface InventoryRequest extends Request {
	body: {
		title: string;
		tags: string | string[];
		status: string;
		color: string;
		type: string;
	};
}

export interface StatusUpdateRequest extends Request {
	params: {
		id: string;
	};
	body: {
		status: string;
	};
}

export interface EditInventoryRequest extends Request {
	params: {
		id: string;
	};
	body: {
		title?: string;
		tags?: string | string[];
		status?: string;
		color?: string;
		type?: string;
	};
}

export interface DeleteRequest extends Request {
	params: {
		id: string;
	};
}

export interface MulterError extends Error {
	code?: string;
	field?: string;
}

export type ValidStatus = 'dirty' | 'washed' | 'ironed';

export interface Outfit {
	id: number;
	name: string;
	items: InventoryItem[];
	createdAt: string;
	updatedAt?: string;
}

export interface CreateOutfitRequest extends Request {
	body: {
		name: string;
		itemIds: number[];
	};
}

export interface UpdateOutfitRequest extends Request {
	params: {
		id: string;
	};
	body: {
		name?: string;
		itemIds?: number[];
	};
}
