import { Request } from 'express';

export interface InventoryItem {
	id: number;
	title: string;
	imgUrl: string;
	tags: string[];
	status: 'dirty' | 'washed' | 'ironed';
	createdAt: string;
	updatedAt?: string;
}

export interface InventoryRequest extends Request {
	body: {
		title: string;
		tags: string | string[];
		status: string;
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
