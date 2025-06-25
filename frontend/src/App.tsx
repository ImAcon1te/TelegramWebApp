// src/App.tsx
import {Routes, Route, useLocation} from 'react-router-dom';

import "./styles/global.css"
import "./styles/reset.css"
import Registration from "./pages/Registration/Registration.tsx";
import {MainLayout} from "./components/MainLayout.tsx";
import Settings from "./pages/Settings/Settings.tsx";
import {OfferEditPage} from "./pages/OfferEditPage/OfferEditPage.tsx";
import {Offers} from "./pages/Offers/Offers.tsx";
import {MyOffers} from "./pages/MyOffers/MyOffers.tsx";
import {CreateOffer} from "./pages/CreateOffer/CreateOffer.tsx";
import {ReceivedOffers} from "./pages/ReceivedOffers/ReceivedOffers.tsx";
import {SentOffers} from "./pages/SentOffers/SentOffers.tsx";
import {getTg} from "./service/service.ts";
import {useEffect, useState} from "react";
const SaveRoute = () => {

  return null;
};
const App = () => {
  const [tgInited, setTgInited] = useState<boolean>(false)


  const location = useLocation();
  useEffect(() => {
    const path = location.pathname + location.search;
    sessionStorage.setItem('lastValidPath', path);
    setTgInited(true)
  }, [location]);

  if(!tgInited){
    return null
  }
    console.log('test get tg 1', getTg())

  return(
    <div className="page">
      <SaveRoute />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/settings" element={<Settings />} />
          <Route path="/offers/edit" element={<OfferEditPage />} />
          <Route path="/" element={<Offers />} />
          <Route path="/my-offers" element={<MyOffers />} />
          <Route path="/offer/create" element={<CreateOffer />} />
          <Route path="/received" element={<ReceivedOffers />} />
          <Route path="/sent" element={<SentOffers />} />
          <Route path="*" element={<Offers />} />
        </Route>

        <Route path="/registration" element={<Registration />} />
      </Routes>
    </div>
  );
}

export default App