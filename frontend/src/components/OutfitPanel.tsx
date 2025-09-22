import { useState } from 'react';
import { CurrentOutfit } from 'src/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import TextInput from './TextInput';

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

	const handleSave = () => {
		if (outfitName.trim() && currentOutfit.items.length > 0) {
			onSaveOutfit(outfitName.trim());
			setOutfitName('');
		}
	};

	const canSave = outfitName.trim() !== '' && currentOutfit.items.length > 0;

	return (
		<div className='bg-gray-200 rounded-md h-full flex flex-col'>
			<div className='p-3 flex items-center justify-between bg-opacity-20 flex-shrink-0'>
				<h2 className='text-lg font-semibold'>
					Outfit ({currentOutfit.items.length})
				</h2>
				{currentOutfit.items.length > 0 && (
					<button
						onClick={onClearAll}
						className='py-1 px-2 bg-red-600 hover:bg-red-700 rounded-full w-8 h-8 text-white transition-colors cursor-pointer'
						title='Clear all items'>
						<FontAwesomeIcon icon={faTrash} />
					</button>
				)}
			</div>

			<div className='p-3 flex-1 flex flex-col min-h-0'>
				{/* Outfit Items Preview */}
				<div className='flex-1 min-h-0 mb-4'>
					{currentOutfit.items.length === 0 ? (
						<p className='text-gray-400 text-sm text-center py-4'>
							Click + on items to add them to your outfit
						</p>
					) : (
						<div className='grid grid-cols-3 gap-2 overflow-y-auto h-full'>
							{currentOutfit.items.map((item) => (
								<div key={item.id} className='relative group'>
									<div className='rounded-lg border-1 border-white'>
										<img
											src={`${
												import.meta.env.VITE_API_URL
											}${item.frontImgUrl}`}
											alt={item.title}
											className='w-full h-full object-cover rounded-lg'
										/>
										<button
											onClick={() =>
												onRemoveItem(item.id)
											}
											className='absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity'
											title={`Remove ${item.title}`}>
											<FontAwesomeIcon icon={faTimes} />
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Outfit Name Input */}
				{currentOutfit.items.length > 0 && (
					<div className='mb-4 flex-shrink-0'>
						<input
							type='text'
							placeholder='Enter outfit name...'
							value={outfitName}
							onChange={(e) => setOutfitName(e.target.value)}
							className='w-full p-2 bg-white text-black rounded-lg inset-shadow-sm'
						/>
					</div>
				)}

				{/* Save Button */}
				{currentOutfit.items.length > 0 && (
					<div className='flex-shrink-0'>
						<button
							onClick={handleSave}
							disabled={!canSave}
							className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
								canSave
									? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
									: 'bg-gray-600 text-gray-400 cursor-not-allowed'
							}`}>
							<FontAwesomeIcon icon={faCheck} className='mr-2' />
							Save Outfit
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
