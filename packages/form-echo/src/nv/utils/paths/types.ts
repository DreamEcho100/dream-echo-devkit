/* */
type Primitive = string | number | boolean | null | undefined;

// Handle paths for array elements
type ArrayPaths<Item> = Item extends (infer U)[]
  ? [number, ...PathsCollection<U>]
  : never;

// Handle paths for object properties
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ObjectPaths<Item> = Item extends Record<PropertyKey, any>
  ? { [Key in keyof Item]: [Key, ...PathsCollection<Item[Key]>] }[keyof Item]
  : never;

// Main type to handle paths for arrays, objects, and primitives
export type PathsCollection<Item> = Item extends Primitive
  ? []
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Item extends any[]
    ? ArrayPaths<Item>
    : ObjectPaths<Item>;

/*
// PathsCollection test cases
type TestPaths = PathsCollection<{ sss: [{ l: 0 }, 1, 2, 3] }>;
//   ^?
// Results: ["sss", ...any[]] | ["sss", "0", "l"] | ["sss", "1"] | ["sss", "2"] | ["sss", "3"]

type TestPathsAnyArray = PathsCollection<{ sss: any[] }>;
//   ^?
// Results: ["sss", ...any[]]
*/
/* */

/* */
// Utility type to concatenate paths into a single string
type PathsStringified<Item, StartPrefix = ""> = Item extends [
  infer Key,
  ...infer Rest,
]
  ? Key extends string
    ? Rest extends []
      ? `${StartPrefix & string}${Key}`
      : `${StartPrefix & string}${Key}${PathsStringified<Rest, ".">}`
    : Key extends number
      ? Rest extends []
        ? `[${Key}]`
        : `[${Key}].${PathsStringified<Rest>}`
      : never
  : never;
export type DeepPaths<T> = PathsStringified<PathsCollection<T>>;
/* */

type ReplaceBracketsWithDots<Path> =
  Path extends `${infer Prefix}[${infer Index}]${infer Suffix}`
    ? `${Prefix}.${Index}${ReplaceBracketsWithDots<Suffix>}`
    : Path;
// type ReplaceBracketsWithDots<Path> =
//   Path extends `${infer Prefix}[${infer Index}]${infer Suffix}`
//     ? `${Prefix}${Index extends ""
//         ? `${Index}`
//         : `.${Index}`}${ReplaceBracketsWithDots<Suffix>}`
//     : Path;
type GetValueByDotSeperatedPath<
  Item,
  Path extends string,
> = Path extends `${infer Key}.${infer Rest}`
  ? Key extends keyof Item
    ? GetValueByPath<Item[Key], Rest>
    : Key extends `${number}`
      ? Item extends (infer U)[]
        ? GetValueByPath<U, Rest>
        : never
      : never
  : Path extends keyof Item
    ? Item[Path]
    : Path extends `${number}`
      ? Item extends (infer U)[]
        ? U
        : never
      : never;
/**
 * @example
 *
 * ```ts
 * // Example object type
 * interface Example {
 *   items: {
 *     todos: { text: string }[];
 *   }[];
 * }
 *
 * // Test cases
 * type Test1 = GetValueByPath<Example, "items[0]">; // Expected: { todos: { text: string }[] }
 * type Test2 = GetValueByPath<Example, "items[0].todos">; // Expected: { text: string }[]
 * type Test3 = GetValueByPath<Example, "items[0].todos[0]">; // Expected: { text: string }
 * type Test4 = GetValueByPath<Example, "items.todos[0]">; // Expected: never (invalid path)
 * ```
 */
export type GetValueByPath<
  Item,
  Path extends string,
> = GetValueByDotSeperatedPath<Item, ReplaceBracketsWithDots<Path>>;

// To work on -> https://www.typescriptlang.org/play/#code/C4TwDgpgBAKhDOwD6BGKBeKBvK88C4oBtHAG0IAYoBfAGihXoCZ6BmAXRoG4AoUSWAmRMM2XASgBDAHYginarx4B6AFRRVyvuGgAFAE4BLALaHghgG7RMiI9IDmUAD5RpAV2MAjCPudRPAPYBpBAyfu6kpH5u0gAmEABmhtIQsbzKylAAEjKxIVBgksAAFvBQCQG+kvr6kiBQECHGENLA8NoCAII1dbpFpQA8AJLAEMYAfKIjYw0AHqNxZQAUyQk+UACqAJTyPFBQAPzE7l4+9AB0l30l8ADCwSEAxuYB0gMb4+x7UIQpVvrpTI5OL5Qo3cqVKABTwAKwgzwK+gCkH05gQHWgAHlYfDgNdBtMJlNRsY5gtYmUAErwyqxAYGZE+UAAaQgIHoMhA42+RxwRFZ9WSUAA1myAgkoIT2IR+WyLld+ncHrjDK9hiTZSB2J8aERRSBxZKSV99r8IP9AVAALKSIX8aDAAJQYq5UGKiFVHogeD0aFw54+qRxREmMyWdH2qD4pWRFVqwmTTCEsktClRoymcxWHnEE0-I0zCDzVNlTm7fb7I7dWogaPqsbciv57H+vGK+sTS3R+6x56q6RQUaIKCPSTwCM6QSIaOibvKvtquCIVDjS37AB6BxUmWp8DcpDaMoARHh4Ef5ecy+xOC4iCe8OeoEeKI+j6QjzfiPez-QjygP34d6nq+TAAbe36vqwH4YlObY3J0sjVnUs6Kj2TwvG8OCnoQV40Ku24VpuBG7vuh5fsBF5Xl8agaFoMHRgAysAdj2IYSSpB29BMdUeL6IkhizKIR5HomBakkW5JlEQ3yrOsAq0N8lznLJvi7sACl5kcAoposuDMck9jfJWUBqTpablk2hxQAABgAJFg3GogY-GCQAZHpLHUPZArUNZRkVoQdkOcAPHOUkbkeQZXlYD59mMfpDhsYYHFqb+5wib5-mENpEklq4HjePo-nGaZuW6RZllWdZRDeWy1DsH5lWmjZNUxXV7DnHFipMSxSUpUI4yZZVZr-N8I0+LwkYACIQBAYB1jAonxb17F0nOvYYQMi34TBS7ICgSAzXNM6YEd83tntK4ERuW48DB1JgKQkiPBAABCtSPKKbQAOpmMUU0BG09L9Im3z4mZZRBSp6YudQrXQ0McRFvV9nQwxbgJOFQ0VkcQVhQJ1CdVgiPxLM0UPU9L3vc9X3wL9JQA0D6OYwJg2NQFUb9JakYU89b0fbT9P-YD8DAyUoMZBW4NlWmUPSGsvj42T8Py+sJPI+wqOq74zNY35ktNrjcV8Vj9nq4JMtlMJ11NUbxNI2T+uZE1+bWUT5u+eTc2U-zNMQD9f2M6Luus5lBsc-ik2TgA4v7ABqkikG4b0gIzDFzT4RSpPiAzfISCn7NLxa6bYBkKUt-QQzZWsK1APlE9DanY1pbJV-qhqEv5Ryx8ACdJynOeEpq7D0GpjYczlxey-ZJyFdjhtiVXKza5sOx5pV3fx4nyevbW-TvKPA3FRzfw+Mf41Fc1ReSSKYoSp3C9D-i6-5tfeVBbPPjzzji+W1Ay+122BVSyRwNjH2aqfS+lkL7pFUKoPY6gAACRZJDGEehABBCCbLWWsm0LBksACisxUHoKhDiBE9pMEaCgJLPaI4xzomoTgxqmgYI9z7jvPeJRc77HzmDSuf9S4OHLqIdh28U5pwzrUUYsRB4kkPo9Pm1NPr+zpoHEWYtijjB2jJVoPgEh8ygEQkh+QsD+TMGMeAhAzGVUdLEAIVixCjHmIQIRjg4bsF4E2DxXiaB7D2JGPaaBMBiP7rvHOxi0EhF-BY4w8AiAUHYCJLgNDMhEMgM8VI1jBwBHsY4nAzjgCuISu4+QfjUmES3IOSce0RAhK3mErhxQBiRPQTEkk8TEnnDsQ45JFT0m4iyU4iSxSWK6hNOHIi1SBB7VYKIhpnCInEKiRAdpliEkdR6Z0pJq5+mzAyTI7JhTRkGXKZMqpgShAABZ5m93EeE-erTolPlifAbpuSHEbL6YQ-ZgzYgX3-skCwidDCxAKP0LYexzkBJqUIAArLcjhA996XUYLBVAh1ZrnRuLsn5ByhmQMBdIYFpBQXgpKJCipN0gA
