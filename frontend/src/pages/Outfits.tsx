export default function Outfits() {
	return (
		<div className='flex flex-col h-full w-full items-center justify-center space-y-4'>
			<h1 className='text-4xl font-bold text-white'>Outfits</h1>
			<div className='text-center text-gray-300'>
				<p className='text-xl mb-4'>
					Create and manage your outfit combinations
				</p>
				<p className='text-md'>This feature is coming soon! 👗</p>
				<div className='mt-8 p-6 bg-gray-700 rounded-lg max-w-lg'>
					<h3 className='text-lg font-semibold mb-3'>
						Planned Features:
					</h3>
					<ul className='text-left space-y-2'>
						<li>• Mix and match your inventory items</li>
						<li>• Save favorite outfit combinations</li>
						<li>• Get outfit suggestions</li>
						<li>• Rate and organize your looks</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
