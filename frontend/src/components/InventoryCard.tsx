import { faBookmark as unsaved } from '@fortawesome/free-regular-svg-icons';
import {
	faBookmark as saved,
	faEdit,
	faTrash,
	faSync,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { InventoryItem } from 'src/types';

interface InventoryCardProps {
	item: InventoryItem;
	onEdit: (item: InventoryItem) => void;
	onDelete: (item: InventoryItem) => void;
}

export default function InventoryCard({
	item,
	onEdit,
	onDelete,
}: InventoryCardProps) {
	const tagsDisplay = item.tags.map((tag) => {
		return <p className='text-accent text-sm'>{`#${tag.toUpperCase()}`}</p>;
	});

	const [isSaved, setIsSaved] = useState(false);
	const [showFrontImage, setShowFrontImage] = useState(true);

	return (
		<div className='flex flex-col w-70 h-fit m-3'>
			<div className='relative w-full h-80 overflow-hidden border-secondary'>
				<img
					src={`${import.meta.env.VITE_API_URL}${
						showFrontImage ? item.frontImgUrl : item.backImgUrl
					}`}
					className='w-full h-full object-cover'
					alt={`${item.title} - ${
						showFrontImage ? 'front' : 'back'
					} view`}
				/>
				<div className='absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded'>
					{showFrontImage ? 'Front' : 'Back'}
				</div>
				{item.backImgUrl && (
					<button
						onClick={() => setShowFrontImage(!showFrontImage)}
						className='absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-75 transition-all'
						title={`Switch to ${
							showFrontImage ? 'back' : 'front'
						} view`}>
						<FontAwesomeIcon icon={faSync} />
					</button>
				)}
			</div>
			<div className='flex flex-col w-full h-30 pt-1'>
				<div className='flex w-full justify-between items-center'>
					<p className='text-md'>{item.title.toUpperCase()}</p>
					<div className='flex space-x-2'>
						<button
							className='cursor-pointer hover:text-blue-500 transition-colors'
							onClick={() => onEdit(item)}
							title='Edit item'>
							<FontAwesomeIcon icon={faEdit} />
						</button>
						<button
							className='cursor-pointer hover:text-red-500 transition-colors'
							onClick={() => onDelete(item)}
							title='Delete item'>
							<FontAwesomeIcon icon={faTrash} />
						</button>
						<button
							className='cursor-pointer hover:text-accent'
							onClick={() => setIsSaved(!isSaved)}
							title={
								isSaved
									? 'Remove from favorites'
									: 'Add to favorites'
							}>
							<FontAwesomeIcon icon={isSaved ? saved : unsaved} />
						</button>
					</div>
				</div>
				<div className='flex flex-wrap space-x-2 pt-1'>
					{tagsDisplay}
				</div>
				<div className='pt-1'>
					<span
						className={`text-xs px-2 py-1 rounded-full ${
							item.status === 'dirty'
								? 'bg-red-200 text-red-800'
								: item.status === 'washed'
								? 'bg-yellow-200 text-yellow-800'
								: 'bg-green-200 text-green-800'
						}`}>
						{item.status.toUpperCase()}
					</span>
				</div>
			</div>
		</div>
	);
}
