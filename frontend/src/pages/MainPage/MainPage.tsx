import {useState} from "react";
import styles from './MainPage.module.css'
import {Create} from "../../tabs/Create/Create.tsx";
const tabItems = [
  { key: 'list', label: 'Список оголошень', content: <div>1</div> },
  { key: 'create', label: 'Створення', content: <Create/> },
  { key: 'myList', label: 'Мої', content: <div>3</div> },
];
const MainPage = () => {
  const [activeTab, setActiveTab] = useState(tabItems[1].key);
  return <div>
    <div className={styles.tabs}>
      {tabItems.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tab} ${activeTab === tab.key && styles.tabActive}`}
          onClick={() => setActiveTab(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>

      <div className="tab-content">
        {tabItems.map(
          (tab) =>
            activeTab === tab.key && (
              <div key={tab.key}>{tab.content}</div>
            )
        )}
      </div>
  </div>
}

export default MainPage