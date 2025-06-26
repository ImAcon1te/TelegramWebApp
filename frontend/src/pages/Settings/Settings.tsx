import {postUpdateUser} from "../../service/service.ts";
import styles from "./Settings.module.css"

import {UserFormData} from "../../types/forms.ts";
import {useNavigate} from "react-router-dom";
import {UserForm} from "../../components/UserForm/UserForm.tsx";
import {useUser} from "../../service/useUser.ts";
import {useMemo} from "react";
import {ArrowBackIcon} from "../../assets/icons/arrow-back-icon.tsx";

const SettingsForm: React.FC = ({
}) => {
  const {data: userData} = useUser()

  const navigate = useNavigate();
  const handleSubmit = async (formData: UserFormData) => {
    await postUpdateUser(formData)
    // const queryClient = useQueryClient();

  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1); // вернуться назад
    } else {
      navigate('/'); // если истории нет — на главную
    }
  };
  const initData = useMemo(() => {
    if(userData){
      return {
        firstName: userData.first_name,
        lastName: userData.last_name,
        phone: userData.phone,
        region_id: userData.region.id,
      }
    }
  }, [userData])
  return (
    <div className={styles.settings}>
      <div className={styles.header}>
        <ArrowBackIcon className={styles.back} onClick={handleBack} />
        <h1 className={styles.title}>Налаштування</h1>
      </div>
      <UserForm onSubmit={handleSubmit} buttonText="Зберегти налаштування" initData={initData} />
    </div>
  );
};

export default SettingsForm;