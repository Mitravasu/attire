import { useState, useEffect } from 'react';
import TextInput from './TextInput';
import Dropdown from './Dropdown';
import Button from './Button';
import FileInput from './FileInput';
import { InventoryItem } from 'src/types';
import { COLOR_OPTIONS, TYPE_OPTIONS } from '../constants';

interface EditInventoryFormProps {
	isVisible: boolean;
	setVisibility: (visible: boolean) => void;
	item: InventoryItem | null;
	onItemUpdated: () => void;
}

export default function EditInventoryForm({
	isVisible,
	setVisibility,
	item,
	onItemUpdated,
}: EditInventoryFormProps) {
	const [formData, setFormData] = useState({
		title: '',
		tags: '',
		status: 'dirty' as 'dirty' | 'washed' | 'ironed',
		color: COLOR_OPTIONS[0] as string,
		type: TYPE_OPTIONS[0] as string,
	});
	const [selectedFrontFile, setSelectedFrontFile] = useState<File | null>(
		null
	);
	const [selectedBackFile, setSelectedBackFile] = useState<File | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// Populate form with item data when item changes
	useEffect(() => {
		if (item) {
			setFormData({
				title: item.title,
				tags: item.tags.join(', '),
				status: item.status,
				color: item.color,
				type: item.type,
			});
		}
	}, [item]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				setError('Please select an image file for front image');
				return;
			}

			// Validate file size (5MB limit)
			if (file.size > 5 * 1024 * 1024) {
				setError('Front image file size must be less than 5MB');
				return;
			}

			setSelectedFrontFile(file);
			setError(null);
		}
	};

	const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				setError('Please select an image file for back image');
				return;
			}

			// Validate file size (5MB limit)
			if (file.size > 5 * 1024 * 1024) {
				setError('Back image file size must be less than 5MB');
				return;
			}

			setSelectedBackFile(file);
			setError(null);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!item) return;

		setError(null);
		setSuccess(null);
		setIsSubmitting(true);

		try {
			// Validation
			if (!formData.title.trim()) {
				throw new Error('Title is required');
			}

			if (!formData.tags.trim()) {
				throw new Error('Tags are required');
			}

			// Create FormData for file upload
			const formDataToSend = new FormData();
			formDataToSend.append('title', formData.title.trim());
			formDataToSend.append('tags', formData.tags.trim());
			formDataToSend.append('status', formData.status);
			formDataToSend.append('color', formData.color);
			formDataToSend.append('type', formData.type);

			// Only append images if new ones were selected
			if (selectedFrontFile) {
				formDataToSend.append('frontImage', selectedFrontFile);
			}
			if (selectedBackFile) {
				formDataToSend.append('backImage', selectedBackFile);
			}

			// Send to server
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/inventory/${item.id}`,
				{
					method: 'PUT',
					body: formDataToSend,
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					result.error || 'Failed to update inventory item'
				);
			}

			setSuccess('Inventory item updated successfully!');
			onItemUpdated(); // Callback to refresh the inventory list

			// Reset form
			setSelectedFrontFile(null);
			setSelectedBackFile(null);

			// Reset file inputs
			const frontFileInput = document.getElementById(
				'edit-front-image'
			) as HTMLInputElement;
			if (frontFileInput) {
				frontFileInput.value = '';
			}
			const backFileInput = document.getElementById(
				'edit-back-image'
			) as HTMLInputElement;
			if (backFileInput) {
				backFileInput.value = '';
			}
			setVisibility(false);
			setSuccess(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setVisibility(false);
		setError(null);
		setSuccess(null);
		setSelectedFrontFile(null);
		setSelectedBackFile(null);

		// Reset file inputs
		const frontFileInput = document.getElementById(
			'edit-front-image'
		) as HTMLInputElement;
		if (frontFileInput) {
			frontFileInput.value = '';
		}
		const backFileInput = document.getElementById(
			'edit-back-image'
		) as HTMLInputElement;
		if (backFileInput) {
			backFileInput.value = '';
		}
	};

	if (!isVisible || !item) return null;

	return (
		<div className='fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4'>
			<div
				className={`z-50 bg-gray-200 p-4 rounded-md w-1/4 h-fit flex flex-col ${
					isVisible ? '' : 'hidden'
				}`}>
				<h2 className='text-2xl font-bold mb-6'>Edit Inventory Item</h2>

				{error && (
					<div className='w-full p-3 mb-4 text-red-700 bg-red-100 border border-red-300 rounded'>
						{error}
					</div>
				)}

				{success && (
					<div className='w-full p-3 mb-4 text-green-700 bg-green-100 border border-green-300 rounded'>
						{success}
					</div>
				)}

				<form onSubmit={handleSubmit} className='space-y-4'>
					<TextInput
						id='title'
						label='Title'
						value={formData.title}
						handleInputChange={handleInputChange}
						placeholder='Enter item title'
						required
					/>

					<div className='space-y-2'>
						<label className='text-md font-bold'>
							Current Images
						</label>
						<div className='flex space-x-4'>
							<div className='text-center'>
								<p className='text-xs mb-1'>Front</p>
								<img
									src={`${import.meta.env.VITE_API_URL}${
										item.frontImgUrl
									}`}
									alt={`${item.title} - front`}
									className='w-20 h-20 object-cover rounded-lg shadow-md'
								/>
							</div>
							{item.backImgUrl && (
								<div className='text-center'>
									<p className='text-xs mb-1'>Back</p>
									<img
										src={`${import.meta.env.VITE_API_URL}${
											item.backImgUrl
										}`}
										alt={`${item.title} - back`}
										className='w-20 h-20 object-cover rounded-lg shadow-md'
									/>
								</div>
							)}
							{!item.backImgUrl && (
								<div className='text-center'>
									<p className='text-xs mb-1'>Back</p>
									<div className='w-20 h-20 rounded-lg bg-white p-2 flex items-center justify-center shadow-md'>
										<span className='text-xs text-gray-500'>
											No back image
										</span>
									</div>
								</div>
							)}
						</div>
					</div>

					<FileInput
						label='New Front Image (optional)'
						id='edit-front-image'
						onChange={handleFrontFileChange}
						selectedFile={selectedFrontFile}
						accept='image/*'
					/>

					<FileInput
						label='New Back Image (optional)'
						id='edit-back-image'
						onChange={handleBackFileChange}
						selectedFile={selectedBackFile}
						accept='image/*'
					/>

					<TextInput
						id='tags'
						label='Tags (comma-separated)'
						value={formData.tags}
						handleInputChange={handleInputChange}
						placeholder='e.g., casual, shirt, blue'
						required
					/>

					<Dropdown
						id='color'
						label='Color'
						value={formData.color}
						onChange={handleInputChange}
						options={[...COLOR_OPTIONS]}
						required
					/>

					<Dropdown
						id='type'
						label='Type'
						value={formData.type}
						onChange={handleInputChange}
						options={[...TYPE_OPTIONS]}
						required
					/>

					<Dropdown
						id='status'
						label='Status'
						value={formData.status}
						onChange={handleInputChange}
						options={['dirty', 'washed', 'ironed']}
						required
					/>

					<div className='flex justify-end space-x-3 pt-4'>
						<Button
							onClick={handleClose}
							color='black'
							label='Cancel'
						/>

						<Button
							onClick={function (): void {
								throw new Error('Function not implemented.');
							}}
							type='submit'
							disabled={isSubmitting}
							label={isSubmitting ? 'Updating...' : 'Update Item'}
						/>
					</div>
				</form>
			</div>
		</div>
	);
}
