import { Link } from 'react-router-dom';

export default function NavBar() {
	return (
		<div className='flex justify-between p-2 w-full h-full'>
			<div className='flex'>
				<Link
					to='/'
					className='text-2xl hover:text-accent transition-colors'>
					attire
				</Link>
			</div>
			<div className='flex space-x-5'>
				<Link
					to='/outfits'
					className='text-2xl hover:text-accent transition-colors'>
					Outfits
				</Link>
				<Link
					to='/planner'
					className='text-2xl hover:text-accent transition-colors'>
					Planner
				</Link>
			</div>
		</div>
	);
}
