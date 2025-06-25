import {postCreateOffer} from "../../service/service.ts";

import {useQueryClient} from "@tanstack/react-query";
import {OfferData} from "../../types/forms.ts";
import {OfferForm} from "../../components/OfferForm/OfferForm.tsx";
import {useNavigate} from "react-router-dom";

export const CreateOffer = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handleSubmit = async (formData: OfferData) => {
    const resp = await postCreateOffer(formData)
    if(resp.message === 'success'){
      await queryClient.invalidateQueries({
        queryKey: ['myOffers', formData.offer_type],
      });
      navigate('/my-offers')

    }
  };

  return (
    <OfferForm
      title="На цій сторінці ви можете створити власне оголошення, яке буде зображено усім користувачам системи"
      handleSubmit={handleSubmit}
      buttonText="Створити оголошення"
    />

  )
}