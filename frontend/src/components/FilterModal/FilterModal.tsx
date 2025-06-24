import {FC, useEffect, useState} from "react";
import {Offer} from "../../types/responses.ts";
import {Modal} from "../Modal/Modal.tsx";
import {Button, ButtonVariant} from "../Button/Button.tsx";
import {FilterOfferData, RequestOfferData, RequestOfferDataBase} from "../../types/forms.ts";
import {RolesMap} from "../../types/common.ts";
import {getOfferType} from "../../helpers/helpers.tsx";
import {Input} from "../Input/Input.tsx";
import {TextArea} from "../TextArea/TextArea.tsx";
import styles from './RequestModal.module.css'
import {postRequestOffer} from "../../service/service.ts";
import {useAppStore} from "../../store/store.ts";
import {Select} from "../Select/Select.tsx";
import {useRegions} from "../../service/useRegions.ts";
import {useOfferTypes} from "../../service/useOfferTypes.ts";

interface Props{
  isOpen: boolean
  closeModal: () => void
}
export const FilterModal:FC<Props> = ({isOpen, closeModal}) => {
  const {activeRole} = useAppStore()
  const {data: regions} = useRegions();
  const {data: offerTypes} = useOfferTypes();

  const [formData, setFormData] = useState<FilterOfferData>({
    offer_type: activeRole,
    price_end: 0,
    price_start: 0,
    name: '',
    type_id: undefined,
    region: undefined
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
    const resp = await postRequestOffer(formData)
    console.log('resp', resp)
    closeModal()

  }

  useEffect(() => {
    if(!formData.region && regions?.length){
      onChange('region_id', regions[0].id)
    }
  }, [regions])

  useEffect(() => {
    if(offerTypes){
      if(formData.offer_type===RolesMap.CULTURE){
        onChange('type_id', offerTypes.commodity_types[0].id)
      }else{
        onChange('type_id', offerTypes.vehicle_types[0].id)
      }
    }
  }, [offerTypes, formData.offer_type])
  return (
    <Modal isOpen={!!isOpen} title="Фільтри" closeModal={closeModal}>
      <form onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }} className="form-wrapper">
        <Input
          label="Ім’я та прізвище"
          value={formData.name}
          placeholder="Введіть..."
          required
          onChange={(value) => onChange('name', value)}
        />
        <Select
          label={formData.offer_type===RolesMap.CULTURE ? 'Тип культури' : 'Тип техніки'}
          value={formData.type_id}
          required
          onChange={(value) => onChange('type_id', value)}
          options={( formData.offer_type===RolesMap.CULTURE  ? offerTypes?.commodity_types : offerTypes?.vehicle_types)?.map(item=>({
            label: item.name,
            value: item.id
          })) || []}
        />
        <Select
          label="Регіон"
          value={formData.region}
          // required
          onChange={(value) => onChange('region', value)}
          options={regions?.map(item=>({
            label: `${item.oblast} - ${item.district}`,
            value: item.id
          })) || []}
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