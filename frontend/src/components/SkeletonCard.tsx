export default function SkeletonCard() {
	return (
		<div className='flex flex-col w-70 h-fit m-3 animate-pulse'>
			{/* Image skeleton */}
			<div className='w-full h-80 bg-gray-700 rounded-t-md'></div>

			{/* Content skeleton */}
			<div className='flex flex-col w-full h-30 pt-1'>
				{/* Title skeleton */}
				<div className='flex w-full justify-between items-center mb-2'>
					<div className='h-4 bg-gray-700 rounded w-3/4'></div>
					<div className='flex space-x-2'>
						<div className='h-4 w-4 bg-gray-700 rounded'></div>
						<div className='h-4 w-4 bg-gray-700 rounded'></div>
						<div className='h-4 w-4 bg-gray-700 rounded'></div>
					</div>
				</div>

				{/* Tags skeleton */}
				<div className='flex flex-wrap space-x-2 pt-1 mb-2'>
					<div className='h-3 bg-gray-700 rounded w-12'></div>
					<div className='h-3 bg-gray-700 rounded w-16'></div>
					<div className='h-3 bg-gray-700 rounded w-14'></div>
				</div>

				{/* Status skeleton */}
				<div className='pt-1'>
					<div className='h-6 bg-gray-700 rounded-full w-20'></div>
				</div>
			</div>
		</div>
	);
}
