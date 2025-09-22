import { InventoryItem } from 'src/types';
import InventoryCard from './InventoryCard';
import EditInventoryForm from './EditInventoryForm';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Pagination from './Pagination';
import SkeletonCard from './SkeletonCard';
import { useState, useEffect, useCallback } from 'react';

interface InventoryPanelProps {
	filters: {
		status: string;
		color: string;
		type: string;
		isFavorite: string;
	};
	onAddToOutfit?: (item: InventoryItem) => void;
	currentOutfitItemIds?: number[];
}

export default function InventoryPanel({
	filters,
	onAddToOutfit,
	currentOutfitItemIds = [],
}: InventoryPanelProps) {
	const [items, setItems] = useState<InventoryItem[]>([]);
	const [isEditFormVisible, setIsEditFormVisible] = useState(false);
	const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
	const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(20);
	const [totalItems, setTotalItems] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [hasNext, setHasNext] = useState(false);
	const [hasPrev, setHasPrev] = useState(false);

	const fetchItems = useCallback(
		async (page?: number, limit?: number) => {
			try {
				setIsLoading(true);
				setError(null);

				const pageToFetch = page || currentPage;
				const limitToUse = limit || itemsPerPage;

				// Build query parameters based on filters and pagination
				const queryParams = new URLSearchParams();
				if (filters.status && filters.status !== '') {
					queryParams.append('status', filters.status);
				}
				if (filters.color && filters.color !== '') {
					queryParams.append('color', filters.color);
				}
				if (filters.type && filters.type !== '') {
					queryParams.append('type', filters.type);
				}
				if (filters.isFavorite && filters.isFavorite !== '') {
					queryParams.append('isFavorite', filters.isFavorite);
				}

				// Add pagination parameters
				queryParams.append('page', pageToFetch.toString());
				queryParams.append('limit', limitToUse.toString());

				const url = `${
					import.meta.env.VITE_API_URL
				}/api/inventory?${queryParams.toString()}`;

				const response = await fetch(url);

				if (!response.ok) {
					throw new Error('Failed to fetch inventory items');
				}

				const data = await response.json();

				// Update items and pagination state
				setItems(data.items || []);
				setTotalItems(data.totalItems || 0);
				setTotalPages(data.totalPages || 0);
				setHasNext(data.hasNext || false);
				setHasPrev(data.hasPrev || false);

				// Update pagination state if limit changed
				if (limit && limit !== itemsPerPage) {
					setItemsPerPage(limit);
					setCurrentPage(1); // Reset to first page when changing limit
				} else if (page && page !== currentPage) {
					setCurrentPage(page);
				}
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'An error occurred'
				);
			} finally {
				setIsLoading(false);
			}
		},
		[filters, currentPage, itemsPerPage]
	);

	// Reset to page 1 when filters change
	useEffect(() => {
		setCurrentPage(1);
		fetchItems(1);
	}, [filters.status, filters.color, filters.type, filters.isFavorite]);

	// Fetch items when page or itemsPerPage changes
	useEffect(() => {
		fetchItems();
	}, [currentPage, itemsPerPage]);

	const handleEditItem = (item: InventoryItem) => {
		setSelectedItem(item);
		setIsEditFormVisible(true);
	};

	const handleDeleteItem = (item: InventoryItem) => {
		setSelectedItem(item);
		setIsDeleteModalVisible(true);
	};

	const handleItemUpdated = () => {
		fetchItems(); // Refresh the inventory list
	};

	const handleItemDeleted = () => {
		fetchItems(); // Refresh the inventory list
	};

	const handlePageChange = (page: number, newLimit?: number) => {
		if (newLimit) {
			// When limit changes, reset to page 1
			fetchItems(1, newLimit);
		} else {
			fetchItems(page);
		}
	};

	const handleRetry = () => {
		fetchItems();
	};

	if (isLoading) {
		return (
			<div className='flex flex-col w-full h-full'>
				<div className='flex flex-col h-full w-full border-2 border-white rounded-md backdrop-blur-md'>
					<div className='flex flex-wrap justify-start p-4 flex-1 overflow-y-auto'>
						{/* Show skeleton cards while loading */}
						{Array.from({ length: itemsPerPage }).map(
							(_, index) => (
								<SkeletonCard key={index} />
							)
						)}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex flex-col w-full h-full'>
				<div className='flex items-center justify-center p-4 h-full w-full border-2 border-white rounded-md backdrop-blur-md'>
					<div className='text-center'>
						<p className='text-red-600 mb-4'>Error: {error}</p>
						<button
							onClick={handleRetry}
							className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
							Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col w-full h-full'>
			<EditInventoryForm
				isVisible={isEditFormVisible}
				setVisibility={setIsEditFormVisible}
				item={selectedItem}
				onItemUpdated={handleItemUpdated}
			/>
			<DeleteConfirmationModal
				isVisible={isDeleteModalVisible}
				setVisibility={setIsDeleteModalVisible}
				item={selectedItem}
				onItemDeleted={handleItemDeleted}
			/>
			<div className='flex flex-col w-full h-full bg-gray-200 rounded-md backdrop-blur-md'>
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 flex-1 overflow-y-auto'>
					{items.length === 0 ? (
						<div className='w-full text-center text-gray-500 py-8'>
							{totalItems === 0
								? 'No inventory items found. Add some items to get started!'
								: 'No items found matching your filters.'}
						</div>
					) : (
						items.map((item) => {
							const isInCurrentOutfit =
								currentOutfitItemIds.includes(item.id);
							return (
								<InventoryCard
									key={item.id}
									item={item}
									onEdit={handleEditItem}
									onDelete={handleDeleteItem}
									onAddToOutfit={onAddToOutfit}
									isInCurrentOutfit={isInCurrentOutfit}
								/>
							);
						})
					)}
					{totalItems > 0 && (
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							totalItems={totalItems}
							itemsPerPage={itemsPerPage}
							onPageChange={handlePageChange}
							hasNext={hasNext}
							hasPrev={hasPrev}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
