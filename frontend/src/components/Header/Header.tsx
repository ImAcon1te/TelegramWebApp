import styles from "./Header.module.css"
import {Link, useLocation} from "react-router-dom";

const tabItems = [
  { path: '/', label: 'Список оголошень'},
  { path: '/my-offers', label: 'Мої'},
];
export const Header = () => {
  const location = useLocation();

  return (
    <nav className={styles.header}>
      <div className="container">
        <div className={styles.headerWrapper}>
          <Link to="/notifications" className={styles.link}>
          </Link>
          <Link to="/settings" className={styles.link}>
          </Link>
        </div>
        <div className={styles.tabs}>
          {tabItems.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`${styles.tab} ${location.pathname === tab.path && styles.tabActive}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}