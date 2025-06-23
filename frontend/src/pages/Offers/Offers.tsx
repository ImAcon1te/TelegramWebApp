import {useOffers} from "../../service/useOffers.ts";
import {Card} from "../../components/Card/Card.tsx";
import {useAppStore} from "../../store/store.ts";
import styles from './Offers.module.css'
import {useNavigate} from "react-router-dom";
import {RolesMap} from "../../types/common.ts";
export const Offers = () => {
  const navigate = useNavigate();
  const {activeRole} = useAppStore();
  const {data: offersList, isLoading} = useOffers(activeRole);
  console.log('offersList', offersList)
  if(isLoading){
    return null
  }else if(!offersList || offersList.length < 1){
    if(activeRole === RolesMap.CULTURE){
      return <div className="no-text">Немає доступних заявок на культуру</div>
    }else{
      return <div className="no-text">Немає доступних заявок на техніку</div>
    }
  }
  const createHandle = () => {
    navigate(`/offer/create`)
  }
  return (
    <div>
      <div className={styles.links}>
        <div></div>
        <div className={styles.link} onClick={createHandle}>Створити заявку</div>
      </div>
      {offersList.map(offer => {
        return (
          <Card offer={offer} key={offer.id} />
        )
      })}
    </div>
  )
}