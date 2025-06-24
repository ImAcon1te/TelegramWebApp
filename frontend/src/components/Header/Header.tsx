import styles from "./Header.module.css"
import {Link} from "react-router-dom";

export const Header = () => {
  return (
    <nav className={styles.header}>
      <div className="container">
        <div className={styles.headerWrapper}>
          <Link to="/received" className={styles.link}>
          </Link>
          <Link to="/settings" className={styles.link}>
          </Link>
        </div>
      </div>
    </nav>
  )
}