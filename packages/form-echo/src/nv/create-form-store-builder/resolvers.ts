import type { infer as ZodInfer } from "zod";
import { ZodSchema } from "zod";

import type {
  FormStoreShape,
  FormStoreShapeBaseMethods,
  SharedStoreMethodsKeys,
} from "../types";
import type { OtherStrings, TFunction } from "../types/internal";
import type { FormError } from "~/types";

export interface SubmitState {
  counter: number;
  passed: number;
  failed: number;
  error: FormError | null;
  isPending: boolean;
}

export type ResolveEvents = "submit" | "change" | "focus" | "custom";

export type HandleResolverPropsPassedMethods<Values, ExternalResolvers> = {
  [Key in SharedStoreMethodsKeys]: FormStoreShapeBaseMethods<
    Values,
    ExternalResolvers
  >[Key];
};

type FormStoreResolver<
  Values,
  ExternalResolvers,
  Name extends keyof ExternalResolvers,
  ErrorShape,
> = (
  params: {
    name: Name;
    get: () => FormStoreShape<Values, ExternalResolvers, ErrorShape>;
    value: Name extends keyof Values ? Values[Name] : undefined;
  } & HandleResolverPropsPassedMethods<Values, ExternalResolvers>,
) => GetResolverValues<ExternalResolvers>[Name];

type FormStoreResolverParams<
  Values,
  ExternalResolvers,
  Key extends keyof Values | OtherStrings,
  ErrorShape,
> = HandleResolverPropsPassedMethods<Values, ExternalResolvers> & {
  // ???
  // Weird typescript error and inference here
  // name: Key;
  get: () => FormStoreShape<Values, Record<string, unknown>, ErrorShape>;
  value: Key extends keyof Values ? Values[Key] : never;
};

export type ValidExternalResolverSchema<Values, ErrorShape> = {
  [Key in keyof Values | OtherStrings]?:
    | ZodSchema
    | ((
        params: FormStoreResolverParams<
          Values,
          Record<string, unknown>,
          Key,
          ErrorShape
        >,
      ) => unknown);
};

export type GetResolverValues<Schema> = {
  [Key in keyof Schema]: Schema[Key] extends ZodSchema<unknown>
    ? ZodInfer<Schema[Key]>
    : Schema[Key] extends TFunction
      ? ReturnType<Schema[Key]>
      : Schema[Key];
};

function getEventStateInitial(isActive = false) {
  return { isActive, passed: 0, failed: 0 };
}

/**
 * This class will be used to define the a set of values that will be used to resolve the form store based on `Values` and `ExternalResolvers`.
 *
 * **The `ExternalResolvers`:**
 * - The `ExternalResolvers` is a set of functions that could throw an error or return a value.
 * - The `ExternalResolvers` have params that have an access to some of the store methods and if it have the same name in `Values` it will have access to the value of the store through `params.value`.
 * - The errors thrown by the `ExternalResolvers` will be handled by the `errorFormatter` method of the store and stored on
 * - It's called `ExternalResolvers` because it's returned value can be inferred by `GetResolverValuesFromSchema` and will be transformed as a `handlers` with the type of `FormStoreResolver`.
 */
export interface FormStoreResolvers<Values, ExternalResolvers, ErrorShape> {
  // ???
  // Should this be stored here?
  // Or should it be stored in the `FormStoreShape`?
  // externalResolvers: ExternalResolvers;
  fields: {
    [Key in keyof ExternalResolvers]: {
      handler: FormStoreResolver<Values, ExternalResolvers, Key, ErrorShape>;
      events: {
        [key in ResolveEvents]: {
          isActive: boolean;
          passed: number;
          failed: number;
        };
      };
      currentDirtyEventsCounter: number;
      passed: number;
      failed: number;
      metadata: { name: Key };
      currentEvent: ResolveEvents | null;
      error: FormError | null;
    };
  };
  isDirty: boolean;
  currentDirtyCount: number;
  lastActive: {
    item: keyof ExternalResolvers | null;
    event: ResolveEvents | null;
  };
  metadata: {
    resolversKeys: (keyof ExternalResolvers)[];
    externalResolvers: ExternalResolvers;
    initialResolveEvents?: { [key in ResolveEvents]?: boolean };
  };
}

export function createFormStoreResolvers<
  Values,
  ExternalResolvers extends ValidExternalResolverSchema<Values, ErrorShape>,
  ErrorShape,
>(
  externalResolvers: ExternalResolvers,
  initialResolveEvents?: { [key in ResolveEvents]?: boolean },
): FormStoreResolvers<Values, ExternalResolvers, ErrorShape> {
  type Fields = FormStoreResolvers<
    Values,
    ExternalResolvers,
    ErrorShape
  >["fields"];
  type Handler = FormStoreResolver<
    Values,
    ExternalResolvers,
    Extract<keyof ExternalResolvers, string>,
    ErrorShape
  >;

  // const externalResolvers = schema;
  const fields = {} as Fields;
  for (const key in externalResolvers) {
    fields[key].currentDirtyEventsCounter = 0;
    fields[key].passed = 0;
    fields[key].failed = 0;
    fields[key].metadata = { name: key };
    fields[key].currentEvent = null;
    fields[key].error = null;

    fields[key].events = {
      custom: getEventStateInitial(initialResolveEvents?.change),
      change: getEventStateInitial(initialResolveEvents?.change),
      focus: getEventStateInitial(initialResolveEvents?.focus),
      submit: getEventStateInitial(initialResolveEvents?.submit),
    };

    if (typeof externalResolvers[key] === "function") {
      fields[key].handler = externalResolvers[key] as unknown as Handler;
      continue;
    }

    if (
      typeof ZodSchema !== "undefined" &&
      externalResolvers[key] instanceof ZodSchema
    ) {
      fields[key as unknown as keyof Values & keyof ExternalResolvers].handler =
        ((
          params: FormStoreResolverParams<
            Values,
            ExternalResolvers,
            keyof Values & keyof ExternalResolvers,
            ErrorShape
          >,
        ) => {
          const value = params.value;
          const result = (externalResolvers[key] as ZodSchema).safeParse(value);
          if (result.success)
            return result.data as Values[keyof Values &
              keyof ExternalResolvers];
          throw result.error;
        }) as unknown as (typeof fields)[keyof Values &
          keyof ExternalResolvers]["handler"];

      continue;
    }
  }

  return {
    fields,
    currentDirtyCount: 0,
    isDirty: false,
    lastActive: { event: null, item: null },
    metadata: {
      resolversKeys: Object.keys(externalResolvers),
      externalResolvers,
      initialResolveEvents,
    },
  };
}
