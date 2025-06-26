import styles from "./Card.module.css"
import {Offer, RequestOffer} from "../../types/responses.ts";
import {FC, useState} from "react";
import {ArrowIcon} from "../../assets/icons/right-arrow-icon.tsx";
import {EditIcon} from "../../assets/icons/edit-icon.tsx";
import {CrossIcon} from "../../assets/icons/cross-icon.tsx";
import {PlusIcon} from "../../assets/icons/plus-icon.tsx";
import {ArrowDownIcon} from "../../assets/icons/arrow-down-icon.tsx";
interface CardProps {
  offer: Offer
  editHandle?: () => void
  deleteHandle?: () => void
  requestHandle?: () => void
  requestOffer?: RequestOffer

}
export const Card:FC<CardProps> = ({
  offer,
  editHandle,
  deleteHandle,
  requestHandle,
  requestOffer
}) => {
  const [descActive, setDescActive] = useState<boolean>(false);
  return (
    <div className={!requestOffer ? styles.card : ''}>
      <div className={styles.cardWrapper}>
        <div className={styles.photoRatingWrapper}>
          <div className={styles.imageWrapper}>
            <img src="assets/user-photo.png" />
          </div>
        </div>
        <div className={styles.heightWrapper}>
          <div className={styles.offerWrapper}>
            <div className={styles.top}>
              <div className={styles.userWrapper}>
                <div className={styles.userName}>{offer.user.first_name} {offer.user.last_name}</div>
                <div className={styles.region}>{offer.region.district}, {offer.region.oblast}</div>
              </div>
              {editHandle && deleteHandle &&<div className={styles.actions}>
                  <div className={`${styles.action} ${styles.actionSuccess}`} onClick={editHandle}>
                      <EditIcon/>
                  </div>
                  <div className={`${styles.action} ${styles.actionDanger}`} onClick={deleteHandle}>
                      <CrossIcon/>
                  </div>
              </div>}
              {
                requestHandle && <div className={styles.requestAction} onClick={requestHandle}>
                    <PlusIcon />
                </div>
              }
            </div>

            <div className={styles.typeWrapper}>
              <ArrowIcon/>
              {offer.commodity_type?.name || offer.vehicle_type?.name}
            </div>

            {offer.additional_info && <div className={`${styles.additionalWrapper} ${descActive && styles.additionalWrapperActive}`}
                  onClick={() => setDescActive(prev => !prev)}>
              <ArrowDownIcon/>
              <span>більше...</span>
            </div>}


          </div>
        </div>
      </div>
      {
        descActive && <div className={styles.additionalInfo}>
          {offer.additional_info}
          </div>
      }
      {!!requestOffer
        ? <div className={styles.priceWrapper}>
          <span className={styles.currency}>грн</span>
          <span className={styles.price}>{offer.price * requestOffer.overwrite_amount}</span>
        </div>
        : <div className={styles.priceWrapper}>
          <span className={styles.currency}>грн</span>
          <span className={styles.price}>{offer.price}/</span>
          <span className={styles.tonnage}>
            {
              offer.commodity_type
                ? `1т`
                : `1д`
            }
          </span>
        </div>}
    </div>
  )
}