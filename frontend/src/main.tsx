import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import NavBar from '@components/NavBar.tsx';

// Create a Layout component to wrap your app
function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className='flex flex-col min-h-screen max-h-screen w-full h-full items-center p-4 mx-auto overflow-y-hidden'>
			<NavBar />
			<main
				tabIndex={-1}
				role='main'
				className='w-full h-full flex-1 flex flex-col items-center overflow-y-scroll p-2'>
				{children}
			</main>
		</div>
	);
}

// Update your app rendering to use the Layout
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<div className='font-display bg-gray-800 text-white'>
			<Layout>
				<App />
			</Layout>
		</div>
	</StrictMode>
);
