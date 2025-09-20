'use client';

import { useState, useEffect } from 'react';
import TextInput from './TextInput';
import Dropdown from './Dropdown';
import Button from './Button';
import FileInput from './FileInput';
import { InventoryItem } from 'src/types';

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
	});
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				setError('Please select an image file');
				return;
			}

			// Validate file size (5MB limit)
			if (file.size > 5 * 1024 * 1024) {
				setError('File size must be less than 5MB');
				return;
			}

			setSelectedFile(file);
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

			// Only append image if a new one was selected
			if (selectedFile) {
				formDataToSend.append('image', selectedFile);
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
			setSelectedFile(null);

			// Reset file input
			const fileInput = document.getElementById(
				'edit-image'
			) as HTMLInputElement;
			if (fileInput) {
				fileInput.value = '';
			}

			// Close modal after short delay
			setTimeout(() => {
				setVisibility(false);
				setSuccess(null);
			}, 1500);
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
		setSelectedFile(null);

		// Reset file input
		const fileInput = document.getElementById(
			'edit-image'
		) as HTMLInputElement;
		if (fileInput) {
			fileInput.value = '';
		}
	};

	if (!item) return null;

	return (
		<div
			className={`fixed inset-0 items-center self-center justify-self-center z-50 backdrop-blur-md border-2 border-white p-4 rounded-md w-1/4 h-fit flex flex-col ${
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
					label='Title *'
					value={formData.title}
					handleInputChange={handleInputChange}
					placeholder='Enter item title'
					required
				/>

				<div className='space-y-2'>
					<label className='text-sm font-medium'>Current Image</label>
					<img
						src={`${import.meta.env.VITE_API_URL}${item.imgUrl}`}
						alt={item.title}
						className='w-20 h-20 object-cover border rounded'
					/>
				</div>

				<FileInput
					label='New Image (optional)'
					id='edit-image'
					onChange={handleFileChange}
					selectedFile={selectedFile}
					accept='image/*'
				/>

				<TextInput
					id='tags'
					label='Tags * (comma-separated)'
					value={formData.tags}
					handleInputChange={handleInputChange}
					placeholder='e.g., casual, shirt, blue'
					required
				/>

				<Dropdown
					id='status'
					label='Status *'
					value={formData.status}
					onChange={handleInputChange}
					options={['dirty', 'washed', 'ironed']}
					required
				/>

				<div className='flex space-x-3 pt-4'>
					<Button
						onClick={function (): void {
							throw new Error('Function not implemented.');
						}}
						type='submit'
						disabled={isSubmitting}
						label={isSubmitting ? 'Updating...' : 'Update Item'}
					/>
					<Button onClick={handleClose} label='Cancel' />
				</div>
			</form>
		</div>
	);
}
