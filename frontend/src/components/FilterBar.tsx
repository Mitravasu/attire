import Dropdown from '@components/Dropdown';

export default function FilterBar() {
	const colourOptions = ['Red', 'Blue', 'Green', 'Red', 'Blue', 'Green'];
	const seasonOptions = ['Spring', 'Summer', 'Fall', 'Winter'];
	const typeOptions = [
		'T-shirt',
		'Jacket',
		'Hoodie',
		'Coat',
		'Shorts',
		'Jeans',
		'Slacks',
	];

	return (
		<div className='flex flex-col w-fit h-full space-y-4 p-3 border-secondary bg-primary border-r-1'>
			<Dropdown label='Colour' items={colourOptions} />
			<Dropdown label='Season' items={seasonOptions} />
			<Dropdown label='Type' items={typeOptions} />
		</div>
	);
}
