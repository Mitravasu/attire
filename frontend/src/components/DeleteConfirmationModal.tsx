import { useState } from 'react';
import Button from './Button';
import { InventoryItem } from 'src/types';

interface DeleteConfirmationModalProps {
	isVisible: boolean;
	setVisibility: (visible: boolean) => void;
	item: InventoryItem | null;
	onItemDeleted: () => void;
}

export default function DeleteConfirmationModal({
	isVisible,
	setVisibility,
	item,
	onItemDeleted,
}: DeleteConfirmationModalProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDelete = async () => {
		if (!item) return;

		setError(null);
		setIsDeleting(true);

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/inventory/${item.id}`,
				{
					method: 'DELETE',
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					result.error || 'Failed to delete inventory item'
				);
			}

			onItemDeleted(); // Callback to refresh the inventory list
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

	if (!item || !isVisible) return null;

	return (
		<div className='fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4'>
			<div
				className={`bg-gray-200 p-6 rounded-md w-1/4 h-fit flex flex-col ${
					isVisible ? '' : 'hidden'
				}`}>
				<h2 className='text-2xl font-bold mb-4 text-red-600'>
					Delete Item
				</h2>

				<div className='mb-6'>
					<p className='text-lg'>
						Are you sure you want to delete "{item.title}"?
					</p>

					<p className='text-red-600 font-medium mb-2'>
						This action cannot be undone.
					</p>
					<div className='flex justify-center w-full'>
						<div className='p-4 w-fit rounded-md'>
							<div className='flex space-x-2 justify-center mb-2'>
								<div className='text-center'>
									<p className='text-xs text-gray-500 mb-1'>
										Front
									</p>
									<img
										src={`${import.meta.env.VITE_API_URL}${
											item.frontImgUrl
										}`}
										alt={`${item.title} - front`}
										className='w-20 h-20 object-cover rounded'
									/>
								</div>
								{item.backImgUrl && (
									<div className='text-center'>
										<p className='text-xs text-gray-500 mb-1'>
											Back
										</p>
										<img
											src={`${
												import.meta.env.VITE_API_URL
											}${item.backImgUrl}`}
											alt={`${item.title} - back`}
											className='w-12 h-12 object-cover border rounded'
										/>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{error && (
					<div className='w-full p-3 mb-4 text-red-700 bg-red-100 border border-red-300 rounded'>
						{error}
					</div>
				)}

				<div className='flex space-x-3 justify-end'>
					<Button
						onClick={handleClose}
						color='black'
						label='Cancel'
					/>
					<Button
						onClick={handleDelete}
						label='Delete'
						disabled={isDeleting}
						color='red'
					/>
				</div>
			</div>
		</div>
	);
}
