import {useQuery} from "@tanstack/react-query";
import {getHeaders, getTgId} from "./service.ts";

export const useUser = () => {
  console.log( {
    ...getHeaders()
  })
  return useQuery({
    queryKey: ['user'],
    queryFn: () =>
      fetch(
        `/user?user_id=${getTgId()}`,
        {
          ...getHeaders()
        }
      )
        .then(res => {
          if (!res.ok) throw new Error('Ошибка сети');
          return res.json();
        }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}