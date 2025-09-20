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
			</label>
			<input
				type='text'
				id={id}
				name={id}
				value={value}
				onChange={handleInputChange}
				required={required}
				className='border-2 border-white bg-black p-2 rounded-md'
				placeholder={placeholder}
			/>
		</div>
	);
}
