/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import type { ZodTypeAny } from "zod";
import {
  z,
  ZodArray,
  ZodDefault,
  ZodDiscriminatedUnion,
  ZodEffects,
  ZodEnum,
  ZodIntersection,
  ZodLazy,
  ZodNativeEnum,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodPipeline,
  ZodString,
  ZodTuple,
  ZodUnion,
} from "zod";

import getPathsToResolversLoop from "../zod/get-paths-to-resolvers.js";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Handler = (params: { getValue: (path: string) => any }) => any;

interface Constraint {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  multiple?: boolean;
  pattern?: string;
}

const keys: (keyof Constraint)[] = [
  "required",
  "minLength",
  "maxLength",
  "min",
  "max",
  "step",
  "multiple",
  "pattern",
];

interface Resolver {
  handler: Handler;
  rules: Constraint;
  prevPath: string;
}

function updatePathsToResolversMap(
  schema: ZodTypeAny,
  pathsResolversMap: Record<string, Resolver>,
  path = "",
  prevPath = "",
) {
  const resolver: Resolver = (pathsResolversMap[path] ??= {
    rules: { required: true },
    handler: (params) => schema.parse(params.getValue(path)),
    prevPath,
  });

  if (schema instanceof ZodObject) {
    for (const key in schema.shape) {
      updatePathsToResolversMap(
        schema.shape[key],
        pathsResolversMap,
        path ? `${path}.${key}` : key,
        path ? path : prevPath,
      );
    }
  } else if (schema instanceof ZodEffects) {
    updatePathsToResolversMap(
      schema.innerType(),
      pathsResolversMap,
      path,
      prevPath,
    );
  } else if (schema instanceof ZodIntersection) {
    const leftResult: Record<string, Resolver> = {};
    const rightResult: Record<string, Resolver> = {};

    updatePathsToResolversMap(schema._def.left, leftResult, path, prevPath);
    updatePathsToResolversMap(schema._def.right, rightResult, path, prevPath);

    Object.assign(pathsResolversMap, leftResult, rightResult);
  } else if (
    schema instanceof ZodUnion ||
    schema instanceof ZodDiscriminatedUnion
  ) {
    const combinedResult: Record<string, Resolver> = {};
    const combinedListNames = new Set<string>();

    for (const option of schema.options as ZodTypeAny[]) {
      const innerPathsResolverMap: Record<string, Resolver> = {
        [path]: pathsResolversMap[path]!,
      };

      updatePathsToResolversMap(option, innerPathsResolverMap, path, prevPath);

      for (const key of Object.keys(innerPathsResolverMap)) {
        combinedListNames.add(key);
      }

      for (const innerName of combinedListNames) {
        const prevConstraint = combinedResult[innerName];
        const nextConstraint = innerPathsResolverMap[innerName];

        const innerResolver = (combinedResult[innerName] ??= {
          handler: prevConstraint?.handler ?? nextConstraint?.handler,
          rules: prevConstraint?.rules ?? nextConstraint?.rules,
          prevPath: prevConstraint?.prevPath ?? nextConstraint?.prevPath,
        } as Resolver);

        if (prevConstraint && nextConstraint) {
          innerResolver.rules = {
            ...innerResolver?.rules,
            ...prevConstraint.rules,
            ...nextConstraint.rules,
          };

          for (const key of keys) {
            if (
              typeof prevConstraint.rules[key] !== "undefined" &&
              typeof nextConstraint.rules[key] !== "undefined" &&
              prevConstraint.rules[key] === nextConstraint.rules[key]
            ) {
              // @ts-expect-error Both are on the same type
              innerResolver[key] = prevConstraint[key];
            }
          }
        } else {
          innerResolver.rules = {
            ...innerResolver.rules,
            ...(nextConstraint?.rules ?? prevConstraint?.rules),
          };
        }
      }
    }

    /*
    const combinedResult = (schema.options as ZodTypeAny[])
      .map((option) => {
        const innerPathsResolverMap: Record<string, Resolver> = {};

        updatePathsToResolversMap(
          option,
          innerPathsResolverMap,
          name,
          prevPath,
        );

        return innerPathsResolverMap;
      })
      .reduce((prev, next) => {
        const list = new Set([...Object.keys(prev), ...Object.keys(next)]);
        const innerPathsResolverMap: Record<string, Resolver> = {
          [name]: pathsResolversMap[name]!,
        };

        for (const innerName of list) {
          const prevConstraint = prev[innerName];
          const nextConstraint = next[innerName];

          const innerResolver = (innerPathsResolverMap[innerName] ??= {
            handler: prevConstraint?.handler ?? nextConstraint?.handler,
            rules: prevConstraint?.rules ?? nextConstraint?.rules,
            prevPath:
              prevConstraint?.prevPath ?? nextConstraint?.prevPath,
          } as Resolver);

          if (prevConstraint && nextConstraint) {
            innerResolver.rules = {
              ...innerResolver.rules,
              ...prevConstraint.rules,
              ...nextConstraint.rules,
            };

            for (const key of keys) {
              if (
                typeof prevConstraint.rules[key] !== "undefined" &&
                typeof nextConstraint.rules[key] !== "undefined" &&
                prevConstraint.rules[key] === nextConstraint.rules[key]
              ) {
                // @ts-expect-error Both are on the same type
                innerResolver[key] = prevConstraint[key];
              }
            }
          } else {
            innerResolver.rules = {
              ...innerResolver.rules,
              ...(nextConstraint?.rules ?? prevConstraint?.rules),
            };
          }
        }

        return innerPathsResolverMap;
			});
		*/

    Object.assign(pathsResolversMap, combinedResult);
  } else if (schema instanceof ZodPipeline) {
    // FIXME: What to do with .pipe()?
    updatePathsToResolversMap(
      schema._def.out,
      pathsResolversMap,
      path,
      prevPath,
    );
  } else if (path === "") {
    // All the cases below are not allowed on root
    throw new Error("Unsupported schema");
  } else if (schema instanceof ZodArray) {
    resolver.rules.multiple = true;
    updatePathsToResolversMap(
      schema.element,
      pathsResolversMap,
      `${path}[]`,
      path,
    );
  } else if (schema instanceof ZodString) {
    // if (schema.minLength !== null) {
    //   resolver.rules.minLength = schema.minLength;
    // }
    // if (schema.maxLength !== null) {
    //   resolver.rules.maxLength = schema.maxLength;
    // }
    for (const check of schema._def.checks) {
      if (check.kind === "min") {
        resolver.rules.minLength = check.value;
      } else if (check.kind === "max") {
        resolver.rules.maxLength = check.value;
      } else if (check.kind === "regex") {
        resolver.rules.pattern = check.regex.source;
      }
    }
  } else if (schema instanceof ZodOptional || schema instanceof ZodNullable) {
    resolver.rules.required = false;
    updatePathsToResolversMap(
      schema.unwrap(),
      pathsResolversMap,
      path,
      prevPath,
    );
  } else if (schema instanceof ZodDefault) {
    resolver.rules.required = false;
    updatePathsToResolversMap(
      schema.removeDefault(),
      pathsResolversMap,
      path,
      prevPath,
    );
  } else if (schema instanceof ZodNumber) {
    // if (schema.minValue !== null) {
    // 	resolver.rules.min = schema.minValue;
    // }
    // if (schema.maxValue !== null) {
    // 	resolver.rules.max = schema.maxValue;
    // }
    for (const check of schema._def.checks) {
      if (check.kind === "min") {
        resolver.rules.min = check.value;
      } else if (check.kind === "max") {
        resolver.rules.max = check.value;
      } else if (check.kind === "int") {
        resolver.rules.step = 1;
      }
    }
  } else if (schema instanceof ZodNativeEnum) {
    const options: string[] = [];
    for (const key in schema._def.values) {
      if (Object.prototype.hasOwnProperty.call(schema._def.values, key)) {
        options.push(schema._def.values[key]);
      }
    }

    resolver.rules.pattern = options.join("|");
  } else if (schema instanceof ZodEnum) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    resolver.rules.pattern = schema.options
      .map((option: string) =>
        // To escape unsafe characters on regex
        option.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d"),
      )
      .join("|");
  } else if (schema instanceof ZodTuple) {
    for (let i = 0; i < schema.items.length; i++) {
      updatePathsToResolversMap(
        schema.items[i],
        pathsResolversMap,
        `${path}[${i}]`,
        path,
      );
    }
  } else if (schema instanceof ZodLazy) {
    // FIXME: If you are interested in this, feel free to create a PR
    // Could be used to fix [recursive TS problem](https://www.reddit.com/r/typescript/comments/z2tf75/help_circular_dependencies_w_interfaces_and_zod/)
    // and [circular dependencies](https://www.reddit.com/r/typescript/comments/z2tf75/help_circular_dependencies_w_interfaces_and_zod/)
    // schema._def.getter();
  }
}

function getPathsToResolversRecursive(schema: z.ZodTypeAny) {
  const pathsResolversMap: Record<string, Resolver> = {};

  updatePathsToResolversMap(schema, pathsResolversMap);

  return pathsResolversMap;
}

/**
 * @param {Function} func
 * @param {unknown[]} input
 * @param {number} iterations
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function benchmark(func: Function, input: unknown[], iterations = 1_000_000) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    func(...input);
  }
  const end = performance.now();
  return end - start;
}

enum nativeEnumExample {
  d = "d",
  e = "e",
  f = "f",
}

const dateLike = z.union([z.number(), z.string(), z.date()]);
const dateLikeToDate = dateLike.pipe(z.coerce.date());

const zodExampleSchema = z.object({
  str: z.string(),
  str2: z.string().optional(),
  str3: z.string().min(3).max(10),
  str4: z.string().regex(/^[a-z0-9]+$/),
  num: z.number(),
  num2: z.number().min(0).max(100),
  num3: z.number().min(0).max(100).optional(),
  null: z.null(),
  date: z.date().max(new Date(), { message: "Too young!" }),
  date2: z.date().min(new Date("1900-01-01"), { message: "Too old" }),
  //
  ZodBigInt: z.bigint(),
  ZodBoolean: z.boolean(),
  ZodSymbol: z.symbol(),
  ZodUndefined: z.undefined(),
  ZodNull: z.null(),
  ZodFunction: z.function(),
  ZodNaN: z.nan(),
  ZodAny: z.any(),
  ZodUnknown: z.unknown(),
  ZodNever: z.never(),
  ZodVoid: z.void(),
  ZodObject: z.object({
    item: z.string(),
    item2: z.string(),
  }),
  ZodLiteral: z.literal("literal"),
  // constraints at the end will override all previous
  ZodIntersection: z.string().min(3).max(10).and(z.string().min(5).max(15)),

  //
  union: z.string().min(3).max(10).or(z.string().min(7).max(20)),
  union2: z.string().min(3).max(10).or(z.string().min(7).max(20)).optional(),
  union3: z
    .string()
    .min(3)
    .max(10)
    .or(
      z.object({
        test: z.string(),
        deep: z.number().min(0),
        union: z.literal("!").optional(),
      }),
    ),

  enum: z.enum(["a", "b", "c"]),
  enum2: z.enum(["a", "b", "c"]).optional(),
  nativeEnum: z.nativeEnum(nativeEnumExample),
  nativeEnum2: z.nativeEnum(nativeEnumExample).optional(),
  dateLikeToDatePipe: dateLikeToDate,
  array: z.array(z.string().min(3).max(10)).min(1).max(10),
  tuple: z.tuple(
    [z.string().min(3).max(10), z.number().min(0).max(100)],
    z.object({
      test: z.string(),
      deep: z.number().min(0),
      tuple: z.literal("!").optional(),
    }),
  ),

  nullable: z.nullable(z.number().min(0).max(100)),
  nullable2: z.string().min(0).max(100).nullable(),
  nullish: z.string().min(0).max(100).nullish(),

  // ZodRecord: z.record(z.string()),
  // ZodRecord2: z.record(z.string(), z.number()),
  // ZodArray: z.array(),
  // ZodUnion: z.union(),
  // ZodDiscriminatedUnion: z.discriminatedUnion(),
  // ZodIntersection: z.intersection(),
  // ZodTuple: z.tuple(),
  // ZodMap: z.map(),
  // ZodSet: z.set(),
  // ZodLazy: z.lazy(),
  // ZodEnum: z.enum(),
  // ZodNativeEnum: z.nativeEnum(),
  // ZodPromise: z.promise(),
  // ZodPipeline: z.pipeline(),
});

const input = [zodExampleSchema];

const pathsResolversMapRecursive = benchmark(
  getPathsToResolversRecursive,
  input,
);

const pathsResolversMapLoop = benchmark(getPathsToResolversLoop, input);

console.log(`Loop method version took: ${pathsResolversMapLoop}ms`);
console.log(`Recursive method version took: ${pathsResolversMapRecursive}ms`);
