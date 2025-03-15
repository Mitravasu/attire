export type ItemCardProps = {
    imgPath: string;
    title: string;
    tags: string[];
};

export default function ItemCard({ imgPath, title, tags }: ItemCardProps) {
    const tagsDisplay = tags.map((tag) => {
        return <p className='text-blue-500'>{`#${tag}`}</p>;
    });
    return (
        <div className='flex flex-col space-y-4 w-70 h-fit m-3'>
            <img
                src={imgPath}
                className='w-full border-2 border-black bg-white h-80 rounded-lg overflow-hidden'></img>
            <div className='flex flex-col items-center w-full h-30 bg-white border-2 border-black rounded-lg p-2'>
                <p className='text-lg font-bold'>{title}</p>
                <div className='flex flex-wrap space-x-2 justify-center'>
                    {tagsDisplay}
                </div>
            </div>
        </div>
    );
}
