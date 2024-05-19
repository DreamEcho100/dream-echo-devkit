type Primitive = string | number | boolean | null | undefined;
type ArrayPaths<T> = T extends (infer U)[] ? [number, ...PathsArray<U>] : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ObjectPaths<T> = T extends Record<PropertyKey, any>
  ? { [K in keyof T]: [K] | [K, ...PathsArray<T[K]>] }[keyof T]
  : never;
type PathsArray<T> = T extends Primitive
  ? []
  : T extends []
    ? T | ArrayPaths<T>
    : ObjectPaths<T>;
// Utility type to concatenate paths into a single string
type PathsStringified<T, StartPrefix = ""> = T extends [infer K, ...infer Rest]
  ? K extends string
    ? Rest extends []
      ? `${StartPrefix & string}${K}`
      : `${StartPrefix & string}${K}${PathsStringified<Rest, ".">}`
    : K extends number
      ? Rest extends []
        ? `[${K}]`
        : `[${K}].${PathsStringified<Rest>}`
      : never
  : never;
export type DeepPaths<T> = PathsStringified<PathsArray<T>>;

type ReplaceBracketsWithDots<Path> =
  Path extends `${infer Prefix}[${infer Index}]${infer Suffix}`
    ? `${Prefix}.${Index}${ReplaceBracketsWithDots<Suffix>}`
    : Path;
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

// https://www.typescriptlang.org/play/?#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-sCAEICaceQYLLC8wwKLAJ8s-bHIQEbZo7s47O0ouhU4YLvFyQlpzPglFAgRPJtzXS2B-byzIJkJCuAGZ0GppqeWEt9LIjniQWhpMBS4FwC3Zm6F1ZMwqabU45jOZv37gE9CjFNS4HpgE+Qkc4BzwIA4AJkhj4wyQAzS2ViBQMwFLITQAChlh1lvLBA1NGL92FrnD51NcCi3VjAWBG6l2W35ZqbmtCEXggQKbS2F9NAkHEGC3mwDR4MwcduggnMbaHADtgKOSBuEOCxbgAOzRqbJxhhe+QPNFZICBerRJztR6ZGEnBWedBTj901BLAOvMA66SQJqAOKA4CMRw8A6mD7uHoUVtzd+jE4L1KQMAzU8gkDL0jrpUWlBI6k0tsAlAYLAikxIAbWQqw5IB3EEgfu8tgGXHoIxdCKB1anDknPJWCA4D917cvSE8hEmyAlv3VOATdKZFOOTAUyJuNgsjlnOSXs56MV5uTSOtLsB0F0ocg2IKGaBDBZqJAvNI7k0NVuxinHsAIDgrpFuEW0DMeRPwLOlsIlZMebgLODNZBwWAXQM4XSCDAINs0SOshdJ8v4JYLp8t+C8ORLpUecEo7iHJhJ5EAolktICRE0WAcs6sbQHBGASAInUyy-UxWkdulwEjnbMg3CMCQlOKbJAnM7a20VqLO26t5YxOWYxBAkcA7oSQLIeB-cum4GARLbhgySA5uHqJu2cE4Jz37pRJA3a4JXewAV6OClLAEH4LgDNATI4BoIP3OCckEDD37vIOemo7YGzgrzGAFq2PIhgLIJApteb8EBczGGosYAHa9nJzIosYa0LoDvOCDN+CK23YcAUDXUICnJhLH2o8LYwxQBE+W1Nh5z3JuhOCmRdYCn4JHOCpMIUMyQPIZ2RdsDdwDmL2WyIFkleRGQCXAdNDyGQV+sg-dOa8AibzBAdAS6K0OByuAs8YCEIFgB6m-dN3Hsttw3SztAgOFM7gRinNW0BJVnPTQBAUQhEu9TXmDhqYSxgE+hAlgA7q2oehbm1Nz0EFJp3HeY9MOm3ELgClrmCDC+aKbUeltLbywCeS3mEskMvNJnBJt3NKKagcGC3A5nGIG05oxbAlFOaj2djDQ48sUAb3EHL3AmpxAOHlhTqflgNlZ1OAE0WjzdK4H9plhwaBs7D0sMWqe1NFZ0AcAzu2PdRbOzoBE3A6t0JSYcJ952Znh7FO4dgcmpxnY4JFY+cs5eYKs4BTgHByNyY0BZBBV+5nZ+IZdNR+4-YEBNQglUDeVTMhs4Jy5eYwU54J9ZBThNRI4wUSAa0A4MAX9NQs4HAs5+AmF+5MhcBTZyZgEs5NRZk08JZh5K8CBuEbdO4CAIlmhLA7Z9EwVRZyZLAyAs4XYakv0X0A55B0JAhqZdIYYGYFZAhnZZA0Aj0YZTNKJkQjM7ZNQCB0IBRTFLA55gEWY54GZOZ+4s5FZMgAlt06BEU6AWlqZTYAk4A0AoUF1QVWh7lqYBRkEC5TZ4UL8SEJ4GYDd4VvMJYUAxNMMDZuZI4DZK1uY4JnYhC6BDhuFRZZBMhAd9cCALtRkbcBQ45KBmgGYAluZ1ZRYBRuZNAwV+4YBLAwUKZ2juZMg4JmgkVuEyB5ZJ55YMA5IgdHhRZR4A40s704AIFTYJZuZMJOYCADEjFxB6FAdLBKA4ALESBAgNcrNMg1N5A0BnZL0Y5QkA5DhiI49mhg0IEYYA5Q5ThLZNRdQqkUBJ0w9xBnZ5AHBgEYB+BMM0As4yBv9kR1ZI4SA4AE4BQz4W1RkI55A6AwV41GIdNI5UUEBSYl9LZ+ANYBQedKdR5dI4AGZR4RVLZMJh5MhdIGZThGIvcDZAFh44hfkq9WYCACAyBI5xAl1GJT8wVgFmg4IYY0AEA7YJ8YYmTjFLFLZeYBQc4mT0tuEJEyAM49hYIoAF1cB7ESAXJLoGI8IWANIGpyJWAqIJoWIpoZp5JqR5pmo2A3S+BhBsp-gXJhAlphguoCogZNg4QsATSMsEAHB9ISB0pLSkBrT9o7TXTTgTsKVLJtprIuJ2QCBeIHT+IaIypsyfIpIDBXTsoGpuJ8zlJPS7B1BspfTqQ7TppCzZJspuE6hlRsASAzSlIoBNoSAuzLgVQ+zr0Qy-Tyh0pSp2o4BFhOB0yMBMyhoMz9EthBpQzgZVAjTYokIsF4APAYyeBLBozYz4EEzRANJOhRBDzngHATyGoagmzEg8z-gZyCoJx-glyVzXzSguhgBky7zjyMBLA9AuQfz9EuQDBlpbJ9oVJYBiJ7yTzwLspoKGouQ-IuAWoDpgKHzQLwLIK4BoKYLSzrgAAKR0wSSOAASkMG+i5EjiwrEGEACSej3METIESkCjwpQogrXOIoMEykQqPPwrAq5DQoMDumEANlBgpF3NOgPKQpAssDNItKJE4GvI0pEuQtAqfO9OKD-IWEWhYnmCUAAopCAuUrEvApcnQrIvejgq+gpE9N4oIokupHsteh8kwu0s9PsjcvErsqEr8pDKjPvLjITMCtspYmgrwgcqospAZlCs9LoAZn0pfJrPfLnO6i-OegErMoIFMBSuwqgA4qUtEpPLPMirnMTL0Giq5GCuErSsJBcp8GEH4BKpOjik4u4tagaqau6AasktaugE4GEHJlBgUp6oqt0tUuvXUs0qwhvM4ECoyupEKv9NMqMvMpMBvKssqvcuCtgtWngtcusr4skowuYsHJ+gGtipCpYuNIQDTQiovNquGs8qkoakSuymSo2gMvSocufI2p2pUCEhys-KbG-IKrBuKr2j+sIoEq8tGg+jWhqjyE9PKq4ouk6nsHskRv4uXKgqEpWsxrEFDDLEJvSmguklYEJsko9PJqgDujyGEC5EyBuqeq5H4C5pDOxr6twouqOoeuEs+r4Dis3MmsNIOAFoumvOehhGTJelRqcvWluvsj+k3JNLUpYleFwh+qLMEgzQWgzXWp9LBq2rIEKvhvcjKsUrIECt1reAVozVZoBigEyCenCpjJqosn1qVsNtkjSu+jSvNsMqyohoslyuhvyuJrgBtuDIBrDopGxsCuqvev9tdoZndqes6vymdimoOCpFQHNAbPrCECgD0GMAbLEB3CKE2vKGrGEGCFCAwHCAXPyH7HFGDEKrGHSGPGmCiHzAbsts6jvGqFqHqACC5HCIQGtD2u5F6Ggs7t2BGDJs4FrscBHrcDHvsGbqCBCDCAiHKFbHiD7oME7unCHvsHrt3qyvHpXASD0BqBpGnvZrnoXu6C5GXsvvKDXq4D2tED-s4HrGyBEDEEwBLWcGfvKC3rrp3ojrfM6gPtbuPs7s4DPt7rBv7p8GvogcxrvqQdKAwa4AnqrtfqfBns-q6CXpXs6gAfXrgc6iIcbryFQaPvbpPryCwYSBrNwYHqyBvuHsKHvuQfJvIZfqnoaG5BocXp-voaGFXo3qgBAdMEiGT0sBOxLWEbkAwHgTYccDqGtr3u3sJQ8BMYfs4F2F2CNK3nNDlsuFeBLpQG-rAeFCgdwBga5D+G0tJAjMpGdgcYdrQhcbcfTBPE8ZgclB8dUDav8YCboEyGCZmpxqcbCe5Bid8fibJDsfJhSf3LSeaGcYYlcftD5Eid4C8eL0lCybibGpJFyeLoNgKd6ougyZ5AiY8aqeiaFDzFEZIFib8bJEgmACAA
