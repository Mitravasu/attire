import AddInventoryForm from '@components/AddInventoryForm';
import Button from '@components/Button';
import FilterPanel from '@components/FilterPanel';
import InventoryPanel from '@components/InventoryPanel';
import OutfitPanel from '@components/OutfitPanel';
import { useState } from 'react';
import { InventoryItem, CurrentOutfit } from 'src/types';

export default function Home() {
	const [isFormVisible, setIsFormVisible] = useState(false);
	const [filters, setFilters] = useState({
		status: '',
		color: '',
		type: '',
		isFavorite: '',
	});
	const [currentOutfit, setCurrentOutfit] = useState<CurrentOutfit>({
		name: '',
		items: [],
	});

	const handleFiltersChange = (newFilters: {
		status: string;
		color: string;
		type: string;
		isFavorite: string;
	}) => {
		setFilters(newFilters);
	};

	const handleAddToOutfit = (item: InventoryItem) => {
		// Check if item is already in the outfit
		const isAlreadyAdded = currentOutfit.items.some(
			(outfitItem) => outfitItem.id === item.id
		);

		if (!isAlreadyAdded) {
			setCurrentOutfit((prev) => ({
				...prev,
				items: [...prev.items, item],
			}));
		}
	};

	const handleRemoveFromOutfit = (itemId: number) => {
		setCurrentOutfit((prev) => ({
			...prev,
			items: prev.items.filter((item) => item.id !== itemId),
		}));
	};

	const handleClearOutfit = () => {
		setCurrentOutfit({
			name: '',
			items: [],
		});
	};

	const handleSaveOutfit = async (name: string) => {
		try {
			const itemIds = currentOutfit.items.map((item) => item.id);

			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/outfits`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name,
						itemIds,
					}),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to save outfit');
			}

			// Clear the current outfit after successful save
			handleClearOutfit();

			// You could show a success message here
			console.log('Outfit saved successfully!');
		} catch (error) {
			console.error('Error saving outfit:', error);
			// You could show an error message here
		}
	};

	return (
		<div className='flex w-full h-full space-x-4'>
			<AddInventoryForm
				isVisible={isFormVisible}
				setVisibility={setIsFormVisible}
			/>
			<div className='flex flex-col w-1/6 h-full space-y-2'>
				<FilterPanel onFiltersChange={handleFiltersChange} />
				<div className='flex-1 min-h-0'>
					<OutfitPanel
						currentOutfit={currentOutfit}
						onRemoveItem={handleRemoveFromOutfit}
						onClearAll={handleClearOutfit}
						onSaveOutfit={handleSaveOutfit}
					/>
				</div>
			</div>
			<div className='flex flex-1 flex-col w-full h-full space-y-2'>
				<Button
					onClick={() => setIsFormVisible(true)}
					label='Add Item'
				/>
				<div className='flex-1 min-h-0'>
					<InventoryPanel
						filters={filters}
						onAddToOutfit={handleAddToOutfit}
						currentOutfitItemIds={currentOutfit.items.map(
							(item) => item.id
						)}
					/>
				</div>
			</div>
		</div>
	);
}
