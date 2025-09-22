import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Button from './Button';

interface DeleteOutfitModalProps {
	isVisible: boolean;
	setVisibility: (visible: boolean) => void;
	outfitId: number | null;
	outfitName: string;
	onOutfitDeleted: () => void;
}

export default function DeleteOutfitModal({
	isVisible,
	setVisibility,
	outfitId,
	outfitName,
	onOutfitDeleted,
}: DeleteOutfitModalProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDelete = async () => {
		if (!outfitId) return;

		setError(null);
		setIsDeleting(true);

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/outfits/${outfitId}`,
				{
					method: 'DELETE',
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to delete outfit');
			}

			onOutfitDeleted();
			setVisibility(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setIsDeleting(false);
		}
	};

	const handleClose = () => {
		setVisibility(false);
		setError(null);
	};

	if (!isVisible || !outfitId) return null;

	return (
		<div className='fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50'>
			<div className='bg-gray-200 rounded-lg p-6 w-full max-w-md'>
				{/* Header */}
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-xl font-semibold'>Delete Outfit</h2>
					<button
						onClick={handleClose}
						className='cursor-pointer'
						disabled={isDeleting}>
						<FontAwesomeIcon icon={faTimes} size='lg' />
					</button>
				</div>

				{/* Error Message */}
				{error && (
					<div className='mb-4 p-3 bg-red-900 border border-red-600 rounded-md text-red-100'>
						{error}
					</div>
				)}

				{/* Confirmation Message */}
				<div className='mb-6'>
					<p className='mb-2'>
						Are you sure you want to delete this outfit?
					</p>
					<p className='font-medium'>"{outfitName}"</p>
					<p className='text-sm mt-2'>
						This action cannot be undone. The outfit will be
						permanently deleted, but the individual items will
						remain in your inventory.
					</p>
				</div>

				{/* Actions */}
				<div className='flex gap-3 justify-end'>
					<Button
						color='black'
						onClick={handleClose}
						disabled={isDeleting}
						label='Cancel'
					/>
					<Button
						color='red'
						onClick={handleDelete}
						disabled={isDeleting}
						label={isDeleting ? 'Deleting...' : 'Delete'}
					/>
				</div>
			</div>
		</div>
	);
}
