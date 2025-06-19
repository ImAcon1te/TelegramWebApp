import {Input} from "../Input/Input.tsx";
import {Select} from "../Select/Select.tsx";
import {Button} from "../Button/Button.tsx";
import {useEffect, useState} from "react";
import {UserFormData} from "../../types/forms.ts";
import {useRegions} from "../../service/useRegions.ts";
interface UserFormProps {
  onSubmit: (formData: UserFormData) => void,
  buttonText: string,
  initData?: Partial<UserFormData>
}
export const UserForm:React.FC<UserFormProps> = ({
  onSubmit,
  buttonText,
  initData
}) => {
  const {data: regions} = useRegions();
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    region_id: regions?.length ? regions[0].id : undefined,
  });

  useEffect(() => {
    if(initData){
      setFormData(prev=>({
        ...prev,
        ...initData
      }))
    }

  },[initData])

  useEffect(() => {
    if(!formData.region_id && regions?.length){
      onChange('region_id', regions[0].id)
    }
  }, [regions])
  const onChange = (
    name: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  console.log('form data', formData)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData)
      }}
      className="form-wrapper"
    >
      <Input
        label="Ім’я"
        value={formData.firstName}
        placeholder="Введіть..."
        required
        onChange={(value) => onChange('firstName', value)}
      />

      <Input
        label="Прізвище"
        value={formData.lastName}
        placeholder="Введіть..."
        onChange={(value) => onChange('lastName', value)}
      />

      <Input
        label="Номер телефону"
        value={formData.phone}
        pattern="^(?:\+?380|0)\d{9}$"
        type="text"
        placeholder="Введіть..."
        required
        onChange={(value) => onChange('phone', value)}
      />
      <Select
        label="Область"
        value={formData.region_id}
        placeholder="Введіть..."
        required
        onChange={(value) => onChange('region_id', value)}
        options={regions?.map(item=>({
          label: `${item.oblast} - ${item.district}`,
          value: item.id
        })) || []}
      />
      <div className="center-form-button">
        <Button isSubmit>{buttonText}</Button>
      </div>
    </form>
  )
}