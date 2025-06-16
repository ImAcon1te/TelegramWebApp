// src/layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import {Header} from "./Header/Header.tsx";

export const MainLayout: React.FC = () => (
  <div className="page">
    <Header />

    <main className="main">
      <Outlet />
    </main>
  </div>
);