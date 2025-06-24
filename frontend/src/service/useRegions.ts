import {useQuery} from "@tanstack/react-query";
import {getInitForGet} from "./service.ts";
import {Region} from "../types/responses.ts";

export const useRegions = () => {
  return useQuery<Region[]>({
    queryKey: ['regions1'],
    queryFn: () =>
      fetch(
        `/regions`,
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
