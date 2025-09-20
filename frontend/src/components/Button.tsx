export default function Button({
	onClick,
	type = 'button',
	disabled = false,
	label,
}: {
	onClick: () => void;
	type?: 'button' | 'submit' | 'reset';
	label: string;
	disabled?: boolean;
}) {
	return (
		<button
			className='p-2 rounded-md bg-black'
			onClick={onClick}
			disabled={disabled}
			type={type}>
			{label}
		</button>
	);
}
