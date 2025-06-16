import {postUpdateUser} from "../../service/service.ts";
import styles from "./Settings.module.css"

import {UserFormData} from "../../types/forms.ts";
import {useNavigate} from "react-router-dom";
import {UserForm} from "../../components/UserForm/UserForm.tsx";
import {useUser} from "../../service/useUser.ts";
import {useMemo} from "react";


// Props для формы регистрации
interface RegistrationFormProps {
}

const SettingsForm: React.FC<RegistrationFormProps> = ({
}) => {
  const {data: userData} = useUser()

  const navigate = useNavigate();
  const handleSubmit = async (formData: UserFormData) => {
    const resp = await postUpdateUser(formData)
    if(resp.message === 'success'){
      navigate('/', { replace: true })
    }
  };
  const initData = useMemo(() => {
    if(userData){
      return {
        firstName: userData.first_name,
        lastName: userData.last_name,
        phone: userData.phone,
        region_id: userData.region_id,
      }
    }
  }, [userData])
  return (
    <div className={styles.settings}>
      <h1 className={styles.title}>Налаштування</h1>
      <UserForm onSubmit={handleSubmit} buttonText="Зберегти налаштування" initData={initData} />
    </div>
  );
};

export default SettingsForm;