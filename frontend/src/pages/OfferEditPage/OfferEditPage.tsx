import {useNavigate, useSearchParams} from "react-router-dom";
import {OfferForm} from "../../components/OfferForm/OfferForm.tsx";
import {OfferData} from "../../types/forms.ts";
import {postUpdateOffer} from "../../service/service.ts";
import {useMyOffers} from "../../service/useMyOffers.ts";
import {useQueryClient} from "@tanstack/react-query";
import {RolesMap} from "../../types/common.ts";

export const OfferEditPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const type = searchParams.get('type') ===
    RolesMap.CULTURE
      ? RolesMap.CULTURE
      : (searchParams.get('type') ===
          RolesMap.VEHICLE ? RolesMap.VEHICLE : null);

  if(!id || !type){
    navigate('/')
    return
  }
  const {data: myOffersList, isLoading} = useMyOffers(type);
  const initData = myOffersList?.find(item => item.id === +id)

  if(isLoading || !myOffersList){
    return null
  }else if(!initData){
    navigate('/')
    return
  }
  const queryClient = useQueryClient();

  const handleSubmit = async (formData: OfferData) => {
    console.log('test', 'myOffers', formData.offer_type)
    const resp = await postUpdateOffer(formData)
    if(resp.message === "Offer updated successfully"){
      await queryClient.invalidateQueries({
        queryKey: ['myOffers', formData.offer_type],
      });
      navigate('/my-offers')
    }
    console.log('resp', resp)
  };

  return (
    <OfferForm
      title="На цій сторінці ви можете редагувати власне оголошення, яке буде зображено усім користувачам системи"
      handleSubmit={handleSubmit}
      initData={initData}
      buttonText="Зберегти зміни"
    />
  )
}