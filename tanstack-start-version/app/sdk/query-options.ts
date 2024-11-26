import { queryOptions } from "@tanstack/react-query";
import { getServerRandomNumber } from "./get-server-random-number";

export const getRandomNumberQueryOptions = () => {
  return queryOptions({
    queryKey: [
      "1app6stacks__tanstack-start-version",
      "getRandomNumberFromServer",
    ],
    queryFn: () => getServerRandomNumber(),
    staleTime: Infinity,
  });
};
