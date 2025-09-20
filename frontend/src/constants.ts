// Color options for inventory items
export const COLOR_OPTIONS = [
	'beige',
	'black',
	'blue',
	'brown',
	'cream',
	'gold',
	'gray',
	'green',
	'maroon',
	'navy',
	'olive',
	'orange',
	'pink',
	'purple',
	'red',
	'silver',
	'teal',
	'white',
	'yellow',
	'other',
] as const;

// Type options for inventory items
export const TYPE_OPTIONS = [
	'accessories',
	'blazer',
	'blouse',
	'cardigan',
	'coat',
	'dress',
	'hoodie',
	'jacket',
	'jeans',
	'jumpsuit',
	'other',
	'pants',
	'shirt',
	'shoes',
	'shorts',
	'skirt',
	'socks',
	'suit',
	'sweater',
	'swimwear',
	'tank top',
	'tshirt',
	'underwear',
	'vest',
] as const;

export type ColorOption = (typeof COLOR_OPTIONS)[number];
export type TypeOption = (typeof TYPE_OPTIONS)[number];
