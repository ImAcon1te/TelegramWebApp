import {Input} from "../Input/Input.tsx";
import {Select} from "../Select/Select.tsx";
import {Button} from "../Button/Button.tsx";
import {useState} from "react";
import {UserFormData} from "../../types/forms.ts";
import {RegionsMock} from "../../mocks/Regions.ts";
interface UserFormProps {
  onSubmit: (formData: UserFormData) => void,
  buttonText: string
}
export const UserForm:React.FC<UserFormProps> = ({
  onSubmit,
  buttonText
}) => {
  const regions = RegionsMock;
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    region_id: regions.length > 0 ? regions[0].id : undefined,
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
        options={regions.map(item=>({
          label: `${item.oblast} - ${item.district}`,
          value: item.id
        }))}
      />
      <div className="center-form-button">
        <Button isSubmit>{buttonText}</Button>
      </div>
    </form>
  )
}