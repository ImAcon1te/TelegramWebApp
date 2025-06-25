import {useQuery} from "@tanstack/react-query";
import {getInitForGet, getTgId} from "./service.ts";
import {Offer} from "../types/responses.ts";
import {RolesMap} from "../types/common.ts";

export const useMyOffers = (offerType: RolesMap) => {
  return useQuery<Offer[]>({
    queryKey: ['myOffers', offerType],
    queryFn: () =>
      fetch(
        `/offer/my?telegram_user_id=${getTgId()}&offer_type=${offerType}`,
        getInitForGet()
      )
        .then(res => {
          if (!res.ok) throw new Error('Ошибка сети');
          return res.json();
        }),
    staleTime: 3_000,
    refetchOnWindowFocus: false,
    retry: false,
    refetchOnMount: true
  });
}