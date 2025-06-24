import styles from './RolesToggle.module.css'
import {useAppStore} from "../../store/store.ts";
import {RolesMap} from "../../types/common.ts";
import {CultureIcon} from "../../assets/icons/culture-icon.tsx";
import {VehicleIcon} from "../../assets/icons/vehicle-icon.tsx";

export const RolesToggle = () => {
  const {activeRole, setRole} = useAppStore()
  return (
    <div className={styles.roles}>
      <div className="container">
        <div className={styles.wrapper}>
          <div className={`${styles.role} ${activeRole===RolesMap.CULTURE && styles.roleActive}`} onClick={() => setRole(RolesMap.CULTURE)}>
            <CultureIcon/>
            <span>Культура</span>
          </div>
          <div className={`${styles.role} ${activeRole===RolesMap.VEHICLE && styles.roleActive}`} onClick={() => setRole(RolesMap.VEHICLE)}>
            <VehicleIcon/>
            <span>Техніка</span>
          </div>
        </div>

      </div>
    </div>
  )
}