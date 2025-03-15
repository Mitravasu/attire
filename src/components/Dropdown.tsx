export type DropdownProps = {
    label: string;
};

export default function Dropdown({ label }: DropdownProps) {
    return (
        <div className="flex flex-col items-center">
            <label>{label}</label>
            <h1>Dropdown</h1>
        </div>
    );
}
