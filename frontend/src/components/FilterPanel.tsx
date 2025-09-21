'use client';

import { useState, useEffect } from 'react';
import Dropdown from './Dropdown';

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
		<div className='p-4 h-fit w-1/6 min-w-1/6 space-y-3 border-2 border-white rounded-md'>
			<div className='flex justify-between items-center mb-4'>
				<h3 className='font-bold text-lg'>Filters</h3>
				<button
					onClick={clearFilters}
					className='text-sm text-blue-400 hover:text-blue-300'>
					Clear All
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

			<div className='flex flex-col'>
				<label htmlFor='isFavorite' className='font-bold'>
					Favorites
				</label>
				<select
					id='isFavorite'
					name='isFavorite'
					value={selectedFilters.isFavorite}
					onChange={(e) =>
						handleFilterChange('isFavorite', e.target.value)
					}
					className='border-2 border-white p-2 bg-black/20 rounded-md'>
					<option value='' className='text-black'>
						All Items
					</option>
					<option value='true' className='text-black'>
						Favorites Only
					</option>
					<option value='false' className='text-black'>
						Non-Favorites Only
					</option>
				</select>
			</div>
		</div>
	);
}
