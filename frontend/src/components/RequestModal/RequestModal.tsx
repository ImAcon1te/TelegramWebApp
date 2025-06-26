import {FC, useEffect, useState} from "react";
import {Offer, RequestOffer} from "../../types/responses.ts";
import {Modal} from "../Modal/Modal.tsx";
import {Button, ButtonVariant} from "../Button/Button.tsx";
import {RequestOfferData, RequestOfferDataBase} from "../../types/forms.ts";
import {RolesMap} from "../../types/common.ts";
import {getOfferType} from "../../helpers/helpers.tsx";
import {Input} from "../Input/Input.tsx";
import {TextArea} from "../TextArea/TextArea.tsx";
import styles from './RequestModal.module.css'
import {postRequestOffer, postRequestOfferUpdate} from "../../service/service.ts";
import {useQueryClient} from "@tanstack/react-query";

interface Props{
  isOpen: boolean
  offer?: Offer
  closeModal: () => void
  requestOffer?: RequestOffer
}
export const RequestModal:FC<Props> = ({requestOffer, closeModal, offer, isOpen}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<RequestOfferData>({
    offer_type: RolesMap.CULTURE,
    overwrite_amount: 1,
    comment: '',
  });

  const onChange = (
    name: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    if(offer){
      const data:RequestOfferDataBase = {
        offer_id: offer.id,
        comment: formData.comment,
        offer_type: formData.offer_type,
        overwrite_amount: formData.overwrite_amount
      }
      const resp = await postRequestOffer(data)
      if(resp){
        await queryClient.invalidateQueries({
          queryKey: ['offersSent', getOfferType(offer)],
        });
      }
    }
    if(requestOffer){
      const data:RequestOfferDataBase = {
        id: requestOffer.id,
        comment: formData.comment,
        offer_type: formData.offer_type,
        overwrite_amount: formData.overwrite_amount
      }
      const resp = await postRequestOfferUpdate(data)
      if(resp){
        await queryClient.invalidateQueries({
          queryKey: ['offersSent', getOfferType(offer)],
        });
      }
    }

    closeModal()
  }

  useEffect(() => {
    if(requestOffer){
      setFormData(prev => ({
        ...prev,
        offer_type: getOfferType(requestOffer),
        overwrite_amount: requestOffer.overwrite_amount,
        comment: requestOffer.comment,
      }))
    }
  }, [requestOffer])
  useEffect(() => {
    if(offer){
      setFormData(prev => ({
        ...prev,
        offer_type: getOfferType(requestOffer),
        overwrite_amount: getOfferType(requestOffer) === RolesMap.CULTURE ? offer.tonnage : offer.days,
      }))
    }
  }, [offer])
  return (
    <Modal isOpen={isOpen} title="Заявка на оренду" closeModal={closeModal}>
      <div className="modal-text">Тут ви можете запропонувати свої умови для угоди</div>
      <div className={styles.form}></div>
      <form onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }} className="form-wrapper">
        {formData.offer_type === RolesMap.CULTURE && <Input
            label="Тоннаж"
            step={1}
            value={formData.overwrite_amount}
            type="number"
            min={1}
            max={requestOffer?.overwrite_amount || offer?.tonnage}
            onChange={(value) => onChange('overwrite_amount', +value)}
        />}
        {formData.offer_type === RolesMap.VEHICLE && <Input
            label="Термін оренди(кількість днів)"
            step={1}
            value={formData.overwrite_amount}
            type="number"
            min={1}
            max={requestOffer?.overwrite_amount || offer?.days}
            onChange={(value) => onChange('overwrite_amount', +value)}
        />}
        <TextArea
          placeholder="Введіть..."
          label="Додаткова інформація"
          value={formData.comment}
          onChange={(value) => onChange('comment', value)}
        />
        <div className="modal-actions">
          <Button isSubmit variant={ButtonVariant.PRIMARY}>
            Відправити
          </Button>
        </div>
      </form>

    </Modal>
  )
}