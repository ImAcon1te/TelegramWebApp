import styles from "./Header.module.css"
import {Link} from "react-router-dom";
import {NotificationsIcon} from "../../assets/icons/notifications-icon.tsx";
export const Header = () => {
  return (
    <nav className={styles.header}>
      <div className="container">
        <div className={styles.headerWrapper}>
          <Link to="/received" className={styles.link}>
            <div className={styles.countWrapper}>
              <NotificationsIcon />
              <div className={styles.count}>3</div>
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