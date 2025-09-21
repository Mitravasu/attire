import { useState, useEffect } from 'react';
import { Outfit } from 'src/types';
import OutfitCard from '@components/OutfitCard';
import EditOutfitModal from '@components/EditOutfitModal';
import DeleteOutfitModal from '@components/DeleteOutfitModal';
import SkeletonCard from '@components/SkeletonCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faRefresh } from '@fortawesome/free-solid-svg-icons';

export default function Outfits() {
	const [outfits, setOutfits] = useState<Outfit[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	// Modal states
	const [editModalVisible, setEditModalVisible] = useState(false);
	const [deleteModalVisible, setDeleteModalVisible] = useState(false);
	const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
	const [outfitToDelete, setOutfitToDelete] = useState<{
		id: number;
		name: string;
	} | null>(null);

	// Fetch outfits from the API
	const fetchOutfits = async (showRefreshing = false) => {
		if (showRefreshing) setRefreshing(true);
		else setIsLoading(true);

		setError(null);

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/outfits`
			);
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch outfits');
			}

			setOutfits(result || []);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to load outfits'
			);
		} finally {
			setIsLoading(false);
			setRefreshing(false);
		}
	};

	// Load outfits on component mount
	useEffect(() => {
		fetchOutfits();
	}, []);

	const handleEditOutfit = (outfit: Outfit) => {
		setSelectedOutfit(outfit);
		setEditModalVisible(true);
	};

	const handleDeleteOutfit = (id: number) => {
		const outfit = outfits.find((o) => o.id === id);
		if (outfit) {
			setOutfitToDelete({ id: outfit.id, name: outfit.name });
			setDeleteModalVisible(true);
		}
	};

	const handleOutfitUpdated = () => {
		fetchOutfits();
		setSelectedOutfit(null);
	};

	const handleOutfitDeleted = () => {
		fetchOutfits();
		setOutfitToDelete(null);
	};

	const handleRefresh = () => {
		fetchOutfits(true);
	};

	return (
		<div className='flex flex-col h-full w-full p-6'>
			{/* Header */}
			<div className='flex items-center justify-between mb-6'>
				<div>
					<h1 className='text-4xl font-bold text-white'>Outfits</h1>
					<p className='text-gray-300 mt-1'>
						{outfits.length === 0
							? 'No outfits created yet'
							: `${outfits.length} ${
									outfits.length === 1 ? 'outfit' : 'outfits'
							  }`}
					</p>
				</div>

				<div className='flex gap-3'>
					<button
						onClick={handleRefresh}
						disabled={refreshing}
						className='px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
						title='Refresh outfits'>
						<FontAwesomeIcon
							icon={faRefresh}
							className={`mr-2 ${
								refreshing ? 'animate-spin' : ''
							}`}
						/>
						{refreshing ? 'Refreshing...' : 'Refresh'}
					</button>
				</div>
			</div>

			{/* Content Area */}
			<div className='flex-1 min-h-0'>
				{/* Error State */}
				{error && (
					<div className='mb-4 p-4 bg-red-900 border border-red-600 rounded-md text-red-100'>
						<p className='font-medium mb-2'>
							Error loading outfits
						</p>
						<p className='text-sm'>{error}</p>
						<button
							onClick={() => fetchOutfits()}
							className='mt-3 px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-sm transition-colors'>
							Try Again
						</button>
					</div>
				)}

				{/* Loading State */}
				{isLoading ? (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
						{Array.from({ length: 8 }).map((_, index) => (
							<SkeletonCard key={index} />
						))}
					</div>
				) : (
					<>
						{/* Empty State */}
						{outfits.length === 0 && !error ? (
							<div className='flex flex-col items-center justify-center h-full text-center py-12'>
								<div className='mb-8 p-8 border-2 border-dashed border-gray-600 rounded-lg'>
									<FontAwesomeIcon
										icon={faPlus}
										className='text-6xl text-gray-600 mb-4'
									/>
									<h2 className='text-2xl font-semibold text-white mb-3'>
										No Outfits Yet
									</h2>
									<p className='text-gray-400 max-w-md leading-relaxed'>
										Create your first outfit by going to the
										Home page, selecting items from your
										inventory, and saving them as an outfit.
									</p>
								</div>
							</div>
						) : (
							/* Outfits Grid */
							<div className='pb-6'>
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-fr'>
									{outfits.map((outfit) => (
										<OutfitCard
											key={outfit.id}
											outfit={outfit}
											onEdit={handleEditOutfit}
											onDelete={handleDeleteOutfit}
										/>
									))}
								</div>
							</div>
						)}
					</>
				)}
			</div>

			{/* Modals */}
			<EditOutfitModal
				isVisible={editModalVisible}
				setVisibility={setEditModalVisible}
				outfit={selectedOutfit}
				onOutfitUpdated={handleOutfitUpdated}
			/>

			<DeleteOutfitModal
				isVisible={deleteModalVisible}
				setVisibility={setDeleteModalVisible}
				outfitId={outfitToDelete?.id || null}
				outfitName={outfitToDelete?.name || ''}
				onOutfitDeleted={handleOutfitDeleted}
			/>
		</div>
	);
}
