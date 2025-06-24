import {useQuery} from "@tanstack/react-query";
import {getInitForGet} from "./service.ts";
import {OfferTypesData} from "../types/responses.ts";

export const usePriceRange = () => {
  return useQuery<OfferTypesData>({
    queryKey: ['priceRange'],
    queryFn: () =>
      fetch(
        `/offers/price-range`,
        getInitForGet()
      )
        .then(res => {
          if (!res.ok) throw new Error('Ошибка сети');
          return res.json();
        }),
    refetchOnWindowFocus: false,
  });
}