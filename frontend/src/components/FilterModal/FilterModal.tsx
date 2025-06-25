import {FC, useEffect, useState} from "react";
import {Modal} from "../Modal/Modal.tsx";
import {Button, ButtonVariant} from "../Button/Button.tsx";
import {FilterOfferData} from "../../types/forms.ts";
import {RolesMap} from "../../types/common.ts";
import {Input} from "../Input/Input.tsx";
import {useAppStore} from "../../store/store.ts";
import {Select} from "../Select/Select.tsx";
import {useRegions} from "../../service/useRegions.ts";
import {useOfferTypes} from "../../service/useOfferTypes.ts";
import {usePriceRange} from "../../service/usePriceRange.ts";
import styles from './FilterModal.module.css'
import {Slider} from "../Slider/Slider.tsx";
interface Props{
  isOpen: boolean
  closeModal: () => void
  applyFilters: (data: FilterOfferData | null) => void
  currentFilters?: FilterOfferData | null
}

export const FilterModal:FC<Props> = ({isOpen, closeModal, applyFilters, currentFilters}) => {
  const {activeRole} = useAppStore()

  const {data: regions} = useRegions();
  const {data: offerTypes} = useOfferTypes();
  const {data: priceRange} = usePriceRange({
    offerType: activeRole
  });

  const initialState:FilterOfferData = {
    offer_type: activeRole,
    price_end: 0,
    price_start: 0,
    name: '',
    type_id: undefined,
    region: undefined
  }
  const [formData, setFormData] = useState<FilterOfferData>(initialState);

  const onChange = (
    name: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  const reset = () => {
    const newFormData = {...initialState};
    if(priceRange){
      newFormData.price_end = priceRange.max_price,
      newFormData.price_start = priceRange.min_price
    }
    setFormData(newFormData)
    applyFilters(null)
    closeModal()
  }
  const handleSubmit = () => {
    applyFilters(formData)
    closeModal()
  }

  useEffect(() => {
    if(priceRange){
      onChange('price_end', priceRange.max_price)
      onChange('price_start', priceRange.min_price)
    }
  }, [priceRange])
  useEffect(() => {
    if(currentFilters){
      setFormData(prev => ({
        ...prev,
        ...currentFilters
      }))
    }

  }, [currentFilters])
  return (
    <Modal isOpen={!!isOpen} title="Фільтри" closeModal={closeModal}>
      <form onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }} className="form-wrapper">
        <div>
          <div className="form-label">
            Ціна
          </div>
          <div className={styles.inputGroup}>
            <input
              type="number"
              className="form-input"
              value={formData.price_start}
              placeholder="від"
              required
              min={priceRange?.min_price || 0}
              max={formData.price_end}
              onChange={(e) => onChange('price_start', +e.target.value)}
            />
            <input
              type="number"
              className="form-input"
              value={formData.price_end}
              placeholder="до"
              required
              min={formData.price_start+1}
              max={priceRange?.max_price || 0}
              onChange={(e) => onChange('price_end', +e.target.value)}
            />
          </div>
          {priceRange && <Slider
              maxValue={formData.price_end}
              minValue={formData.price_start}
              min={priceRange?.min_price}
              max={priceRange?.max_price}
              onChange={(sliderValue) => {
                onChange('price_end', sliderValue.max)
                onChange('price_start', sliderValue.min)
              }}
          />}
        </div>


        <Input
          label="Ім’я та прізвище"
          value={formData.name}
          placeholder="Введіть..."
          onChange={(value) => onChange('name', value)}
        />
        <Select
          label={formData.offer_type===RolesMap.CULTURE ? 'Тип культури' : 'Тип техніки'}
          value={formData.type_id}
          onChange={(value) => onChange('type_id', value)}
          options={( formData.offer_type===RolesMap.CULTURE  ? offerTypes?.commodity_types : offerTypes?.vehicle_types)?.map(item=>({
            label: item.name,
            value: item.id
          })) || []}
        />
        <Select
          label="Регіон"
          value={formData.region}
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
          <Button onClick={reset} variant={ButtonVariant.RESET}>
            Скинути
          </Button>
        </div>
      </form>

    </Modal>
  )
}