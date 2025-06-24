import {Select} from "../Select/Select.tsx";
import {OfferOptions} from "../../constants.ts";
import {RolesMap} from "../../types/common.ts";
import {Input} from "../Input/Input.tsx";
import {TextArea} from "../TextArea/TextArea.tsx";
import {Button} from "../Button/Button.tsx";
import {useRegions} from "../../service/useRegions.ts";
import {useOfferTypes} from "../../service/useOfferTypes.ts";
import {FC, useEffect, useState} from "react";
import {OfferData} from "../../types/forms.ts";
import {Offer} from "../../types/responses.ts";
import {useAppStore} from "../../store/store.ts";
import {getOfferType} from "../../helpers/helpers.tsx";

interface OfferFormProps {
  handleSubmit: (formData: OfferData) => void
  title: string
  buttonText: string
  initData?: Partial<Offer>
}
export const OfferForm:FC<OfferFormProps> = ({handleSubmit, title, initData, buttonText}) => {
  const {activeRole} = useAppStore()
  const {data: regions} = useRegions();
  const {data: offerTypes} = useOfferTypes();
  const [formData, setFormData] = useState<OfferData>({
    offer_type: RolesMap.CULTURE,
    price: 100,
    additional_info: '',
    region_id: 1,
    tonnage: 1,
    days: 1,
    type_id: undefined
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
  useEffect(() => {
    console.log('initData', initData)
    if(initData){
      setFormData(prev=>({
        ...prev,
        offer_type: getOfferType(initData),
        price: initData.price || 1,
        additional_info: initData.additional_info || '',
        region_id: initData.region?.id || 1,
        tonnage: initData.tonnage || 1,
        days: initData.days || 1,
        id: initData.id,
        type_id: initData.commodity_type?.id
      }))
    }else if(activeRole){
      setFormData(prev => ({
        ...prev,
        offer_type: activeRole
      }))
    }
  },[initData, activeRole])

  useEffect(() => {
    if(!formData.region_id && regions?.length){
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
      <form onSubmit={(e) => {
        e.preventDefault()
        handleSubmit(formData)
      }} className="form-wrapper">
        <div className="form-title">
          {title}
        </div>
        <Select
          label="Тип пропозиції"
          value={formData.offer_type}
          required
          onChange={(value) => onChange('offer_type', value)}
          options={OfferOptions}
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
        <Input
          label="Загальна ціна"
          required
          step={0.01}
          value={formData.price}
          type="number"
          min={0}
          onChange={(value) => onChange('price', +value)}
        />
        {formData.offer_type === RolesMap.CULTURE && <Input
            label="Кількість тонн"
            required
            step={0.01}
            value={formData.tonnage}
            type="number"
            min={0.01}
            onChange={(value) => onChange('tonnage', +value)}
        />}
        {formData.offer_type === RolesMap.VEHICLE && <Input
            label="Кількість днів (термін оренди)"
            required
            step={1}
            value={formData.days}
            type="number"
            min={1}
            onChange={(value) => onChange('days', +value)}
        />}
        <Select
          label="Область"
          value={formData.region_id}
          // required
          onChange={(value) => onChange('region_id', value)}
          options={regions?.map(item=>({
            label: `${item.oblast} - ${item.district}`,
            value: item.id
          })) || []}
        />
        <TextArea
          placeholder="Введіть..."
          label="Додаткова інформація"
          value={formData.additional_info}
          onChange={(value) => onChange('additional_info', value)}
        />
        <div className="center-form-button">
          <Button isSubmit>{buttonText}</Button>
        </div>
      </form>

  )
}