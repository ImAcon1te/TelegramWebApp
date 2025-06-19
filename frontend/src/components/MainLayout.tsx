// src/layouts/MainLayout.tsx
import {Outlet, useNavigate} from 'react-router-dom';
import {Header} from "./Header/Header.tsx";
import {useUser} from "../service/useUser.ts";

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();

  const {isLoading, isError} = useUser()

  if(isLoading){
    return null
  }else if(isError){
    navigate('/registration', { replace: true })
  }
  return (
    <div>
      <Header />

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
};