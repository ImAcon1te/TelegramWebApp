import {RolesMap} from "../../types/common.ts";
import {useOffersReceived} from "../../service/useOffersReceived.ts";
import {useAppStore} from "../../store/store.ts";
import {Tabs, TabsVariant} from "../../components/Tabs/Tabs.tsx";
import {RequestCard} from "../../components/Card/RequestCard.tsx";
import {Modal} from "../../components/Modal/Modal.tsx";
import {Button, ButtonVariant} from "../../components/Button/Button.tsx";
import {useState} from "react";
import {RequestOffer} from "../../types/responses.ts";
import {postRequestOfferReceivedDelete} from "../../service/service.ts";
import {getOfferType} from "../../helpers/helpers.tsx";
import {useQueryClient} from "@tanstack/react-query";

export const ReceivedOffers = () => {
  const queryClient = useQueryClient();
  const {activeRole} = useAppStore();
  const [deleteOffer, setDeleteOffer] = useState<RequestOffer | null>(null)

  const {data: receivedList, isLoading} = useOffersReceived(activeRole)

  if(isLoading){
    return null
  }else if(!receivedList || receivedList.length < 1){
    return (
      <div>
        <Tabs variant={TabsVariant.NOTIFICATIONS} />
        <div className="no-text">У вас немає отриманих заявок на {activeRole === RolesMap.CULTURE ? 'культуру' : 'техніку'}</div>
      </div>
    )
  }

  const applyDelete = async () => {
    if(!deleteOffer) return;
    const resp = await postRequestOfferReceivedDelete({
      request_offer_id: deleteOffer?.id,
    })
    if(resp.message === "offer declined"){
      await queryClient.invalidateQueries({
        queryKey: ['offersReceived', getOfferType(deleteOffer)],
      });
    }
    setDeleteOffer(null)
  }

  return (
    <div>
      <Tabs variant={TabsVariant.NOTIFICATIONS} />
      {receivedList.map(receivedOffer => {
        return (
          <RequestCard
            offer={receivedOffer}
            key={receivedOffer.id}
            // editHandle={() => setEditOffer(sentOffer)}
            deleteHandle={() => setDeleteOffer(receivedOffer)}
            isSent
          />
        )
      })}
      <Modal isOpen={!!deleteOffer} title="Відхилення зявки" closeModal={() => setDeleteOffer(null)}>
        <div className="modal-text">Ви впевнені що хочете відхилити заявку?</div>
        <div className="modal-actions">
          <Button onClick={applyDelete} variant={ButtonVariant.PRIMARY}>
            Відхилити
          </Button>
          <Button onClick={() => setDeleteOffer(null)} variant={ButtonVariant.RESET}>
            Скасувати
          </Button>
        </div>
      </Modal>
    </div>
  )
}