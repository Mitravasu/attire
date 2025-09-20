'use client';

import { useState } from 'react';
import TextInput from './TextInput';
import Dropdown from './Dropdown';
import Button from './Button';
import FileInput from './FileInput';

interface AddInventoryFormProps {
	isVisible: boolean;
	setVisibility: (visible: boolean) => void;
}

export default function AddInventoryForm({
	isVisible,
	setVisibility,
}: AddInventoryFormProps) {
	const [formData, setFormData] = useState({
		title: '',
		tags: '',
		status: 'dirty' as 'dirty' | 'washed' | 'ironed',
	});
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

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
		setError(null);
		setSuccess(null);
		setIsSubmitting(true);

		try {
			// Validation
			if (!formData.title.trim()) {
				throw new Error('Title is required');
			}

			if (!selectedFile) {
				throw new Error('Please select an image file');
			}

			if (!formData.tags.trim()) {
				throw new Error('Tags are required');
			}

			// Create FormData for file upload
			const formDataToSend = new FormData();
			formDataToSend.append('title', formData.title.trim());
			formDataToSend.append('tags', formData.tags.trim());
			formDataToSend.append('status', formData.status);
			formDataToSend.append('image', selectedFile);

			// Send to server
			const response = await fetch(
				'http://localhost:3001/api/inventory',
				{
					method: 'POST',
					body: formDataToSend,
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to add inventory item');
			}

			setSuccess('Inventory item added successfully!');

			// Reset form
			setFormData({
				title: '',
				tags: '',
				status: 'dirty',
			});
			setSelectedFile(null);

			// Reset file input
			const fileInput = document.getElementById(
				'image'
			) as HTMLInputElement;
			if (fileInput) {
				fileInput.value = '';
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setIsSubmitting(false);
			setVisibility(false);
		}
	};

	return (
		<div
			className={`fixed inset-0 items-center self-center justify-self-center z-50 backdrop-blur-md border-2 border-white p-4 rounded-md w-1/4 h-fit flex flex-col ${
				isVisible ? '' : 'hidden'
			}`}>
			<h2 className='text-2xl font-bold mb-6'>Add New Inventory Item</h2>

			<form onSubmit={handleSubmit} className='space-y-4'>
				<TextInput
					id='title'
					label='Title *'
					value={formData.title}
					handleInputChange={handleInputChange}
					placeholder='Enter item title'
					required
				/>
				<FileInput
					label='Image *'
					id='image'
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
						label={isSubmitting ? 'Adding...' : 'Add Item'}
					/>
					<Button
						onClick={() => setVisibility(false)}
						label='Cancel'
					/>
				</div>
			</form>
		</div>
	);
}
