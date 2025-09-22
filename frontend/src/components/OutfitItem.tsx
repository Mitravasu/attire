import { DraggedOutfit, Outfit } from 'src/types';
import { getImageUrl } from 'src/utils/api';

interface OutfitItemProps {
	outfit: Outfit;
	onDragStart?: (dragData: DraggedOutfit) => void;
}

export default function OutfitItem({ outfit, onDragStart }: OutfitItemProps) {
	const handleDragStart = (e: React.DragEvent) => {
		const dragData: DraggedOutfit = {
			outfit,
			sourceType: 'sidebar',
		};

		e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
		e.dataTransfer.effectAllowed = 'copy';

		if (onDragStart) {
			onDragStart(dragData);
		}
	};

	return (
		<div
			className='bg-white rounded-lg p-3 cursor-move hover:shadow-md transition-colors group'
			draggable
			onDragStart={handleDragStart}>
			<div className='flex items-start space-x-3'>
				{/* Outfit Info */}
				<div className='flex-1 min-w-0'>
					<h3 className='font-medium text-sm line-clamp-2 mb-1'>
						{outfit.name}
					</h3>
					<p className='text-gray-400 text-xs'>
						{outfit.items.length} item
						{outfit.items.length !== 1 ? 's' : ''}
					</p>

					{/* Item Types */}
					<div className='mt-2'>
						<div className='flex flex-wrap gap-1'>
							{Array.from(
								new Set(outfit.items.map((item) => item.type))
							)
								.slice(0, 3)
								.map((type) => (
									<span
										key={type}
										className='px-1.5 py-0.5 bg-gray-600 text-gray-300 text-xs rounded'>
										{type}
									</span>
								))}
						</div>
					</div>
				</div>
				{/* Outfit Preview */}
				<div className='flex-shrink-0'>
					<div className='flex space-x-1'>
						{outfit.items.slice(0, 2).map((item) => (
							<div
								key={item.id}
								className='w-10 h-10 rounded-sm bg-gray-600 bg-cover bg-center'
								style={{
									backgroundImage: `url(${getImageUrl(
										item.frontImgUrl
									)})`,
								}}
								title={item.title}
							/>
						))}
						{outfit.items.length > 2 && (
							<div className='w-10 h-10 rounded-sm bg-gray-600 border border-gray-500 flex items-center justify-center text-xs text-gray-300'>
								+{outfit.items.length - 2}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
