export default function Button({
	onClick,
	color = 'blue',
	type = 'button',
	disabled = false,
	label,
}: {
	onClick: () => void;
	color?: 'blue' | 'red' | 'black' | 'green' | 'gray';
	type?: 'button' | 'submit' | 'reset';
	label: string;
	disabled?: boolean;
}) {
	let colorStyling = '';
	switch (color) {
		case 'blue':
			colorStyling = 'bg-blue-600 text-white hover:bg-blue-700';
			break;
		case 'red':
			colorStyling = 'bg-red-600 hover:bg-red-700 text-white';
			break;
		case 'black':
			colorStyling = 'bg-black text-white hover:bg-gray-800';
			break;
		case 'green':
			colorStyling = 'bg-green-600 text-white hover:bg-green-700';
			break;
		case 'gray':
			colorStyling = 'bg-gray-300 text-black hover:bg-gray-400';
			break;
	}

	return (
		<button
			className={`font-bold p-2 rounded-lg ${colorStyling} disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer`}
			onClick={onClick}
			disabled={disabled}
			type={type}>
			{label}
		</button>
	);
}
