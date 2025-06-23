import {Card} from "../../components/Card/Card.tsx";
import {useAppStore} from "../../store/store.ts";
import {useMyOffers} from "../../service/useMyOffers.ts";
import {useNavigate} from "react-router-dom";
import {Offer} from "../../types/responses.ts";
import {Modal} from "../../components/Modal/Modal.tsx";
import {useState} from "react";
import {Button, ButtonVariant} from "../../components/Button/Button.tsx";
import {postDeleteOffer} from "../../service/service.ts";
import {getOfferType} from "../../helpers/helpers.tsx";
import {useQueryClient} from "@tanstack/react-query";
import {RolesMap} from "../../types/common.ts";

export const MyOffers = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {activeRole} = useAppStore();
  const {data: myOffersList, isLoading} = useMyOffers(activeRole);
  const [deleteOffer, setDeleteOffer] = useState<Offer | null>(null)
  console.log('offersList', myOffersList)
  if(isLoading){
    return null
  }else if(!myOffersList || myOffersList.length < 1){
    if(activeRole === RolesMap.CULTURE){
      return <div className="no-text">У вас немає заявок на культуру</div>
    }else{
      return <div className="no-text">У вас немає заявок на техніку</div>
    }
  }
  const editHandle = (offer: Offer) => {
    navigate(`/offers/edit?id=${offer.id}&type=${getOfferType(offer)}`)
  }
  const applyDelete = async () => {
    if(!deleteOffer) return;
    const resp = await postDeleteOffer({
      id: deleteOffer?.id,
      offer_type: getOfferType(deleteOffer)
    })

    if(resp.message === "offer deleted"){
      await queryClient.invalidateQueries({
        queryKey: ['myOffers', getOfferType(deleteOffer)],
      });
    }

    setDeleteOffer(null)

  }
  return (
    <div>
      {myOffersList.map(offer => {
        return (
          <Card
            offer={offer}
            key={offer.id}
            editHandle={() => editHandle(offer)}
            deleteHandle={() => setDeleteOffer(offer)}
          />
        )
      })}
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