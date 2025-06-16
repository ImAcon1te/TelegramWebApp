import {useQuery} from "@tanstack/react-query";
import {getTgId} from "./service.ts";
import {UserData} from "../types/responses.ts";

export const useUser = () => {
  return useQuery<UserData>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch(`/user/${getTgId()}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        // HTTP-ошибка
        throw new Error(`Ошибка сети: ${res.status}`);
      }

      const data = await res.json();
      if (data.message && data.message !== 'success') {
        // Важно: без кавычек вокруг data.message
        throw new Error(data.message);
      }
      return data;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
}