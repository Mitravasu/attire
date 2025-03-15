import ItemCard from './ItemCard';

export type ClothingItem = {
    imgPath: string;
    title: string;
    tags: string[];
};

export default function Display() {
    const clothingItems: ClothingItem[] = [
        {
            imgPath: './public/jacket.png',
            title: 'Cozy Hoodie',
            tags: ['hoodie', 'casual', 'winter', 'comfortable'],
        },
        {
            imgPath: './public/jacket.png',
            title: 'Basic T-Shirt',
            tags: ['t-shirt', 'casual', 'summer', 'comfortable'],
        },
        {
            imgPath: './public/jacket.png',
            title: 'Leather Jacket',
            tags: ['jacket', 'stylish', 'night-out', 'fall'],
        },
        {
            imgPath: './public/jacket.png',
            title: 'Evening Dress',
            tags: ['dress', 'formal', 'night-out', 'elegant'],
        },
        {
            imgPath: './public/jacket.png',
            title: 'Blue Jeans',
            tags: ['jeans', 'casual', 'comfortable', 'everyday'],
        },
        {
            imgPath: './public/jacket.png',
            title: 'Running Sneakers',
            tags: ['sneakers', 'sport', 'comfortable', 'active'],
        },
        {
            imgPath: './public/jacket.png',
            title: 'Knitted Sweater',
            tags: ['sweater', 'winter', 'comfortable', 'cozy'],
        },
        {
            imgPath: './public/jacket.png',
            title: 'Floral Skirt',
            tags: ['skirt', 'summer', 'casual', 'feminine'],
        },
        {
            imgPath: './public/jacket.png',
            title: 'Silk Blouse',
            tags: ['blouse', 'formal', 'elegant', 'work'],
        },
        {
            imgPath: './public/jacket.png',
            title: 'Cargo Shorts',
            tags: ['shorts', 'summer', 'casual', 'comfortable'],
        },
        {
            imgPath: './public/jacket.png',
            title: 'Knitted Sweater',
            tags: ['sweater', 'winter', 'comfortable', 'cozy'],
        },
        {
            imgPath: './public/jacket.png',
            title: 'Floral Skirt',
            tags: ['skirt', 'summer', 'casual', 'feminine'],
        },
        {
            imgPath: './public/jacket.png',
            title: 'Silk Blouse',
            tags: ['blouse', 'formal', 'elegant', 'work'],
        },
        {
            imgPath: './public/jacket.png',
            title: 'Cargo Shorts',
            tags: ['shorts', 'summer', 'casual', 'comfortable'],
        },
    ];

    const itemCards = clothingItems.map((item) => {
        return (
            <ItemCard
                imgPath={item.imgPath}
                title={item.title}
                tags={item.tags}
            />
        );
    });

    return (
        <div className='flex w-full h-full justify-center'>
            <div className='flex w-full h-full flex-wrap justify-evenly bg-gray-200 overflow-scroll rounded-lg'>
                {itemCards}
            </div>
        </div>
    );
}
