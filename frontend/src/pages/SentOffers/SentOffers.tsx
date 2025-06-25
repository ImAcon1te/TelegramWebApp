import {RolesMap} from "../../types/common.ts";
import {useAppStore} from "../../store/store.ts";
import {Tabs, TabsVariant} from "../../components/Tabs/Tabs.tsx";
import {useOffersSent} from "../../service/useOffersSent.ts";
import {Modal} from "../../components/Modal/Modal.tsx";
import {Button, ButtonVariant} from "../../components/Button/Button.tsx";
import {useState} from "react";
import {RequestOffer} from "../../types/responses.ts";
import {postRequestOfferSentDelete} from "../../service/service.ts";
import {getOfferType} from "../../helpers/helpers.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {RequestCard} from "../../components/Card/RequestCard.tsx";
import {RequestModal} from "../../components/RequestModal/RequestModal.tsx";

export const SentOffers = () => {
  const {activeRole} = useAppStore();
  const queryClient = useQueryClient();
  const {data: sentList, isLoading} = useOffersSent(activeRole)
  const [deleteOffer, setDeleteOffer] = useState<RequestOffer | null>(null)
  const [editOffer, setEditOffer] = useState<RequestOffer | null>(null)

  if(isLoading){
    return null
  }else if(!sentList || sentList.length < 1){
    return (
      <div>
        <Tabs variant={TabsVariant.NOTIFICATIONS} />
        <div className="no-text">У вас немає відправлених заявок на {activeRole === RolesMap.CULTURE ? 'культуру' : 'техніку'}</div>
      </div>
    )
  }

  const applyDelete = async () => {
    if(!deleteOffer) return;
    const resp = await postRequestOfferSentDelete({
      id: deleteOffer?.id,
      offer_type: getOfferType(deleteOffer)
    })

    if(resp.message === "offer deleted"){
      await queryClient.invalidateQueries({
        queryKey: ['offersSent', getOfferType(deleteOffer)],
      });
    }
    setDeleteOffer(null)
  }
  return (
    <div>
      <Tabs variant={TabsVariant.NOTIFICATIONS} />
      {sentList.map(sentOffer => {
        return (
          <RequestCard
            offer={sentOffer}
            key={sentOffer.id}
            editHandle={() => setEditOffer(sentOffer)}
            deleteHandle={() => setDeleteOffer(sentOffer)}
            isSent
          />
        )
      })}
      {editOffer && <RequestModal isOpen={!!editOffer} requestOffer={editOffer} closeModal={() => setEditOffer(null)}/>}
      <Modal isOpen={!!deleteOffer} title="Видалення заявки" closeModal={() => setDeleteOffer(null)}>
        <div className="modal-text">Ви впевнені що хочете видалити заявку?</div>
        <div className="modal-actions">
          <Button onClick={applyDelete} variant={ButtonVariant.PRIMARY}>
            Видалити
          </Button>
          <Button onClick={() => setDeleteOffer(null)} variant={ButtonVariant.RESET}>
            Скасувати
          </Button>
        </div>
      </Modal>
    </div>
  )
}