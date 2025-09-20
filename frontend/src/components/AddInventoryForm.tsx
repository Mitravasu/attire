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
	const [selectedFrontFile, setSelectedFrontFile] = useState<File | null>(
		null
	);
	const [selectedBackFile, setSelectedBackFile] = useState<File | null>(null);
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
		setError(null);
		setSuccess(null);
		setIsSubmitting(true);

		try {
			// Validation
			if (!formData.title.trim()) {
				throw new Error('Title is required');
			}

			if (!selectedFrontFile) {
				throw new Error('Please select a front image file');
			}

			if (!formData.tags.trim()) {
				throw new Error('Tags are required');
			}

			// Create FormData for file upload
			const formDataToSend = new FormData();
			formDataToSend.append('title', formData.title.trim());
			formDataToSend.append('tags', formData.tags.trim());
			formDataToSend.append('status', formData.status);
			formDataToSend.append('frontImage', selectedFrontFile);
			if (selectedBackFile) {
				formDataToSend.append('backImage', selectedBackFile);
			}

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
			setSelectedFrontFile(null);
			setSelectedBackFile(null);

			// Reset file inputs
			const frontFileInput = document.getElementById(
				'frontImage'
			) as HTMLInputElement;
			if (frontFileInput) {
				frontFileInput.value = '';
			}
			const backFileInput = document.getElementById(
				'backImage'
			) as HTMLInputElement;
			if (backFileInput) {
				backFileInput.value = '';
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
			className={`fixed inset-0 items-center self-center justify-self-center z-50 bg-black/50 backdrop-blur-md border-2 border-white p-4 rounded-md w-1/4 h-fit flex flex-col ${
				isVisible ? '' : 'hidden'
			}`}>
			<h2 className='text-2xl font-bold mb-6'>Add New Inventory Item</h2>

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
				<FileInput
					label='Front Image *'
					id='frontImage'
					onChange={handleFrontFileChange}
					selectedFile={selectedFrontFile}
					accept='image/*'
					required
				/>
				<FileInput
					label='Back Image (optional)'
					id='backImage'
					onChange={handleBackFileChange}
					selectedFile={selectedBackFile}
					accept='image/*'
					required={false}
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
