import { ReactNode } from "react";

type PageLayoutProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PageLayout({
  title,
  description,
  actions,
  children,
}: PageLayoutProps) {
  return (
    <section className="page-layout">
      <header className="page-layout__header">
        <div>
          <p className="page-layout__eyebrow">Application Overview</p>
          <h1>{title}</h1>
          <p className="page-layout__description">{description}</p>
        </div>
        {actions ? <div className="page-layout__actions">{actions}</div> : null}
      </header>
      <div className="page-layout__body">{children}</div>
    </section>
  );
}

