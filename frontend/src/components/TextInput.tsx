export default function TextInput({
	id,
	value,
	handleInputChange,
	required = false,
	label,
	placeholder = '',
}: {
	id: string;
	value: string;
	handleInputChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => void;
	required?: boolean;
	label: string;
	placeholder?: string;
}) {
	return (
		<div className='flex flex-col'>
			<label htmlFor={id} className='font-bold'>
				{label}
				{required ? <span className='text-red-600'> *</span> : ''}
			</label>
			<input
				type='text'
				id={id}
				name={id}
				value={value}
				onChange={handleInputChange}
				required={required}
				className='bg-white p-2 rounded-md text-black inset-shadow-sm'
				placeholder={placeholder}
			/>
		</div>
	);
}
