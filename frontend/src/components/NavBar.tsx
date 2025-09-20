export default function NavBar() {
	return (
		<div className='flex justify-between p-2 w-full h-full'>
			<div className='flex'>
				<a href='/' className='text-2xl'>
					attire
				</a>
			</div>
			<div className='flex space-x-5'>
				<a href='/outfits' className='text-2xl'>
					Outfits
				</a>
				<a href='/planner' className='text-2xl'>
					Planner
				</a>
			</div>
		</div>
	);
}
