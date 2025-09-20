import { faBookmark as unsaved } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as saved } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { InventoryItem } from 'src/types';

export default function InventoryCard({ item }: { item: InventoryItem }) {
	const tagsDisplay = item.tags.map((tag) => {
		return <p className='text-accent text-sm'>{`#${tag.toUpperCase()}`}</p>;
	});

	const [isSaved, setIsSaved] = useState(false);

	return (
		<div className='flex flex-col w-70 h-fit m-3'>
			<img
				src={`${import.meta.env.VITE_API_URL}${item.imgUrl}`}
				className='w-full border-secondary h-80 overflow-hidden'></img>
			<div className='flex flex-col w-full h-30 pt-1'>
				<div className='flex w-full justify-between'>
					<p className='text-md'>{item.title.toUpperCase()}</p>
					<button
						className='cursor-pointer hover:text-accent'
						onClick={() => setIsSaved(!isSaved)}>
						<FontAwesomeIcon icon={isSaved ? saved : unsaved} />
					</button>
				</div>
				<div className='flex flex-wrap space-x-2 pt-1'>
					{tagsDisplay}
				</div>
			</div>
		</div>
	);
}
