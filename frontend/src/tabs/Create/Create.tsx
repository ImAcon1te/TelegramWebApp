import {FormEvent, useEffect, useState} from "react";
import {postCreate} from "../../service/service.ts";
import {CreateOfferData} from "../../types/forms.ts";
import {RolesMap} from "../../types/common.ts";
import {Select} from "../../components/Select/Select.tsx";
import {OfferOptions} from "../../constants.ts";
import {Input} from "../../components/Input/Input.tsx";
import {TextArea} from "../../components/TextArea/TextArea.tsx";
import {useRegions} from "../../service/useRegions.ts";
import {useOfferTypes} from "../../service/useOfferTypes.ts";
import {Button} from "../../components/Button/Button.tsx";

export const Create = () => {
  const {data: regions} = useRegions();
  const {data: offerTypes} = useOfferTypes();

  const [formData, setFormData] = useState<CreateOfferData>({
    offer_type: RolesMap.CULTURE,
    price: 100,
    additional_info: '',
    region_id: undefined,
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
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const resp = await postCreate(formData)
    console.log('resp', resp)
  };

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
  console.log('form', formData)

  return <form onSubmit={handleSubmit} className="form-wrapper">
    <div className="form-title">
      На цій сторінці ви можете створити власне оголошення, яке буде зображено усім користувачам системи
    </div>
    <Select
      label="Тип пропозиції"
      value={formData.offer_type}
      required
      onChange={(value) => onChange('offer_type', value)}
      options={OfferOptions}
      maxWidth="235px"
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
      maxWidth="235px"
    />
    <Input
      label="Загальна ціна"
      required
      step={0.01}
      value={formData.price}
      type="number"
      min={0}
      onChange={(value) => onChange('price', +value)}
      maxWidth="235px"
    />
    {formData.offer_type === RolesMap.CULTURE && <Input
      label="Кількість тонн"
      required
      step={0.01}
      value={formData.tonnage}
      type="number"
      min={0.01}
      onChange={(value) => onChange('tonnage', +value)}
      maxWidth="235px"
    />}
    {formData.offer_type === RolesMap.VEHICLE && <Input
      label="Кількість днів (термін оренди)"
      required
      step={1}
      value={formData.days}
      type="number"
      min={1}
      onChange={(value) => onChange('days', +value)}
      maxWidth="235px"
    />}
    <Select
      label="Область"
      value={formData.region_id}
      required
      onChange={(value) => onChange('region_id', value)}
      options={regions?.map(item=>({
        label: `${item.oblast} - ${item.district}`,
        value: item.id
      })) || []}
      maxWidth="235px"
    />
    <TextArea
      placeholder="Введіть..."
      label="Додаткова інформація"
      value={formData.additional_info}
      onChange={(value) => onChange('additional_info', value)}
      maxWidth="235px"
    />
    <div className="center-form-button">
      <Button isSubmit>Створити оголошення</Button>
    </div>
  </form>
}