import { ReactNode } from "react";

type OutfitsLayoutProps = {
  children: ReactNode;
};

export function OutfitsLayout({ children }: OutfitsLayoutProps) {
  return <div className="outfits-layout">{children}</div>;
}

