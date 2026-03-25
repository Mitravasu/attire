import { ReactNode } from "react";

type ErrorStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div className="error-state__action">{action}</div> : null}
    </div>
  );
}

