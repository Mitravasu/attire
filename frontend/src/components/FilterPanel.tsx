import { useState, useEffect } from 'react';
import Dropdown from './Dropdown';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface FilterValues {
	colors: string[];
	types: string[];
	statuses: string[];
}

interface FilterPanelProps {
	onFiltersChange: (filters: {
		status: string;
		color: string;
		type: string;
		isFavorite: string;
	}) => void;
}

export default function FilterPanel({ onFiltersChange }: FilterPanelProps) {
	const [filterValues, setFilterValues] = useState<FilterValues>({
		colors: [],
		types: [],
		statuses: [],
	});
	const [selectedFilters, setSelectedFilters] = useState({
		status: '',
		color: '',
		type: '',
		isFavorite: '',
	});

	// Fetch filter values from API
	useEffect(() => {
		const fetchFilterValues = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/api/inventory/filters`
				);
				if (response.ok) {
					const data = await response.json();
					setFilterValues(data);
				}
			} catch (error) {
				console.error('Error fetching filter values:', error);
			}
		};

		fetchFilterValues();
	}, []);

	const handleFilterChange = (filterType: string, value: string) => {
		const newFilters = {
			...selectedFilters,
			[filterType]: value,
		};
		setSelectedFilters(newFilters);
		onFiltersChange(newFilters);
	};

	const clearFilters = () => {
		const emptyFilters = {
			status: '',
			color: '',
			type: '',
			isFavorite: '',
		};
		setSelectedFilters(emptyFilters);
		onFiltersChange(emptyFilters);
	};

	return (
		<div className='p-4 h-fit w-full space-y-3 bg-gray-200 rounded-md inset-shadow-sm'>
			<div className='flex justify-between items-center mb-4'>
				<h3 className='font-bold text-lg'>Filters</h3>
				<button
					onClick={clearFilters}
					className='py-1 px-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 transition-colors cursor-pointer'
					title='Clear all items'>
					<FontAwesomeIcon icon={faTrash} />
				</button>
			</div>

			<Dropdown
				id='status'
				label='Status'
				value={selectedFilters.status}
				onChange={(e) => handleFilterChange('status', e.target.value)}
				options={['', ...filterValues.statuses]}
			/>

			<Dropdown
				id='color'
				label='Color'
				value={selectedFilters.color}
				onChange={(e) => handleFilterChange('color', e.target.value)}
				options={['', ...filterValues.colors]}
			/>

			<Dropdown
				id='type'
				label='Type'
				value={selectedFilters.type}
				onChange={(e) => handleFilterChange('type', e.target.value)}
				options={['', ...filterValues.types]}
			/>

			<Dropdown
				id='isFavorite'
				label='Favorites'
				value={selectedFilters.isFavorite}
				onChange={(e) =>
					handleFilterChange('isFavorite', e.target.value)
				}
				options={['', 'true', 'false']}
			/>
		</div>
	);
}
