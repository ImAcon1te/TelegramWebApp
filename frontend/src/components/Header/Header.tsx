import styles from "./Header.module.css"
import {Link} from "react-router-dom";
import {NotificationsIcon} from "../../assets/icons/notifications-icon.tsx";
import {useOffersReceived} from "../../service/useOffersReceived.ts";
import {RolesMap} from "../../types/common.ts";

export const Header = () => {
  const {data: receivedListCulture} = useOffersReceived(RolesMap.CULTURE)
  const {data: receivedListVahicle} = useOffersReceived(RolesMap.VEHICLE)


  return (
    <nav className={styles.header}>
      <div className="container">
        <div className={styles.headerWrapper}>
          <Link to="/received" className={styles.link}>
            <div className={styles.countWrapper}>
              <NotificationsIcon />
              <div className={styles.count}>{ receivedListCulture && receivedListVahicle ? receivedListCulture?.length + receivedListVahicle?.length : 3}</div>
            </div>
          </Link>
          <Link to="/settings" className={styles.link}>
            <img src="assets/user-photo.png" />
          </Link>
        </div>
      </div>
    </nav>
  )
}