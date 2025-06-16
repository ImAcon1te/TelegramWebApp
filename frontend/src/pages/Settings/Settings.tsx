import {postRegistration} from "../../service/service.ts";
import styles from "./Settings.module.css"

import {UserFormData} from "../../types/forms.ts";
import {useNavigate} from "react-router-dom";
import {UserForm} from "../../components/UserForm/UserForm.tsx";
import {useUser} from "../../service/useUser.ts";


// Props для формы регистрации
interface RegistrationFormProps {
}

const SettingsForm: React.FC<RegistrationFormProps> = ({
}) => {
  const {data} = useUser()
  console.log('data', data)
  const navigate = useNavigate();
  const handleSubmit = async (formData: UserFormData) => {
    console.log('test');
    const resp = await postRegistration(formData)
    console.log('resp', resp)
    if(resp.message === 'success'){
      navigate('/', { replace: true })
    }
  };
  return (
    <div className={styles.settings}>
      <h1 className={styles.title}>Налаштування</h1>
      <UserForm onSubmit={handleSubmit} buttonText="Зберегти налаштування"/>
    </div>
  );
};

export default SettingsForm;