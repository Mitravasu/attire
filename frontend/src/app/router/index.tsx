import { Route, Routes } from "react-router-dom";
import { AppShell } from "app/layouts/AppShell";
import { HomePage } from "pages/home/HomePage";
import { OutfitsPage } from "pages/outfits/OutfitsPage";
import { PlannerPage } from "pages/planner/PlannerPage";
import { LoginPage } from "pages/auth/LoginPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/outfits" element={<OutfitsPage />} />
        <Route path="/planner" element={<PlannerPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

