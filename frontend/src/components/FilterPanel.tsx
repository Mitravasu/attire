'use client';

import Dropdown from './Dropdown';

export default function FilterPanel() {
	return (
		<div className='p-4 h-full w-1/6 min-w-1/6 space-y-3 border-2 border-white rounded-md'>
			<Dropdown
				label='Season'
				options={['Spring', 'Summer', 'Fall', 'Winter']}
			/>
			<Dropdown label='Colour' options={['White', 'Blue', 'Red']} />
			<Dropdown label='Type' options={['T-shirt', 'Jacket', 'Red']} />
			<Dropdown label='Colour' options={['White', 'Blue', 'Red']} />
		</div>
	);
}
