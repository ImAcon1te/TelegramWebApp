// src/layouts/MainLayout.tsx
import {Outlet, useNavigate} from 'react-router-dom';
import {Header} from "./Header/Header.tsx";
import {useUser} from "../service/useUser.ts";
import {RolesToggle} from "./RolesToggle/RolesToggle.tsx";

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();

  const {isLoading, isError} = useUser()

  if(isLoading){
    return null
  }else if(isError){
    navigate('/registration', { replace: true })
  }
  return (
    <>
      <Header />
      <main className="main">
        <div className="container">
          <Outlet />

        </div>
      </main>
      <RolesToggle />
    </>

  )
};