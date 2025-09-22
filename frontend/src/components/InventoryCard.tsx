import { faHeart as unsaved } from '@fortawesome/free-regular-svg-icons';
import {
	faHeart as saved,
	faEdit,
	faTrash,
	faSync,
	faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect, useRef } from 'react';
import { InventoryItem } from 'src/types';

interface InventoryCardProps {
	item: InventoryItem;
	onEdit: (item: InventoryItem) => void;
	onDelete: (item: InventoryItem) => void;
	onAddToOutfit?: (item: InventoryItem) => void;
	isInCurrentOutfit?: boolean;
}

export default function InventoryCard({
	item,
	onEdit,
	onDelete,
	onAddToOutfit,
	isInCurrentOutfit = false,
}: InventoryCardProps) {
	const tagsDisplay = item.tags.map((tag) => {
		return <p className='text-accent text-sm'>{`#${tag.toUpperCase()}`}</p>;
	});

	const [isSaved, setIsSaved] = useState(item.isFavorite);
	const [showFrontImage, setShowFrontImage] = useState(true);
	const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [isInView, setIsInView] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);

	// Sync with item prop when it changes (e.g., after refresh)
	useEffect(() => {
		setIsSaved(item.isFavorite);
	}, [item.isFavorite]);

	// Intersection Observer for lazy loading
	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsInView(true);
					observer.disconnect(); // Stop observing once in view
				}
			},
			{ threshold: 0.1 }
		);

		if (cardRef.current) {
			observer.observe(cardRef.current);
		}

		return () => observer.disconnect();
	}, []);

	const handleToggleFavorite = async () => {
		if (isUpdatingFavorite) return; // Prevent multiple simultaneous requests

		setIsUpdatingFavorite(true);
		const newIsSaved = !isSaved;

		try {
			// Optimistically update UI
			setIsSaved(newIsSaved);

			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/inventory/${
					item.id
				}/favorite`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						isFavorite: newIsSaved,
					}),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to update favorite status');
			}

			// The API response contains the updated item, but we're already optimistically updated
		} catch (error) {
			// Revert on error
			setIsSaved(!newIsSaved);
			console.error('Error updating favorite status:', error);
		} finally {
			setIsUpdatingFavorite(false);
		}
	};

	return (
		<div
			ref={cardRef}
			className='flex flex-col w-70 h-fit bg-white p-2 rounded-xl shadow-lg'>
			<div className='relative w-full h-80 overflow-hidden border-secondary bg-trasnparent group'>
				{isInView ? (
					<>
						<img
							src={`${import.meta.env.VITE_API_URL}${
								showFrontImage
									? item.frontImgUrl
									: item.backImgUrl
							}`}
							className={`w-full h-full object-cover transition-opacity duration-300 rounded-xl ${
								imageLoaded ? 'opacity-100' : 'opacity-0'
							}`}
							alt={`${item.title} - ${
								showFrontImage ? 'front' : 'back'
							} view`}
							onLoad={() => setImageLoaded(true)}
							loading='lazy'
						/>
						{!imageLoaded && (
							<div className='absolute inset-0 flex items-center justify-center bg-gray-800'>
								<div className='text-gray-400 text-sm'>
									Loading...
								</div>
							</div>
						)}
					</>
				) : (
					<div className='absolute inset-0 flex items-center justify-center bg-gray-800'>
						<div className='text-gray-400 text-sm'>📷</div>
					</div>
				)}
				{item.backImgUrl && (
					<button
						onClick={() => setShowFrontImage(!showFrontImage)}
						className='absolute top-2 left-2 bg-white/20 text-white border-1 border-white hover:bg-black/50 hover:border-black cursor-pointer w-8 h-8 rounded-full flex items-center justify-center hover:bg-opacity-75 transition-all'
						title={`Switch to ${
							showFrontImage ? 'back' : 'front'
						} view`}>
						<FontAwesomeIcon icon={faSync} className='text-xs' />
					</button>
				)}
				<div className='absolute top-2 right-2 w-fit h-fit flex flex-col space-y-2'>
					<button
						className={`w-8 h-8 bg-white/20 border-1 border-white rounded-full cursor-pointer ${
							isUpdatingFavorite
								? 'opacity-50 cursor-not-allowed'
								: ''
						} ${
							isSaved
								? 'text-red-400 hover:text-white'
								: 'text-white hover:text-red-400'
						}`}
						onClick={handleToggleFavorite}
						disabled={isUpdatingFavorite}
						title={
							isSaved
								? 'Remove from favorites'
								: 'Add to favorites'
						}>
						<FontAwesomeIcon icon={isSaved ? saved : unsaved} />
					</button>
				</div>
				<div className='absolute bottom-2 right-2 w-fit h-fit flex flex-col space-y-2'>
					{onAddToOutfit && (
						<button
							onClick={() => onAddToOutfit(item)}
							disabled={isInCurrentOutfit}
							className={`w-8 h-8 rounded-full flex items-center  justify-center ${
								isInCurrentOutfit
									? 'hidden'
									: 'bg-white/20 text-white border-1 border-white hover:bg-green-600/50 hover:border-green-600 cursor-pointer'
							}`}
							title={
								isInCurrentOutfit
									? 'Already in outfit'
									: 'Add to outfit'
							}>
							<FontAwesomeIcon icon={faPlus} />
						</button>
					)}
					<button
						className='w-8 h-8 bg-white/20 border-1 border-white hover:bg-blue-600/50 hover:border-blue-600 rounded-full text-white'
						onClick={() => onEdit(item)}
						title='Edit item'>
						<FontAwesomeIcon icon={faEdit} />
					</button>
					<button
						className='w-8 h-8 bg-white/20 border-1 border-white hover:bg-red-600/50 hover:border-red-600 rounded-full text-white'
						onClick={() => onDelete(item)}
						title='Delete item'>
						<FontAwesomeIcon icon={faTrash} />
					</button>
				</div>
			</div>
			<div className='flex flex-col w-full h-30 p-2 rounded-lg'>
				<div className='flex w-full justify-between items-center'>
					<p className='text-md font-bold'>
						{item.title.toUpperCase()}
					</p>
				</div>
				<div className='pt-1'>
					<span className={`text-sm rounded-full`}>
						{item.status.toUpperCase()}
					</span>
				</div>
				<div className='flex flex-wrap space-x-2 pt-1'>
					<p className='text-accent text-sm'>{`#${item.color.toLowerCase()}`}</p>
					<p className='text-accent text-sm'>{`#${item.type.toLowerCase()}`}</p>
					{tagsDisplay}
				</div>
			</div>
		</div>
	);
}
