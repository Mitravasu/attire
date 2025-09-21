import { useState, useEffect } from 'react';
import { Outfit, InventoryItem } from 'src/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faTimes,
	faCheck,
	faPlus,
	faMinus,
	faChevronLeft,
	faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

interface EditOutfitModalProps {
	isVisible: boolean;
	setVisibility: (visible: boolean) => void;
	outfit: Outfit | null;
	onOutfitUpdated: () => void;
}

export default function EditOutfitModal({
	isVisible,
	setVisibility,
	outfit,
	onOutfitUpdated,
}: EditOutfitModalProps) {
	const [outfitName, setOutfitName] = useState('');
	const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
	const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 12; // Show 12 items per page

	// Initialize form when outfit changes
	useEffect(() => {
		if (outfit) {
			setOutfitName(outfit.name);
			setSelectedItems([...outfit.items]);
			fetchAvailableItems();
		}
	}, [outfit]);

	// Reset pagination when available items change
	useEffect(() => {
		setCurrentPage(1);
	}, [availableItems]);

	// Calculate pagination values
	const filteredAvailableItems = availableItems.filter(
		(item) => !selectedItems.some((selected) => selected.id === item.id)
	);
	const totalPages = Math.ceil(filteredAvailableItems.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentPageItems = filteredAvailableItems.slice(startIndex, endIndex);

	const handlePreviousPage = () => {
		setCurrentPage((prev) => Math.max(1, prev - 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prev) => Math.min(totalPages, prev + 1));
	};

	const fetchAvailableItems = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/inventory?limit=100`
			);
			const result = await response.json();

			if (!response.ok) {
				throw new Error(
					result.error || 'Failed to fetch inventory items'
				);
			}

			setAvailableItems(result.items || []);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to load items'
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddItem = (item: InventoryItem) => {
		if (!selectedItems.some((selected) => selected.id === item.id)) {
			setSelectedItems((prev) => [...prev, item]);
		}
	};

	const handleRemoveItem = (itemId: number) => {
		setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
	};

	const handleSave = async () => {
		if (!outfit || !outfitName.trim() || selectedItems.length === 0) return;

		setIsSaving(true);
		setError(null);

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/outfits/${outfit.id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: outfitName.trim(),
						itemIds: selectedItems.map((item) => item.id),
					}),
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to update outfit');
			}

			onOutfitUpdated();
			setVisibility(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setIsSaving(false);
		}
	};

	const handleClose = () => {
		setVisibility(false);
		setError(null);
		setOutfitName('');
		setSelectedItems([]);
		setAvailableItems([]);
	};

	if (!isVisible || !outfit) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-gray-900 border-2 border-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col'>
				{/* Header */}
				<div className='flex items-center justify-between p-6 pb-4 flex-shrink-0'>
					<h2 className='text-xl font-semibold text-white'>
						Edit Outfit
					</h2>
					<button
						onClick={handleClose}
						className='text-gray-400 hover:text-white transition-colors'>
						<FontAwesomeIcon icon={faTimes} size='lg' />
					</button>
				</div>

				{/* Error Message */}
				{error && (
					<div className='mx-6 mb-4 p-3 bg-red-900 border border-red-600 rounded-md text-red-100'>
						{error}
					</div>
				)}

				{/* Outfit Name */}
				<div className='px-6 pb-4 flex-shrink-0'>
					<label className='block text-sm font-medium text-gray-300 mb-2'>
						Outfit Name
					</label>
					<input
						type='text'
						value={outfitName}
						onChange={(e) => setOutfitName(e.target.value)}
						className='w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-white'
						placeholder='Enter outfit name...'
					/>
				</div>

				{/* Content Area */}
				<div className='flex-1 min-h-0 px-6'>
					<div className='h-full grid grid-cols-1 lg:grid-cols-2 gap-6'>
						{/* Available Items */}
						<div className='flex flex-col min-h-0'>
							<div className='flex items-center justify-between mb-4 flex-shrink-0'>
								<h3 className='text-lg font-medium text-white'>
									Available Items
								</h3>
								{!isLoading &&
									filteredAvailableItems.length > 0 && (
										<div className='flex items-center gap-3'>
											<span className='text-sm text-gray-400'>
												{startIndex + 1}-
												{Math.min(
													endIndex,
													filteredAvailableItems.length
												)}{' '}
												of{' '}
												{filteredAvailableItems.length}
											</span>
											<div className='flex items-center gap-1'>
												<button
													onClick={handlePreviousPage}
													disabled={currentPage === 1}
													className={`w-8 h-8 rounded-md flex items-center justify-center text-sm transition-colors ${
														currentPage === 1
															? 'bg-gray-700 text-gray-500 cursor-not-allowed'
															: 'bg-gray-700 text-white hover:bg-gray-600'
													}`}
													title='Previous page'>
													<FontAwesomeIcon
														icon={faChevronLeft}
													/>
												</button>
												<span className='text-sm text-gray-300 px-2'>
													{currentPage} / {totalPages}
												</span>
												<button
													onClick={handleNextPage}
													disabled={
														currentPage ===
														totalPages
													}
													className={`w-8 h-8 rounded-md flex items-center justify-center text-sm transition-colors ${
														currentPage ===
														totalPages
															? 'bg-gray-700 text-gray-500 cursor-not-allowed'
															: 'bg-gray-700 text-white hover:bg-gray-600'
													}`}
													title='Next page'>
													<FontAwesomeIcon
														icon={faChevronRight}
													/>
												</button>
											</div>
										</div>
									)}
							</div>
							{isLoading ? (
								<div className='flex-1 flex items-center justify-center text-gray-400'>
									Loading items...
								</div>
							) : (
								<div className='flex-1 min-h-0 overflow-y-auto'>
									<div className='grid grid-cols-2 xl:grid-cols-3 gap-4 pb-6'>
										{currentPageItems.map((item) => (
											<div
												key={item.id}
												className='relative group'>
												<div className='aspect-square rounded-md overflow-hidden border border-gray-600'>
													<img
														src={`${
															import.meta.env
																.VITE_API_URL
														}${item.frontImgUrl}`}
														alt={item.title}
														className='w-full h-full object-cover'
													/>
													<button
														onClick={() =>
															handleAddItem(item)
														}
														className='absolute top-1 right-1 bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-green-700 opacity-0 group-hover:opacity-100 transition-opacity'
														title={`Add ${item.title}`}>
														<FontAwesomeIcon
															icon={faPlus}
														/>
													</button>
												</div>
												<p className='text-xs text-center mt-2 truncate text-gray-300'>
													{item.title}
												</p>
											</div>
										))}
									</div>
									{filteredAvailableItems.length === 0 && (
										<div className='flex-1 flex items-center justify-center text-gray-400'>
											<div className='text-center'>
												<p>No available items</p>
												<p className='text-sm'>
													All items are already
													selected
												</p>
											</div>
										</div>
									)}
								</div>
							)}
						</div>

						{/* Selected Items */}
						<div className='flex flex-col min-h-0'>
							<h3 className='text-lg font-medium text-white mb-3 flex-shrink-0'>
								Selected Items ({selectedItems.length})
							</h3>
							{selectedItems.length === 0 ? (
								<div className='flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-600 rounded-lg'>
									<div className='text-center'>
										<FontAwesomeIcon
											icon={faPlus}
											className='text-3xl mb-2'
										/>
										<p>No items selected</p>
										<p className='text-sm'>
											Click + to add items
										</p>
									</div>
								</div>
							) : (
								<div className='flex-1 min-h-0 overflow-y-auto'>
									<div className='grid grid-cols-2 xl:grid-cols-3 gap-4 pb-6'>
										{selectedItems.map((item) => (
											<div
												key={item.id}
												className='relative group'>
												<div className='aspect-square rounded-md overflow-hidden border border-gray-600'>
													<img
														src={`${
															import.meta.env
																.VITE_API_URL
														}${item.frontImgUrl}`}
														alt={item.title}
														className='w-full h-full object-cover'
													/>
													<button
														onClick={() =>
															handleRemoveItem(
																item.id
															)
														}
														className='absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity'
														title={`Remove ${item.title}`}>
														<FontAwesomeIcon
															icon={faMinus}
														/>
													</button>
												</div>
												<p className='text-xs text-center mt-2 truncate text-gray-300'>
													{item.title}
												</p>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className='px-6 py-4 border-t border-gray-700 flex-shrink-0'>
					<div className='flex gap-3'>
						<button
							onClick={handleClose}
							className='px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors'>
							Cancel
						</button>
						<button
							onClick={handleSave}
							disabled={
								!outfitName.trim() ||
								selectedItems.length === 0 ||
								isSaving
							}
							className={`px-4 py-2 rounded-md font-medium transition-colors ${
								outfitName.trim() &&
								selectedItems.length > 0 &&
								!isSaving
									? 'bg-green-600 hover:bg-green-700 text-white'
									: 'bg-gray-600 text-gray-400 cursor-not-allowed'
							}`}>
							<FontAwesomeIcon icon={faCheck} className='mr-2' />
							{isSaving ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
