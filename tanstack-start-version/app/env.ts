import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_CONVEX_URL: z.string().url().min(1),
  },
  runtimeEnvStrict: {
    VITE_CONVEX_URL: import.meta.env.VITE_CONVEX_URL,
  },
});
