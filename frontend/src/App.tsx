// src/App.tsx
import { Routes, Route } from 'react-router-dom';

import "./styles/global.css"
import "./styles/reset.css"
import Registration from "./pages/Registration/Registration.tsx";
import {MainLayout} from "./components/MainLayout.tsx";
import Settings from "./pages/Settings/Settings.tsx";
import {OfferEditPage} from "./pages/OfferEditPage/OfferEditPage.tsx";
import {Offers} from "./pages/Offers/Offers.tsx";
import {MyOffers} from "./pages/MyOffers/MyOffers.tsx";
import {CreateOffer} from "./pages/CreateOffer/CreateOffer.tsx";

const App = () => {

  return(
    <div className="page">
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/settings" element={<Settings />} />
          <Route path="/offers/edit" element={<OfferEditPage />} />
          <Route path="/" element={<Offers />} />
          <Route path="/my-offers" element={<MyOffers />} />
          <Route path="/offer/create" element={<CreateOffer />} />

        </Route>

        <Route path="/registration" element={<Registration />} />
      </Routes>
    </div>
  );
}

export default App