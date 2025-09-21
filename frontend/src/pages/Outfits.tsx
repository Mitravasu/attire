import OutfitPanel from '@components/OutfitPanel';

export default function Outfits() {
	return (
		<div className='flex flex-col h-full w-full items-center justify-center space-y-4'>
			<h1 className='text-4xl font-bold text-white'>Outfits</h1>
			<OutfitPanel />
		</div>
	);
}
