'use client';

import { InventoryItem } from 'src/types';
import InventoryCard from './InventoryCard';
import { useState } from 'react';

export default function InventoryPanel() {
	const [items, setItems] = useState<InventoryItem[]>([]);

	const fetchItems = async () => {
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/api/inventory`
		);
		const data = await response.json();
		setItems(data);
	};

	fetchItems();

	return (
		<div className='flex flex-col w-full h-full'>
			<div className='flex flex-wrap justify-start p-4 h-full w-full border-2 border-white rounded-md backdrop-blur-md'>
				{items.map((item) => {
					return <InventoryCard item={item} />;
				})}
			</div>
		</div>
	);
}
