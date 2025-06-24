import {useQuery} from "@tanstack/react-query";
import {getInitForGet, getTgId} from "./service.ts";
import {Offer} from "../types/responses.ts";
import {RolesMap} from "../types/common.ts";

export const useOffersSent = (offerType: RolesMap) => {
  return useQuery<Offer[]>({
    queryKey: ['offersSent', offerType],
    queryFn: () =>
      fetch(
        `/offer/requests/sent?telegram_user_id=${getTgId()}`,
        getInitForGet()
      )
        .then(res => {
          if (!res.ok) throw new Error('Ошибка сети');
          return res.json();
        }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}