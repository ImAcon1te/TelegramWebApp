import styles from "./tabs.module.css";
import {Link, useLocation} from "react-router-dom";
import {FC, useMemo} from "react";
const tabItemsMain = [
  { path: '/', label: 'Список оголошень'},
  { path: '/my-offers', label: 'Мої'},
];
const tabItemsNotification = [
  { path: '/', label: 'Назад до оголошень'},
  { path: '/sent', label: 'Відправлені'},
  { path: '/received', label: 'Отримані'},

];
export enum TabsVariant {
  MAIN = 'main',
  NOTIFICATIONS = 'notifications'
}
interface Props {
  variant: TabsVariant
}
export const Tabs:FC<Props> = ({variant}) => {
  const location = useLocation();
  console.log('location tabs', location)
  const tabItems = useMemo(() => {
    if(variant === TabsVariant.NOTIFICATIONS){
      return tabItemsNotification
    }
    return tabItemsMain
  }, [variant])
  return (
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
  )

}