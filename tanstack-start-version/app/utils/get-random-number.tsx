import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";

export const getServerRandomNumber = createServerFn({
  method: "GET",
}).handler(() => {
  return Math.random();
});

export const getRandomNumberQueryOptions = () => {
  return queryOptions({
    queryKey: ["1app6stacks__tanstack-start-version","getRandomNumberFromServer"],
    queryFn: () => getServerRandomNumber(),
    staleTime: Infinity,
  });
};