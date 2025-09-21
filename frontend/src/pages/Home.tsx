import AddInventoryForm from '@components/AddInventoryForm';
import Button from '@components/Button';
import FilterPanel from '@components/FilterPanel';
import InventoryPanel from '@components/InventoryPanel';
import { useState } from 'react';

export default function Home() {
	const [isFormVisible, setIsFormVisible] = useState(false);
	const [filters, setFilters] = useState({
		status: '',
		color: '',
		type: '',
		isFavorite: '',
	});

	const handleFiltersChange = (newFilters: {
		status: string;
		color: string;
		type: string;
		isFavorite: string;
	}) => {
		setFilters(newFilters);
	};

	return (
		<div className='flex space-x-4 w-full h-full'>
			<AddInventoryForm
				isVisible={isFormVisible}
				setVisibility={setIsFormVisible}
			/>
			<FilterPanel onFiltersChange={handleFiltersChange} />
			<div className='flex flex-col w-full h-full space-y-2'>
				<Button
					onClick={() => setIsFormVisible(true)}
					label='Add Item'
				/>
				<div className='flex-1 min-h-0'>
					<InventoryPanel filters={filters} />
				</div>
			</div>
		</div>
	);
}
