// Тип региона
import {FormEvent, useState} from "react";
import {UserFormData} from "../../types/common.ts";
import {postRegistration} from "../../service/service.ts";
import styles from "./Registration.module.css"
import {Select} from "../../components/Select/Select.tsx";
import {Input} from "../../components/Input/Input.tsx";
import {RegionsMock} from "../../mocks/Regions.ts";
import {Button} from "../../components/Button/Button.tsx";


// Props для формы регистрации
interface RegistrationFormProps {
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
}) => {
  const regions = RegionsMock;
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    region: regions.length > 0 ? regions[0].id : '',
    isSale: false,
    isPurchase: false,
    isRental: false
  });
  const onChange = (
    name: string,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const resp = await postRegistration(formData)

    if (resp.redirected) {
      // Flask отдаст redirect → перенаправим браузер
      console.log('success', resp)
      window.location.href = resp.url;
    } else if (!resp.ok) {
      // сервер вернул ошибку 400+ с текстом
      const text = await resp.text();
      alert(text);
    }
  };
  console.log('form data', formData)
  return (
    <div className={styles.registration}>
      <h1 className={styles.title}>Реєстрація</h1>
      <form onSubmit={handleSubmit} className="form-wrapper">
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
          value={formData.phone}
          placeholder="Введіть..."
          required
          onChange={(value) => onChange('region', value)}
          options={regions.map(item=>({
            label: `${item.oblast} - ${item.district}`,
            value: item.id
          }))}
        />
        <div className={styles.buttonContainer}>
          <Button >Завершити реєстрацію</Button>
        </div>
      </form>
    </div>

  );
};

export default RegistrationForm;