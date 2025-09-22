export default function Button({
	onClick,
	color = 'blue',
	type = 'button',
	disabled = false,
	label,
}: {
	onClick: () => void;
	color?: 'blue' | 'red';
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
