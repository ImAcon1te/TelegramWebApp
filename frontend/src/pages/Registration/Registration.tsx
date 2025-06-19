import {postRegistration} from "../../service/service.ts";
import styles from "./Registration.module.css"

import {UserFormData} from "../../types/forms.ts";
import {useNavigate} from "react-router-dom";
import {UserForm} from "../../components/UserForm/UserForm.tsx";
import {useUser} from "../../service/useUser.ts";


// Props для формы регистрации
interface RegistrationFormProps {
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
}) => {
  const navigate = useNavigate();
  const {isLoading, data} = useUser()


  const handleSubmit = async (formData: UserFormData) => {
    const resp = await postRegistration(formData)
    if(resp.message === 'success'){
      navigate('/', { replace: true })
    }
  };

  if(isLoading){
    return null
  }else if(data){
    navigate('/', { replace: true })
  }

  return (
    <div className={styles.registration}>
      <h1 className={styles.title}>Реєстрація</h1>
      <UserForm onSubmit={handleSubmit} buttonText="Зареєструватися" />
    </div>
  );
};

export default RegistrationForm;