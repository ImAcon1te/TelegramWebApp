import {useQuery} from "@tanstack/react-query";
import {getInitForGet, getTgId} from "./service.ts";
import {Regions} from "../types/responses.ts";

export const useRegions = () => {
  return useQuery<Regions>({
    queryKey: ['regions1'],
    queryFn: () =>
      fetch(
        `/regions?telegram_user_id=${getTgId()}`,
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