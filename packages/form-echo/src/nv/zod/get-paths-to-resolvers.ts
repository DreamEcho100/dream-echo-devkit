/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// On the `updatePathsToResolversMap` function, add other cases that are not handled yet.

/* eslint-disable @typescript-eslint/no-unused-vars */
// https://chat.openai.com/c/0d9cc01a-55c3-4d3e-8cbd-606a99ef5a48
// ts-node "/media/de100/w/github/de100/dream-echo-devkit/packages/form-echo/src/nv/zod/_constraints.ts"

import type { z, ZodTypeAny } from "zod";
import {
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

/**
 * `""` refers to types on Zod that are not to be implemented.
 *
 * `"?"` refers to types on Zod that are to be implemented _(to do)_.
 *
 * `true` refers to types on Zod that are implemented.
 *
 * `false` refers to types on Zod that are not yet implemented
 * (as in how to handle their items or/and behaviors).
 */
const TODO = {
  //
  ZodRecord: false,
  ZodMap: false,
  ZodSet: false,
  ZodLazy: false,
  ZodPromise: false,
  ZodType: false, // to handle `z.instanceof` or `z.custom`

  //
  ZodNullable: "",
  ZodCatch: "",
  ZodBranded: "",
  ZodReadonly: "",

  //
  ZodObject: true,
  ZodIntersection: true,
  ZodUnion: true,
  ZodDiscriminatedUnion: true,
  ZodPipeline: false,
  //
  ZodEffects: false, // to handle `z.preprocess`
  ZodDefault: false,
  ZodArray: false,
  ZodTuple: false,
  ZodOptional: true,
  ZodString: true,
  ZodNumber: true,
  ZodEnum: true,
  ZodNativeEnum: true,

  //
  ZodBigInt: true,
  ZodBoolean: true,
  ZodDate: true,
  ZodSymbol: true,
  ZodUndefined: true,
  ZodNull: true,
  ZodFunction: true,
  ZodNaN: true,
  ZodAny: true,
  ZodUnknown: true,
  ZodNever: true,
  ZodVoid: true,
  ZodLiteral: true,
} as const;

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

interface StackItem {
  schema: ZodTypeAny;
  path: string;
  prevPath: string;
}

export default function getPathsToResolvers(
  schema: ZodTypeAny,
  path = "",
  prevPath = "",
  pathsResolversMap: Record<string, Resolver> = {},
): Record<string, Resolver> {
  const stack: StackItem[] = [{ schema, path, prevPath }];
  // const pathsResolversMap: Record<string, Resolver> = {};

  while (stack.length > 0) {
    const { schema, path, prevPath } = stack.pop()!;

    const resolver: Resolver = (pathsResolversMap[path] ??= {
      rules: { required: true },
      handler: (params) => schema.parse(params.getValue(path)),
      prevPath,
    });

    if (schema instanceof ZodObject) {
      for (const key in schema.shape) {
        stack.push({
          schema: schema.shape[key],
          path: path ? `${path}.${key}` : key,
          prevPath: path ? path : prevPath,
        });
      }
    } else if (schema instanceof ZodEffects) {
      stack.push({ schema: schema.innerType(), path, prevPath });
    } else if (schema instanceof ZodIntersection) {
      const leftPathsResolversMap: Record<string, Resolver> =
        getPathsToResolvers(schema._def.left, path, prevPath);
      const rightPathsResolversMap: Record<string, Resolver> =
        getPathsToResolvers(schema._def.right, path, prevPath);

      Object.assign(
        pathsResolversMap,
        leftPathsResolversMap,
        rightPathsResolversMap,
      );
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

        getPathsToResolvers(option, path, prevPath, innerPathsResolverMap);

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

      Object.assign(pathsResolversMap, combinedResult);
    } else if (schema instanceof ZodPipeline) {
      // FIXME: What to do with .pipe()?
      stack.push({ schema: schema._def.out, path, prevPath });
    } else if (path === "") {
      // All the cases below are not allowed on root
      throw new Error("Unsupported schema");
    } else if (schema instanceof ZodArray) {
      resolver.rules.multiple = true;
      stack.push({ schema: schema.element, path: `${path}[]`, prevPath: path });
    } else if (schema instanceof ZodString) {
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
      stack.push({ schema: schema.unwrap(), path, prevPath });
    } else if (schema instanceof ZodDefault) {
      resolver.rules.required = false;
      stack.push({ schema: schema.removeDefault(), path, prevPath });
    } else if (schema instanceof ZodNumber) {
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
      resolver.rules.pattern = (schema.options as string[])
        .map((option: string) =>
          // To escape unsafe characters on regex
          option.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d"),
        )
        .join("|");
    } else if (schema instanceof ZodTuple) {
      for (let i = 0; i < schema.items.length; i++) {
        stack.push({
          schema: schema.items[i],
          path: `${path}[${i}]`,
          prevPath: path,
        });
      }
    } else if (schema instanceof ZodLazy) {
      // FIXME: If you are interested in this, feel free to create a PR
      // Could be used to fix [recursive TS problem](https://www.reddit.com/r/typescript/comments/z2tf75/help_circular_dependencies_w_interfaces_and_zod/)
      // and [circular dependencies](https://www.reddit.com/r/typescript/comments/z2tf75/help_circular_dependencies_w_interfaces_and_zod/)
      // schema._def.getter();
    }
  }

  return pathsResolversMap;
}
