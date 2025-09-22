export default function Dropdown({
	id,
	value,
	onChange,
	label,
	options,
	required = false,
}: {
	id: string;
	value: string;
	onChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => void;
	label: string;
	options: string[];
	required?: boolean;
}) {
	return (
		<div className='flex flex-col'>
			<label htmlFor={id} className='font-bold'>
				{label}
			</label>
			<select
				id={id}
				name={id}
				value={value}
				onChange={onChange}
				className='bg-white text-md p-2 rounded-lg text-black shadow-md'
				required={required}>
				{options.map((option) => (
					<option key={option} value={option} className='text-black'>
						{option}
					</option>
				))}
			</select>
		</div>
	);
}
