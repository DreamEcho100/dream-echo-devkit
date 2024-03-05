/********** resolvers (start) **********/

import type { ZodString } from "zod";
import { z } from "zod";

import type {
  GetResolverValues,
  ValidExternalResolverSchema,
} from "./create-form-store-builder/resolvers";

interface Values {
  bruh: string;
  cap: "Ya";
  nah: ZodString;
}
const resolvers = {
  bruh: (params) => {
    return params.value;
  },
  // // cap: "lol",
  // lol: (params) => {
  //   return params.value; // getValue("cap");
  // },
  // nah: z.string(),
  age: () => "test number" as const,
  ha: (params) => {
    return params.value;
  },

  // bruh: z.string(),
  cap: z.literal("Ya"),
  nah: z.string(),
  lol: z.undefined(),
} satisfies ValidExternalResolverSchema<Values, string[]>;
resolvers;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ResolversValues = GetResolverValues<typeof resolvers>;
