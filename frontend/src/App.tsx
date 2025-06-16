// src/App.tsx
import { Routes, Route } from 'react-router-dom';

import "./App.css"
import "./styles/global.css"
import "./styles/reset.css"
import Registration from "./pages/Registration";
import {MainLayout} from "./components/MainLayout.tsx";
import MainPage from "./pages/MainPage/MainPage.tsx";

// src/pages/Home.tsx
export const Home = () => <h1>Главная страница</h1>;

// src/pages/About.tsx
export const About = () => <h1>О нас</h1>;

// src/pages/NotFound.tsx
export const NotFound = () => <h1>404 — Страница не найдена</h1>;

const App = () => {

  return(
    <div>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/about" element={<About />} />
        </Route>

        <Route path="/registration" element={<Registration />} />
      </Routes>
    </div>
  );
}

export default App