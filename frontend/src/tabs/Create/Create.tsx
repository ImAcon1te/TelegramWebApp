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

export const Create = () => {
  const {data: regions} = useRegions();
  const {data: offerTypes} = useOfferTypes();
  console.log('offerTypes', offerTypes)

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

    if (resp) {
      console.log('success', resp)
      window.location.href = resp.url;
    }
  };

  useEffect(() => {
    if(!formData.region_id && regions?.length){
      onChange('region_id', regions[0].id)
    }
  }, [regions])

  console.log('form', formData)
  return <form onSubmit={handleSubmit} className="form-wrapper">
    <div className="form-title">
      На цій сторінці ви можете створити власне оголошення, яке буде зображено усім користувачам системи
    </div>
    <Select
      label="Тип предложения"
      value={formData.offer_type}
      required
      onChange={(value) => onChange('offer_type', value)}
      options={OfferOptions}
      maxWidth="235px"
    />
    <Select
      label={formData.offer_type===RolesMap.CULTURE ? 'Тип культуры' : 'Тип техники'}
      value={formData.type_id}
      required
      onChange={(value) => onChange('type_id', value)}
      options={regions?.map(item=>({
        label: `${item.oblast} - ${item.district}`,
        value: item.id
      })) || []}
      maxWidth="235px"
    />
    <Input
      label="Общая цена"
      required
      step={0.01}
      value={formData.price}
      type="number"
      min={0}
      onChange={(value) => onChange('price', +value)}
      maxWidth="235px"
    />
    {formData.offer_type === RolesMap.CULTURE && <Input
      label="Количество тонн"
      required
      step={0.001}
      value={formData.tonnage}
      type="number"
      min={0.001}
      onChange={(value) => onChange('tonnage', +value)}
      maxWidth="235px"
    />}
    {formData.offer_type === RolesMap.VEHICLE && <Input
      label="Количество дней (срок аренды)"
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
      label="Дополнительная информация"
      required
      value={formData.additional_info}
      onChange={(value) => onChange('additional_info', value)}
      maxWidth="235px"
    />
  </form>
}