import {FC, useState} from "react";
import {Offer} from "../../types/responses.ts";
import {Modal} from "../Modal/Modal.tsx";
import {Button, ButtonVariant} from "../Button/Button.tsx";
import {RequestOfferData, RequestOfferDataBase} from "../../types/forms.ts";
import {RolesMap} from "../../types/common.ts";
import {getOfferType} from "../../helpers/helpers.tsx";
import {Input} from "../Input/Input.tsx";
import {TextArea} from "../TextArea/TextArea.tsx";
import styles from './RequestModal.module.css'
import {postRequestOffer} from "../../service/service.ts";

interface Props{
  requestOffer: Offer
  closeModal: () => void
}
export const RequestModal:FC<Props> = ({requestOffer, closeModal}) => {
  const [formData, setFormData] = useState<RequestOfferData>({
    offer_id: requestOffer.id,
    offer_type: getOfferType(requestOffer),
    overwrite_sum: requestOffer.price,
    overwrite_amount: getOfferType(requestOffer) === RolesMap.CULTURE ? requestOffer.tonnage : 0,
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
    const data:RequestOfferDataBase = {
      offer_id: formData.offer_id,
      comment: formData.comment,
      offer_type: formData.offer_type,
    }
    if(formData.overwrite_sum !== requestOffer.price){
      data.overwrite_sum = formData.overwrite_sum
    }
    if(formData.offer_type === RolesMap.CULTURE && formData.overwrite_amount !== requestOffer.tonnage){
      data.overwrite_amount = formData.overwrite_amount
    }
    await postRequestOffer(data)
    closeModal()
  }


  return (
    <Modal isOpen={!!requestOffer} title="Заявка на оренду" closeModal={closeModal}>
      <div className="modal-text">Тут ви можете запропонувати свої умови для угоди</div>
      <div className={styles.form}></div>
      <form onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }} className="form-wrapper">
        <Input
          label="Загальна ціна"
          required
          step={0.01}
          value={formData.overwrite_sum}
          type="number"
          min={0}
          onChange={(value) => onChange('overwrite_sum', +value)}
        />
        {formData.offer_type === RolesMap.CULTURE && <Input
            label="Кількість тонн"
            required
            step={0.01}
            value={formData.overwrite_amount}
            type="number"
            min={0.01}
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