import { createServerFn } from "@tanstack/start";

export const getServerRandomNumber = createServerFn({
  method: "GET",
}).handler(() => {
  return Math.random();
});
