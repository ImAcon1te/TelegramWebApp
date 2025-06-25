import {RolesMap} from "../../types/common.ts";
import {useAppStore} from "../../store/store.ts";
import {Tabs, TabsVariant} from "../../components/Tabs/Tabs.tsx";
import {useOffersSent} from "../../service/useOffersSent.ts";
import {Modal} from "../../components/Modal/Modal.tsx";
import {Button, ButtonVariant} from "../../components/Button/Button.tsx";
import {useState} from "react";
import {Offer} from "../../types/responses.ts";
import {postRequestOfferDelete} from "../../service/service.ts";
import {getOfferType} from "../../helpers/helpers.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {Card} from "../../components/Card/Card.tsx";
import {RequestModal} from "../../components/RequestModal/RequestModal.tsx";

export const SentOffers = () => {
  const {activeRole} = useAppStore();
  const queryClient = useQueryClient();
  const {data: sentList, isLoading} = useOffersSent(activeRole)
  const [deleteOffer, setDeleteOffer] = useState<Offer | null>(null)
  const [editOffer, setEditOffer] = useState<Offer | null>(null)

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
    const resp = await postRequestOfferDelete({
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
      {sentList.map(offer => {
        return (
          <Card
            offer={offer}
            key={offer.id}
            editHandle={() => setEditOffer(offer)}
            deleteHandle={() => setDeleteOffer(offer)}
          />
        )
      })}
      {editOffer && <RequestModal initData={editOffer} closeModal={() => setEditOffer(null)}/>}
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