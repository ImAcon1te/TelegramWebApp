import {useQuery} from "@tanstack/react-query";
import {getInitForGet} from "./service.ts";
import {OfferTypesData} from "../types/responses.ts";

export const useOfferTypes = () => {
  return useQuery<OfferTypesData>({
    queryKey: ['offerTypes'],
    queryFn: () =>
      fetch(
        `/offer/types`,
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