import AddInventoryForm from '@components/AddInventoryForm';
import Button from '@components/Button';
import FilterPanel from '@components/FilterPanel';
import InventoryPanel from '@components/InventoryPanel';
import { useState } from 'react';

function App() {
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
		<div className='flex space-x-4 h-full w-full'>
			<AddInventoryForm
				isVisible={isFormVisible}
				setVisibility={setIsFormVisible}
			/>
			<FilterPanel onFiltersChange={handleFiltersChange} />
			<div className='flex flex-col h-full w-full space-y-2'>
				<Button
					onClick={() => setIsFormVisible(true)}
					label='Add Item'
				/>
				<InventoryPanel filters={filters} />
			</div>
		</div>
	);
}

export default App;
