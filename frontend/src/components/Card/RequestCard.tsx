import {RequestOffer} from "../../types/responses.ts";
import {FC} from "react";
import styles from './Card.module.css'
import {Card} from "./Card.tsx";
import {RolesMap} from "../../types/common.ts";
import {getOfferType} from "../../helpers/helpers.tsx";
import {EditIcon} from "../../assets/icons/edit-icon.tsx";
import {CrossIcon} from "../../assets/icons/cross-icon.tsx";

interface RequestCardProps {
  offer: RequestOffer
  editHandle?: () => void
  deleteHandle?: () => void
  isSent?: boolean
}
export const RequestCard:FC<RequestCardProps> = ({
  offer,
  editHandle,
  deleteHandle,
  isSent
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.requestWrapper}>
        <div className="cols-gap-10">
          <div className={styles.requestHeader}>
            <div className={styles.requestTitle}>{isSent ? 'Відповідь від клієнта' : 'Ваша заявка'}</div>
            {(editHandle || deleteHandle) &&<div className={styles.actions}>
                {editHandle && <div className={`${styles.action} ${styles.actionSuccess}`} onClick={editHandle}>
                  <EditIcon/>
                </div>}
                {deleteHandle && <div className={`${styles.action} ${styles.actionDanger}`} onClick={deleteHandle}>
                  <CrossIcon/>
                </div>}
            </div>}
          </div>
          {offer.overwrite_amount && <div>
              <div className={styles.requestInput}>{offer.overwrite_amount} {getOfferType(offer) === RolesMap.CULTURE ? 'т.' : 'д.'}</div>
              <div className="bottom-text">Кількість {getOfferType(offer) === RolesMap.CULTURE ? 'тонн' : 'днів'},
                  запропонованих клієнтом
              </div>
          </div>}
          {offer.comment && <div className={`${styles.requestInput} ${styles.requestInputActive}`}>
            {offer.comment}
          </div>}
        </div>
      </div>

      <Card
        offer={offer.offer}
        key={offer.id}
        requestOffer={offer}
      />
    </div>
  )
}