import {useQuery} from "@tanstack/react-query";
import {getInitForGet} from "./service.ts";
import {PriceRangeData} from "../types/responses.ts";
import {RolesMap} from "../types/common.ts";

export const usePriceRange = ({
  offerType
}:{
  offerType: RolesMap
}) => {
  return useQuery<PriceRangeData>({
    queryKey: ['priceRange', offerType],
    queryFn: () =>
      fetch(
        `/offers/price-range?offer_type=${offerType}`,
        getInitForGet()
      )
        .then(res => {
          if (!res.ok) throw new Error('Ошибка сети');
          return res.json();
        }),
    refetchOnWindowFocus: false,
  });
}