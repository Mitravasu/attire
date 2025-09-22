export default function FileInput({
	label,
	id,
	onChange,
	accept,
	selectedFile,
	required = false,
}: {
	label: string;
	id: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	selectedFile: File | null;
	accept: string;
	required?: boolean;
}) {
	return (
		<div>
			<label htmlFor='image' className='font-bold'>
				{label}
			</label>
			<input
				type='file'
				id={id}
				name={id}
				accept={accept}
				onChange={onChange}
				required={required}
				className='w-full px-3 py-2 rounded-md bg-white focus:outline-none inset-shadow-sm'
			/>
			{selectedFile && (
				<p className='mt-1 text-sm text-gray-600'>
					Selected: {selectedFile.name} (
					{(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
				</p>
			)}
		</div>
	);
}
