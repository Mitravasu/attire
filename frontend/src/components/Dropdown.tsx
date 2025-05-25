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
				className='flex p-2 justify-center w-full hover:bg-accent cursor-pointer'
				onClick={() => {
					selectOption(item);
				}}>
				{item}
			</p>
		);
	});

	return (
		<div className='flex flex-col w-60 space-y-1 p-2 items-center'>
			<label className='font-bold underline text-lg'>{label}</label>
			<div
				className='flex border-2 items-center bg-primary border-secondary w-full p-2 rounded-lg'
				onClick={toggleDropdown}>
				<p className='flex w-full justify-center'>{selectedOption}</p>
				<FontAwesomeIcon icon={faCaretDown} />
			</div>
			<div
				className='flex bg-primary border-2 border-secondary flex-col w-full h-40 rounded-lg overflow-scroll'
				hidden={!optionsVisible}>
				<p
					className='flex p-2 justify-center w-full text-gray-500 hover:bg-accent cursor-pointer'
					onClick={() => {
						selectOption(defaultOption);
					}}>
					{defaultOption}
				</p>
				{optionsList}
			</div>
		</div>
	);
}
