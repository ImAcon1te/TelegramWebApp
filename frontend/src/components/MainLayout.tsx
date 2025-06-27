// src/layouts/MainLayout.tsx
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {Header} from "./Header/Header.tsx";
import {useUser} from "../service/useUser.ts";
import {RolesToggle} from "./RolesToggle/RolesToggle.tsx";

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {isLoading, isError} = useUser()

  if(isLoading){
    return null
  }else if(isError){
    navigate('/registration', { replace: true })
  }
  const isRolesAvailable = location.pathname !=='/settings'
  console.log('locations.pathname', location.pathname)
  return (
    <>
      <Header />
      <main className={`main ${!isRolesAvailable && 'main-no-roles'}`}>
        <div className="container">
          <Outlet />

        </div>
      </main>
      {isRolesAvailable && <RolesToggle/>}
    </>

  )
};