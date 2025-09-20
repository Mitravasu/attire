import { useState } from 'react';
import ItemCard from './ItemCard';

export type ClothingItem = {
	imgPath: string;
	title: string;
	tags: string[];
};

export default function Display() {
	const [items, setItems] = useState<ClothingItem[]>([]);

	const fetchItems = async () => {
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/inventory`,
			{ method: 'GET' }
		);
		const data: ClothingItem[] = await response.json();

		setItems(data);
	};

	fetchItems();

	const itemCards = items.map((item) => {
		return (
			<ItemCard
				imgPath={item.imgPath}
				title={item.title}
				tags={item.tags}
			/>
		);
	});

	return (
		<div className='flex w-full h-full justify-center'>
			<div className='flex w-full h-full flex-wrap justify-evenly bg-primary overflow-scroll rounded-lg'>
				{itemCards}
			</div>
		</div>
	);
}
