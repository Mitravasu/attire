import { ReactNode } from "react";

type PlannerLayoutProps = {
  calendar: ReactNode;
  sidebar: ReactNode;
};

export function PlannerLayout({ calendar, sidebar }: PlannerLayoutProps) {
  return (
    <div className="planner-layout">
      <section className="planner-layout__calendar">{calendar}</section>
      <aside className="planner-layout__sidebar">{sidebar}</aside>
    </div>
  );
}

