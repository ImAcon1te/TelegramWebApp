import {useQuery} from "@tanstack/react-query";
import {getInitForGet, getTgId} from "./service.ts";
import {Offer} from "../types/responses.ts";
import {FilterOfferData} from "../types/forms.ts";
import {objectToQueryStringWithURL} from "../helpers/helpers.tsx";

export const useOffersFiltered = (filters: FilterOfferData | null) => {
  return useQuery<Offer[]>({
    queryKey: ['offersFilteres', filters],
    queryFn: () =>
      fetch(
        objectToQueryStringWithURL(`/offers/search`, {
          ...filters,
          telegram_user_id: getTgId()
        }),
        getInitForGet()
      )
        .then(res => {
          if (!res.ok) throw new Error('Ошибка сети');
          return res.json();
        }),
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!filters
  });
}