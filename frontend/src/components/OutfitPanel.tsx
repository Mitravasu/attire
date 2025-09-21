import { useState } from 'react';
import { CurrentOutfit } from 'src/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';

interface OutfitPanelProps {
	currentOutfit: CurrentOutfit;
	onRemoveItem: (itemId: number) => void;
	onClearAll: () => void;
	onSaveOutfit: (name: string) => void;
}

export default function OutfitPanel({
	currentOutfit,
	onRemoveItem,
	onClearAll,
	onSaveOutfit,
}: OutfitPanelProps) {
	const [outfitName, setOutfitName] = useState('');
	const [isExpanded, setIsExpanded] = useState(true);

	const handleSave = () => {
		if (outfitName.trim() && currentOutfit.items.length > 0) {
			onSaveOutfit(outfitName.trim());
			setOutfitName('');
		}
	};

	const canSave = outfitName.trim() !== '' && currentOutfit.items.length > 0;

	return (
		<div className='mt-4 border-2 border-white rounded-md backdrop-blur-md'>
			<div
				className='p-3 cursor-pointer flex items-center justify-between bg-black bg-opacity-20'
				onClick={() => setIsExpanded(!isExpanded)}>
				<h2 className='text-lg font-semibold'>
					Create Outfit ({currentOutfit.items.length})
				</h2>
				<FontAwesomeIcon
					icon={isExpanded ? faTimes : faCheck}
					className='text-sm'
				/>
			</div>

			{isExpanded && (
				<div className='p-3'>
					{/* Outfit Items Preview */}
					<div className='mb-4'>
						{currentOutfit.items.length === 0 ? (
							<p className='text-gray-400 text-sm text-center py-4'>
								Click + on items to add them to your outfit
							</p>
						) : (
							<div className='grid grid-cols-3 gap-2 max-h-40 overflow-y-auto'>
								{currentOutfit.items.map((item) => (
									<div
										key={item.id}
										className='relative group'>
										<div className='aspect-square rounded-md overflow-hidden border border-gray-600'>
											<img
												src={`${
													import.meta.env.VITE_API_URL
												}${item.frontImgUrl}`}
												alt={item.title}
												className='w-full h-full object-cover'
											/>
											<button
												onClick={() =>
													onRemoveItem(item.id)
												}
												className='absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity'
												title={`Remove ${item.title}`}>
												<FontAwesomeIcon
													icon={faTimes}
												/>
											</button>
										</div>
										<p className='text-xs text-center mt-1 truncate'>
											{item.title}
										</p>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Outfit Name Input */}
					{currentOutfit.items.length > 0 && (
						<div className='mb-4'>
							<input
								type='text'
								placeholder='Enter outfit name...'
								value={outfitName}
								onChange={(e) => setOutfitName(e.target.value)}
								className='w-full p-2 border border-gray-600 rounded-md bg-black bg-opacity-30 text-white placeholder-gray-400 focus:outline-none focus:border-white'
								onKeyPress={(e) => {
									if (e.key === 'Enter' && canSave) {
										handleSave();
									}
								}}
							/>
						</div>
					)}

					{/* Action Buttons */}
					{currentOutfit.items.length > 0 && (
						<div className='flex space-x-2'>
							<button
								onClick={handleSave}
								disabled={!canSave}
								className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
									canSave
										? 'bg-green-600 hover:bg-green-700 text-white'
										: 'bg-gray-600 text-gray-400 cursor-not-allowed'
								}`}>
								<FontAwesomeIcon
									icon={faCheck}
									className='mr-2'
								/>
								Save Outfit
							</button>
							<button
								onClick={onClearAll}
								className='py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors'
								title='Clear all items'>
								<FontAwesomeIcon icon={faTrash} />
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
