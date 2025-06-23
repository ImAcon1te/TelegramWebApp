import styles from "./Card.module.css"
import UserPhoto from "../../assets/user-photo.png"
import {Offer} from "../../types/responses.ts";
import {FC} from "react";
import {ArrowIcon} from "../../assets/icons/right-arrow-icon.tsx";
import {EditIcon} from "../../assets/icons/edit-icon.tsx";
import {CrossIcon} from "../../assets/icons/cross-icon.tsx";
interface CardProps {
  offer: Offer
  editHandle?: () => void
  deleteHandle?: () => void
}
export const Card:FC<CardProps> = ({offer, editHandle, deleteHandle}) => {
  return (
    <div className={styles.card}>
      <div className={styles.photoRatingWrapper}>
        <div className={styles.imageWrapper}>
          <img src={UserPhoto} />
        </div>
      </div>
      <div className={styles.heightWrapper}>
        <div className={styles.offerWrapper}>
          <div className={styles.top}>
            <div className={styles.userWrapper}>
              <div className={styles.userName}>{offer.user_first_name} {offer.user_last_name}</div>
              <div className={styles.region}>{offer.region_id}</div>
            </div>
            {editHandle && deleteHandle &&<div className={styles.actions}>
              <div className={`${styles.action} ${styles.actionSuccess}`} onClick={editHandle}>
                <EditIcon/>
              </div>
              <div className={`${styles.action} ${styles.actionDanger}`} onClick={deleteHandle}>
                <CrossIcon/>
              </div>
            </div>}
          </div>

          {offer.additional_info && <div className={styles.additionalWrapper}>
              <ArrowIcon/>
            {offer.additional_info}
          </div>}
          <div className={styles.priceWrapper}>
            <span className={styles.currency}>грн</span>
            <span className={styles.price}>{offer.price}/</span>
            <span className={styles.tonnage}>
              {
                offer.commodity_type_id
                  ? `${offer.tonnage}т`
                  : 'test'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}