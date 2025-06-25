import {useOffers} from "../../service/useOffers.ts";
import {Card} from "../../components/Card/Card.tsx";
import {useAppStore} from "../../store/store.ts";
import styles from './Offers.module.css'
import {useNavigate} from "react-router-dom";
import {RolesMap} from "../../types/common.ts";
import {useMemo, useState} from "react";
import {Offer} from "../../types/responses.ts";
import {RequestModal} from "../../components/RequestModal/RequestModal.tsx";
import {Tabs, TabsVariant} from "../../components/Tabs/Tabs.tsx";
import {FilterModal} from "../../components/FilterModal/FilterModal.tsx";
import {FilterOfferData} from "../../types/forms.ts";
import {useOffersFiltered} from "../../service/useOffersFiltered.ts";
export const Offers = () => {
  const [filters, setFilters] = useState<FilterOfferData | null>(null)
  const navigate = useNavigate();
  const {activeRole} = useAppStore();
  const {data: offersListFull, isLoading: offersListFullLoading} = useOffers(activeRole);
  const {data: offersListFiltered, isLoading: offersListFilteredLoading} = useOffersFiltered(filters);

  const offersList = useMemo(() => {
    if(filters){
      return offersListFiltered
    }
    return offersListFull
  }, [offersListFiltered, offersListFull, filters])

  const isLoading = useMemo(() => {
    if(filters){
      return offersListFilteredLoading
    }
    return offersListFullLoading
  }, [offersListFullLoading, offersListFilteredLoading, filters])

  const [requestOffer, setRequestOffer] = useState<Offer | null>(null)
  const [filterModal, setFilterModal] = useState<boolean>(false)


  const createHandle = () => {
    navigate(`/offer/create`)
  }
  if(isLoading){
    return null
  }else if(!offersList || offersList.length < 1){
    return (
      <div>
        <Tabs variant={TabsVariant.MAIN} />
        <div className={styles.links}>
          <div className={styles.link} onClick={() => setFilterModal(true)}>
            <div className={styles.linkIcon} />
            Фільтри
          </div>
          <div className={styles.link} onClick={createHandle}>Створити заявку</div>
        </div>
        <div className="no-text">Немає доступних заявок на {activeRole === RolesMap.CULTURE ? 'культуру':'техніку'}{filters && ' по заданим фільтрам'}.</div>
        {filterModal && <FilterModal currentFilters={filters} applyFilters={(data) => setFilters(data)} isOpen={filterModal} closeModal={() => setFilterModal(false)} />}
      </div>
    )
  }
  return (
    <div>
      <Tabs variant={TabsVariant.MAIN} />
      <div className={styles.links}>
        <div className={styles.link} onClick={() => setFilterModal(true)}>
          <div className={styles.linkIcon} />
          Фільтри
        </div>
        <div className={styles.link} onClick={createHandle}>Створити заявку</div>
      </div>
      {offersList.map(offer => {
        return (
          <Card offer={offer} key={offer.id} requestHandle={() => setRequestOffer(offer)} />
        )
      })}
      {filterModal && <FilterModal currentFilters={filters} applyFilters={(data) => setFilters(data)} isOpen={filterModal} closeModal={() => setFilterModal(false)} /> }
      {requestOffer && <RequestModal isOpen={!!requestOffer} offer={requestOffer} closeModal={() => setRequestOffer(null)}/>}
    </div>
  )
}