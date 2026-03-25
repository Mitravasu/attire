import { ReactNode } from "react";

type HomeLayoutProps = {
  rail: ReactNode;
  content: ReactNode;
};

export function HomeLayout({ rail, content }: HomeLayoutProps) {
  return (
    <div className="home-layout">
      <aside className="home-layout__rail">{rail}</aside>
      <section className="home-layout__content">{content}</section>
    </div>
  );
}

