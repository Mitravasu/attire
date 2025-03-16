import Display from '@components/Display';
import FilterBar from '@components/FilterBar';

function App() {
    return (
        <div className='flex h-screen font-display p-4 space-x-4'>
            <FilterBar />
            <Display />
        </div>
    );
}

export default App;
