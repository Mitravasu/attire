import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import NavBar from '@components/NavBar.tsx';

// Create a Layout component to wrap your app
function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className='flex flex-col h-full w-full overflow-hidden'>
			<NavBar />
			<main
				tabIndex={-1}
				role='main'
				className='flex flex-col h-full w-full p-2 overflow-hidden'>
				{children}
			</main>
		</div>
	);
}

// Update your app rendering to use the Layout
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Router>
			<div className='font-display bg-gray-800 text-white flex flex-col h-screen w-full overflow-hidden'>
				<Layout>
					<App />
				</Layout>
			</div>
		</Router>
	</StrictMode>
);
