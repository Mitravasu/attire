import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

export type DropdownProps = {
	label: string;
	items: string[];
};

export default function Dropdown({ label, items }: DropdownProps) {
	const defaultOption = 'Any';
	const [selectedOption, setSelectedOption] = useState(defaultOption);
	const [optionsVisible, setOptionsVisible] = useState(false);

	const toggleDropdown = () => {
		setOptionsVisible(!optionsVisible);
	};

	const selectOption = (item: string) => {
		setSelectedOption(item);
		setOptionsVisible(false);
	};

	const optionsList = items.map((item) => {
		return (
			<p
				className='flex p-2 w-full hover:bg-accent cursor-pointer'
				onClick={() => {
					selectOption(item);
				}}>
				{item.toUpperCase()}
			</p>
		);
	});

	return (
		<div className='flex flex-col w-60 space-y-1 p-2 items-center'>
			<label className='font-bold text-lg w-full'>{label}</label>
			<div
				className='flex border-b-1 items-center bg-primary border-secondary w-full p-2'
				onClick={toggleDropdown}>
				<p className='flex w-full'>{selectedOption.toUpperCase()}</p>
				<FontAwesomeIcon icon={faCaretDown} />
			</div>
			<div
				className='flex bg-primary border-1 border-secondary flex-col w-full h-40 overflow-scroll'
				hidden={!optionsVisible}>
				<p
					className='flex p-2 w-full text-gray-500 hover:bg-accent cursor-pointer'
					onClick={() => {
						selectOption(defaultOption);
					}}>
					{defaultOption.toUpperCase()}
				</p>
				{optionsList}
			</div>
		</div>
	);
}
