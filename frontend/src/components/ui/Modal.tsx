import { ReactNode } from "react";

type ModalProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ title, description, children, footer }: ModalProps) {
  return (
    <section aria-label={title} className="modal">
      <header className="modal__header">
        <h2>{title}</h2>
        {description ? <p className="modal__description">{description}</p> : null}
      </header>
      <div className="modal__body">{children}</div>
      {footer ? <footer className="modal__footer">{footer}</footer> : null}
    </section>
  );
}

