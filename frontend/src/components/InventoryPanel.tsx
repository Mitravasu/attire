'use client';

import { InventoryItem } from 'src/types';
import InventoryCard from './InventoryCard';
import EditInventoryForm from './EditInventoryForm';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useState, useEffect } from 'react';

export default function InventoryPanel() {
	const [items, setItems] = useState<InventoryItem[]>([]);
	const [isEditFormVisible, setIsEditFormVisible] = useState(false);
	const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
	const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchItems = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/inventory`
			);

			if (!response.ok) {
				throw new Error('Failed to fetch inventory items');
			}

			const data = await response.json();
			setItems(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchItems();
	}, []);

	const handleEditItem = (item: InventoryItem) => {
		setSelectedItem(item);
		setIsEditFormVisible(true);
	};

	const handleDeleteItem = (item: InventoryItem) => {
		setSelectedItem(item);
		setIsDeleteModalVisible(true);
	};

	const handleItemUpdated = () => {
		fetchItems(); // Refresh the inventory list
	};

	const handleItemDeleted = () => {
		fetchItems(); // Refresh the inventory list
	};

	if (isLoading) {
		return (
			<div className='flex flex-col w-full h-full'>
				<div className='flex items-center justify-center p-4 h-full w-full border-2 border-white rounded-md backdrop-blur-md'>
					<p>Loading inventory...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex flex-col w-full h-full'>
				<div className='flex items-center justify-center p-4 h-full w-full border-2 border-white rounded-md backdrop-blur-md'>
					<div className='text-center'>
						<p className='text-red-600 mb-4'>Error: {error}</p>
						<button
							onClick={fetchItems}
							className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
							Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col w-full h-full'>
			<EditInventoryForm
				isVisible={isEditFormVisible}
				setVisibility={setIsEditFormVisible}
				item={selectedItem}
				onItemUpdated={handleItemUpdated}
			/>
			<DeleteConfirmationModal
				isVisible={isDeleteModalVisible}
				setVisibility={setIsDeleteModalVisible}
				item={selectedItem}
				onItemDeleted={handleItemDeleted}
			/>
			<div className='flex flex-wrap justify-start p-4 h-full w-full border-2 border-white rounded-md backdrop-blur-md'>
				{items.length === 0 ? (
					<div className='w-full text-center text-gray-500 py-8'>
						No inventory items found. Add some items to get started!
					</div>
				) : (
					items.map((item) => {
						return (
							<InventoryCard
								key={item.id}
								item={item}
								onEdit={handleEditItem}
								onDelete={handleDeleteItem}
							/>
						);
					})
				)}
			</div>
		</div>
	);
}
