import { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
};

export function Card({ title, children }: CardProps) {
  return (
    <article className="card">
      {title ? <header className="card__header">{title}</header> : null}
      <div className="card__body">{children}</div>
    </article>
  );
}

