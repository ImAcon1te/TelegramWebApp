import {useOffers} from "../../service/useOffers.ts";
import {Card} from "../../components/Card/Card.tsx";
import {useAppStore} from "../../store/store.ts";
import styles from './Offers.module.css'
import {useNavigate} from "react-router-dom";
import {RolesMap} from "../../types/common.ts";
import {useState} from "react";
import {Offer} from "../../types/responses.ts";
import {RequestModal} from "../../components/RequestModal/RequestModal.tsx";
import {Tabs, TabsVariant} from "../../components/Tabs/Tabs.tsx";
export const Offers = () => {
  const navigate = useNavigate();
  const {activeRole} = useAppStore();
  const {data: offersList, isLoading} = useOffers(activeRole);
  const [requestOffer, setRequestOffer] = useState<Offer | null>(null)
  console.log('requestModal')
  if(isLoading){
    return null
  }else if(!offersList || offersList.length < 1){
    if(activeRole === RolesMap.CULTURE){
      return (
        <div>
          <Tabs variant={TabsVariant.MAIN} />
          <div className="no-text">Немає доступних заявок на культуру</div>
        </div>
      )
    }else{
      return (
        <div>
          <Tabs variant={TabsVariant.MAIN} />
          <div className="no-text">Немає доступних заявок на техніку</div>
        </div>
      )
    }
  }
  const createHandle = () => {
    navigate(`/offer/create`)
  }
  return (
    <div>
      <Tabs variant={TabsVariant.MAIN} />
      <div className={styles.links}>
        <div></div>
        <div className={styles.link} onClick={createHandle}>Створити заявку</div>
      </div>
      {offersList.map(offer => {
        return (
          <Card offer={offer} key={offer.id} requestHandle={() => setRequestOffer(offer)} />
        )
      })}

      {requestOffer && <RequestModal requestOffer={requestOffer} closeModal={() => setRequestOffer(null)}/>}
    </div>
  )
}