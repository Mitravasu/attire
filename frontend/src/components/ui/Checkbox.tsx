import { InputHTMLAttributes } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function Checkbox({ id, label, ...props }: CheckboxProps) {
  return (
    <label className="checkbox" htmlFor={id}>
      <input className="checkbox__control" id={id} type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}

