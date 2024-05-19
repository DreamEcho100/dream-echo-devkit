type Primitive = string | number | boolean | null | undefined;
type ArrayPaths<Item> = Item extends (infer U)[]
  ? [number, ...PathsCollection<U>]
  : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ObjectPaths<Item> = Item extends Record<PropertyKey, any>
  ? {
      [Key in keyof Item]: [Key] | [Key, ...PathsCollection<Item[Key]>];
    }[keyof Item]
  : never;
type PathsCollection<Item> = Item extends Primitive
  ? []
  : Item extends []
    ? Item | ArrayPaths<Item>
    : ObjectPaths<Item>;
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

// https://www.typescriptlang.org/play/?ssl=17&ssc=26&pln=17&pc=37#code/C4TwDgpgBACgTgSwLYOAgbtAvFAzsRAOwHMoAfKQgVyQCMI5ypaB7FgGwgENCnr32TKoQAmEAGYJCEEQG4AUPNCQoAQThwuIGF2AALXAB4AKgD4oOY1AgAPYBFG4oACiniGUAKoBKANoBdKAB+KF9qOgYAGigAOjidfVx1TRBDT1NAgC5KCEw4BXkAekLrXHYpYABaEQRcLlpOSuk7SvLpKAABZQhcAGNEMCqetuBCwhZK2zBy3tRKnhAlcGgAeVoAKwhe4ASDE3NLazsHEScAJS2WOBFDeBZIOFAAaQgQaIXTeShgqABvUKeUCkUAA1q8WOIoMZ-NlfE9AhQ4dE4jFdkkNFoTHD-BkoABfXxgkAQqH+L5QbLSPIFbqwXQGZKYswWKFHeyOWCIFBoTDkkIBcnZKy2dmnUJk77fEJWCiM7T0oxmcnfbJrTbbNH7ArFLxocqgKC04AsKC9FiEXq6BxWqBgBVAwjGqBcPBSYicPAEN1LFRogDKXpICEkMhM0QDXEe8AkCBsLIARPGDqyRScnL43B4nsi4pnGBd8BKfoDUxz8ERiMqfgXgGy0+Kq1KoAADAAkvwjUbgMbjADJPRW8e2nnjm42KS3252dt3JH2B26h78R+3-YHiMGEKGa9F4zEk6Oq9kS8cOeF6HBxyEa3WOQLJQ+fs3fMO8f4x4-Jdln6--DFVwqAYVpu249MApiHp+lK5Awgo5NSii0gAIhAEBgJqzI4GuwEhjcaJyvspg0ssUAXNMXC9BAABCmi9GCwC4AA6qgehISwDG3PSBzkrst5im2vx5pyPYEu2QkAJKiLYb5iYQ7iMH6VDiHOkGSiEAnRip-6-JJYg2EuZHsBR1G0fRTEsWxHGKcpsYQR+X50voxEqAA4hAwAAGpcOwVDUSAll+mhDBWiIuyGOS4n2EgkQ8fSfFOOWboxcmvGlvxsnyVALwgHi2lCTWqkhNl8WguCkKRRASBViEbmed5vlUfK+iGBVSBwq8-jRDWnwPserwlQJ54MKpD4hK1JWuHJHg+Pen4-LVXk+X5YWeF1YE9XN0F5OOW2wSqjl6CVRIkq11VQK1vi7EW+2pae6W-ENcAjWp51RRNQkzddj4hJ4477VSe2Prt+SKIUABUYNfGDnS2FwSDTBAUNQy2zbNgxyM6gAojYcMI1ALAbFstbdMjFQMOIxlQNjuMer8yPfKglW4NkdNQNDD7GiILDM38hoitkiUkPiAQKGzkoEv4ovQ3iSNizqxhgaaXC4D0yO0gr+AAIwsgt9XLfShjU-DnC7ozSC4L4AAM-hJrIUBYzYkDbDILOGiwXM8-89h2AL67C4EMti+rYEAEw6+5i0NU1eiGzjxsQKbUUW9bMSc9ztv2yU2NO-YIiu97wC+xW-tqyRGvAAAzOHdVLY1YVGwjidM1bf5p8nNtEZnVOO0TLu8wXRduvipcqOXAAs1eR-rzUNybUDxmbuCp+73MtxnDs533AOMJN6DeQgIi2vS3jI6jH5g4UPrQLrtfR+F3ytTF3y3aKCXrslk9641AVBZoudhY-UiaEjKURohRMyzF9CWSMLsUwRFFDiGENsBA5ogS4BgEZKQaoibOAJusbIwgQTjAAO6EG8NkPBaCgFmmuIYQWpAKCPSYLgEAdAODREISQwg5hWZQG7MAKgcBeDOCrAAQlEZQ3svYqx4JiGaQg5YqDbCuBYLAOBsHbCgFIqsGjgAxGIO5O4xpugrHELgjY3hVHqMJtsGIYA4DsXYssck3gFAywQUgtAqCDE7AVM4QgcMICDxIJY3hwYXCiICUgCAoSqz8MEbwEW5J3HfHkfgI+iQWRJO+JwWsvRBHdkdLxHAiZRZQFyQ6MBdF3IsgpuwFWBRvjg2hl0EiD0aAXiEFJSQ0gRB4jZpfHJNTLTAF6HoGQulbBlIqQgFklsynNM6LSX49CuliB6TIfpF9yQVLGZGMp4gVHODtrMwwlBAkxE4CQJyQIADUtzYkPj2YwHAUSIAZkllWcJzhnlWPnvuLR-ZRFSCqfRR5j4saiHxpCF0dp9B4AgMQaJjpxzfPyRoBwvj4WiLUfPeM4LPxwoMHYqguA9A-IKZi3Yri-qmkpUUuKJT4xlIfIHcW1h6nQDRXoSMfz4y+HxX8ccOppzQudLwSMKQHR6VRZCClGKGXYtxYmAlj4iVLzAKS8l6LClYr0DSuadKFV6oTMy8cbKHwgtMjUnABBfIsvxBylWQI5W-LUSUm2gLKnWuAKqppWcoUkh4M6DEIBpW2HHOqklZLnAADkOkMHlbq6lBrHxWvATaqAdSGnjh1VSxleKHX9IgJyoVn482KsOrcnAzyi3JMUP6tQIhD5GXSSrJFmKXWGnGd2AA5E4BY5I0X0pNTiplqrvnAsIKC9yfqMnEs1TGiterU3fGLaW3hD4dQAAkeAiA9GAdimKEDeTwCAR0XA4wMAcYwFRytcA0C5cAftR9Hhiv0NAIlkaFTRvJfGiIcAk35v0N4Vdw813kniUI+duA3GgwhsjC4XoYLdugHvJaWaHFIGdIaSMPj8Y2NrLQMNhyBAsGIUPD9MHZYtKiuRewUI8PuWRl0Sq9HoCCXhlcYAzg9yFHVYUboS91i4HxTEFCaEMJMfAv02NgSaOdDtJobDvxjDSf6cAaTLGlNwz+HJ6J-S3ksagwov4yBD2PF4zEfjCpBPLGE6J7wMQb5RzCmpuAPjoj6YgBBKGl9EEWi8bwHxU8TDSa84EkqEn0IKjCx59ycDnCafi4XRjKXohvOyN58hUAXPTxju5zzUBvM8PJIs1pKhficPI4QLZgzyk1MPWTOABDCBEJqyyZLPjGlZqOWk2sRKxU+LRP4wJoGy2Sm+d0EkTXHQeHdfPYQ6ypAyHjOQCgs37AvNeVQAQc7aDdi4CCOtlq5W1AwVwLBhHnCbYYJYqRhplgzcZcq+hgrN2Sluy820LBmu+CJZ81lTquVyrlDEWocobu-bm3Ae7-ZpuQkGwt+Mj13uRuh1tlkX3-v0kB+yktzqPvfC+yyJbMZekOu+Ad7gx2qxspSXw9yCT7YQyWW08z3GrM2cSHZyADmxN5brgbQr7kIvRIggMlwVYSfK1yxHL+d8RfADFz5lxcH5D9b5uknAIW9YiIfETyU9h8As1pZapOsIzdzUN4az8bdYSay+rb8WVvvhO5d6yp+kpe3G70YvFuy8PYt17fIE+GvzS4A4BAS5LBiBJbAifIAA

// https://www.typescriptlang.org/play/?#code/FAegVKIAQKIB4EMC2AHANgUygVwM4IHMNgAXATxS3mXQwBUKsBeKAb2Ck6hI1xIEYAXGw5cxAO2QZhfAE4BLcQQDcosZxQB7PrmEBtALpqoAX2MlNAE23D26rgGNN4ni5kkFS1fc7Xx0qAAjTU1MBHFvHyckJAwXXSg5RQJDSPsePgAmW2MfKCcXOJJ3TxVcny0dfVZueRJMYQByAAsEVsbTABooRoB+RqM8szETVOM8DFkcvMlYkuS09UIA8WwkQMnFk1Vt4FJGKABBNDQABQQSZtwoFnPL3EPZWQQyAB5qVEwGSgA+ZSgQNBjmgoJVcPJAphQRcrvtKEcTndmgBlDzJa63GGo0qvYFI3A-SBQAB6vT2gKgdF4JGSwAKfG41KRwjxWLRSgxUAARBZrLg9AAGAwAOmisXigoMXP+FLozXk11wzU02DQliCWAAbgg0PJLETyPDWZdseibtyMgIuVAAD4Wqzaa12rkTWROi3U-jC2YYd08z3CyokXDugAGvO0egAJKxVutJiYDKHbVBww7+TG4xtZInRc5XCRk3a03zo7G1tnc34MEXUxGM+X4zmRWKirhayXI5mKwmW5oYm2y1nex360Oe83hZbMqP0+Om7np4HtMHZ6XuwuRUuCgW113G5Wt9TMsudMKBXuG8PJ0ug7hz1O6phL-PD1Pj6fg8L+LWXbhJt6Uh+q6wrLFywBgCAoBgIaWAAGo6tgGCHCQSKvAAkjwSDdEiPzmkiUAYHAriWNcoYxooABmkxHE8mEYEgADSGBkIRxFxKRohJEoowUeI1GyFA6HiJYRFsSR1zXomfECVAABKx4mKGoi9LRsj0UxLHiRx1wANYsZolFCVhxiqcJolwNpIl6QZRkaXojzqVhzFkIM6iqQpWRWaR3LgXkZlYQ5dHOSxBh6OZRFufYwgIWgSEoWh9mORpLlhRFcAGN0nkkJkhLRVA-iapMxjCOl3k2WQhnGQx5Qece5W+eUnABQx4UiZFTVQMIhXFflPWyKIwgEUREmpjJNEuSYwrjYJ2VKaZUAuQ1+mVXZJn2HVDIjTpjX+dVSB6KlnUxYhyGoTCGGBalWXUnl6hDTCJVQMN7HWVAK1VRptX7XoSJRVw3UYEVsiqESzQkCQKC6ICADucNTowuAOAoKD1OEBDCposgECA6AvCAADETiiSAADCAAsdAwwAIgQKAEAAQocpMEHQBDIjDAAyACaADyhwEIEJCHJqABihwAF64HJhy8zDAASACymiHJRjEAIoEHBZDq6TivoQArBQCAMwA7KLBAAOIwwQMAAHKk+IsgAMyZHQjGaOrhxIDAhyW9zABSpMwDA6uW+ThwAKqnA76sq+rcow9g6GW6LmSHIcnMABqHAzEeMQQ1Pk5ovPc-wAuHKc3MM6L4cq6TijyJbkeHB7DOMYcduaAzlgdwzADUjGiwAnAAjrzBDc378gELLABWeqUXBcD8HQckM9TdD8HbAukwbjHBzD5MM1numHBgumc7IWfy9zKBTwzCCh3JDic2gKC88i2C6abyKapzKAO65wAFrq2aA4P2dsYCK1JqPDAJBsAM1JjDZowDGKZAlgzMgzsSByUYuIZoxwHCW1nhgOCKtGIoIwBHZE1MYDOztpzBAUt5YwGRBAgOyJMgAHVeY12phgBmwD0K83FocBAmt1YIHQlnKkyJmianJgXQ4gR+CkwYAQSOM8-YkCzvIOAcBRYMznqcA2uBZDk3EJoGAjFTjU2cDAbmshcC6WVCQUmwDyaUXJorNAGdOYADZ+4OBgOzeW6sAC0cBKLy1NsAhAckDaPEsNw0mATJYB05qLJApMJZx1NpkOSZAYYy00A7bmjtKIwHQgzSiaB1aBADtw7hMMHACgCeA3SESs4G1Sc0RWpt1bKzgEgbmWdgF2wQIEaZmgInc1FnfDAdtqZoEjgzdWvNxCHFFs0dWWdtDq3kMPLOGyED8CGe3cmlsQ7nM5s0JRdAYBygjnPbA99R5ZynsA7hw8A4M0VgKSO1Ms4wAwAADkOLpUmDNzHoUOHJTmltqZIAlnAdh4hObk2dnncQ8h5Dk2wOIS2PcwV20YpReQoSHDiF5pRAg8hFZyRRDAMFYKGaZGRKgb5KtDjUwzrpSiEs6GBE0cAuevL0JFSzmChAmRxCajnpbAJo8kABNdhLEgvMDboQwM7PVGyIm6VOC0khYK5LUztvs2Q-sCAEICaceQYLLC8wwKLAJ8s-bHIQEbZo7s47O0ouhU4YLvFyQlpzPglFAgRPJtzXS2B-byzIJkJCuAGZ0GppqeWEt9LIjniQWhpMBS4FwC3Zm6F1ZMwqabU45jOZv37gE9CjFNS4HpgE+Qkc4BzwIA4AJkhj4wyQAzS2ViBQMwFLITQAChlh1lvLBA1NGL92FrnD51NcCi3VjAWBG6l2W35ZqbmtCEXggQKbS2F9NAkHEGC3mwDR4MwcduggnMbaHADtgKOSBuEOCxbgAOzRqbJxhhe+QPNFZICBerRJztR6ZGEnBWedBTj901BLAOvMA66SQJqAOKA4CMRw8A6mD7uHoUVtzd+jE4L1KQMAzU8gkDL0jrpUWlBI6k0tsAlAYLAikxIAbWQqw5IB3EEgfu8tgGXHoIxdCKB1anDknPJWCA4D917cvSE8hEmyAlv3VOATdKZFOOTAUyJuNgsjlnOSXs56MV5uTSOtLsB0F0ocg2IKGaBDBZqJAvNI7k0NVuxinHsAIDgrpFuEW0DMeRPwLOlsIlZMebgLODNZBwWAXQM4XSCDAINs0SOshdJ8v4JYLp8t+C8ORLpUecEo7iHJhJ5EAolktICRE0WAcs6sbQHBGASAInUyy-UxWkdulwEjnbMg3CMCQlOKbJAnM7a20VqLO26t5YxOWYxBAkcA7oSQLIeB-cum4GARLbhgySA5uHqJu2cE4Jz37pRJA3a4JXewAV6OClLAEH4LgDNATI4BoIP3OCckEDD37vIOemo7YGzgrzGAFq2PIhgLIJApteb8EBczGGosYAHa9nJzIosYa0LoDvOCDN+CK23YcAUDXUICnJhLH2o8LYwxQBE+W1Nh5z3JuhOCmRdYCn4JHOCpMIUMyQPIZ2RdsDdwDmL2WyIFkleRGQCXAdNDyGQV+sg-dOa8AibzBAdAS6K0OByuAs8YCEIFgB6m-dN3Hsttw3SztAgOFM7gRinNW0BJVnPTQBAUQhEu9TXmDhqYSxgE+hAlgA7q2oehbm1Nz0EFJp3HeY9MOm3ELgClrmCDC+aKbUeltLbywCeS3mEskMvNJnBJt3NKKagcGC3A5nGIG05oxbAlFOaj2djDQ48sUAb3EHL3AmpxAOHlhTqflgNlZ1OAE0WjzdK4H9plhwaBs7D0sMWqe1NFZ0AcAzu2PdRbOzoBE3A6t0JSYcJ952Znh7FO4dgcmpxnY4JFY+cs5eYKs4BTgHByNyY0BZBBV+5nZ+IZdNR+4-YEBNQglUDeVTMhs4Jy5eYwU54J9ZBThNRI4wUSAa0A4MAX9NQs4HAs5+AmF+5MhcBTZyZgEs5NRZk08JZh5K8CBuEbdO4CAIlmhLA7Z9EwVRZyZLAyAs4XYakv0X0A55B0JAhqZdIYYGYFZAhnZZA0Aj0YZTNKJkQjM7ZNQCB0IBRTFLA55gEWY54GZOZ+4s5FZMgAlt06BEU6AWlqZTYAk4A0AoUF1QVWh7lqYBRkEC5TZ4UL8SEJ4GYDd4VvMJYUAxNMMDZuZI4DZK1uY4JnYhC6BDhuFRZZBMhAd9cCALtRkbcBQ45KBmgGYAluZ1ZRYBRuZNAwV+4YBLAwUKZ2juZMg4JmgkVuEyB5ZJ55YMA5IgdHhRZR4A40s704AIFTYJZuZMJOYCADEjFxB6FAdLBKA4ALESBAgNcrNMg1N5A0BnZL0Y5QkA5DhiI49mhg0IEYYA5Q5ThLZNRdQqkUBJ0w9xBnZ5AHBgEYB+BMM0As4yBv9kR1ZI4SA4AE4BQz4W1RkI55A6AwV41GIdNI5UUEBSYl9LZ+ANYBQedKdR5dI4AGZR4RVLZMJh5MhdIGZThGIvcDZAFh44hfkq9WYCACAyBI5xAl1GJT8wVgFmg4IYY0AEA7YJ8YYmTjFLFLZeYBQc4mT0tuEJEyAM49hYIoAF1cB7ESAXJLoGI8IWANIGpyJWAqIJoWIpoZp5JqR5pmo2A3S+BhBsp-gXJhAlphguoCogZNg4QsATSMsEAHB9ISB0pLSkBrT9o7TXTTgTsKVLJtprIuJ2QCBeIHT+IaIypsyfIpIDBXTsoGpuJ8zlJPS7B1BspfTqQ7TppCzZJspuE6hlRsASAzSlIoBNoSAuzLgVQ+zr0Qy-Tyh0pSp2o4BFhOB0yMBMyhoMz9EthBpQzgZVAjTYokIsF4APAYyeBLBozYz4EEzRANJOhRBDzngHATyGoagmzEg8z-gZyCoJx-glyVzXzSguhgBky7zjyMBLA9AuQfz9EuQDBlpbJ9oVJYBiJ7yTzwLspoKGouQ-IuAWoDpgKHzQLwLIK4BoKYLSzrgAAKR0wSSOAASkMG+i5EjiwrEGEACSej3METIESkCjwpQogrXOIoMEykQqPPwrAq5DQoMDumEANlBgpF3NOgPKQpAssDNItKJE4GvI0pEuQtAqfO9OKD-IWEWhYnmCUAAopCAuUrEvApcnQrIvejgq+gpE9N4oIokupHsteh8kwu0s9PsjcvErsqEr8pDKjPvLjITMCtspYmgrwgcqospAZlCs9LoAZn0pfJrPfLnO6i-OegErMoIFMBSuwqgA4qUtEpPLPMirnMTL0Giq5GCuErSsJBcp8GEH4BKpOjik4u4tagaqau6AasktaugE4GEHJlBgUp6oqt0tUuvXUs0qwhvM4ECoyupEKv9NMqMvMpMBvKssqvcuCtgtWngtcusr4skowuYsHJ+gGtipCpYuNIQDTQiovNquGs8qkoakSuymSo2gMvSocufI2p2pUCEhys-KbG-IKrBuKr2j+sIoEq8tGg+jWhqjyE9PKq4ouk6nsHskRv4uXKgqEpWsxrEFDDLEJvSmguklYEJsko9PJqgDujyGEC5EyBuqeq5H4C5pDOxr6twouqOoeuEs+r4Dis3MmsNIOAFoumvOehhGTJelRqcvWluvsj+k3JNLUpYleFwh+qLMEgzQWgzXWp9LBq2rIEKvhvcjKsUrIECt1reAVozVZoBigEyCenCpjJqosn1qVsNtkjSu+jSvNsMqyohoslyuhvyuJrgBtuDIBrDopGxsCuqvev9tdoZndqes6vymdimoOCpFQHNAbPrCECgD0GMAbLEB3CKE2vKGrGEGCFCAwHCAXPyH7HFGDEKrGHSGPGmCiHzAbsts6jvGqFqHqACC5HCIQGtD2u5F6Ggs7t2BGDJs4FrscBHrcDHvsGbqCBCDCAiHKFbHiD7oME7unCHvsHrt3qyvHpXASD0BqBpGnvZrnoXu6C5GXsvvKDXq4D2tED-s4HrGyBEDEEwBLWcGfvKC3rrp3ojrfM6gPtbuPs7s4DPt7rBv7p8GvogcxrvqQdKAwa4AnqrtfqfBns-q6CXpXs6gAfXrgc6iIcbryFQaPvbpPryCwYSBrNwYHqyBvuHsKHvuQfJvIZfqnoaG5BocXp-voaGFXo3qgBAdMEiGT0sBOxLWEbkAwHgTYccDqGtr3u3sJQ8BMYfs4F2F2CNK3nNDlsuFeBLpQG-rAeFCgdwBga5D+G0tJAjMpGdgcYdrQhcbcfTBPE8ZgclB8dUDav8YCboEyGCZmpxqcbCe5Bid8fibJDsfJhSf3LSeaGcYYlcftD5Eid4C8eL0lCybibGpJFyeLoNgKd6ougyZ5AiY8aqeiaFDzFEZIFib8bJEgmACAA

type PathCollectionToString<T extends any[]> = T extends [
  infer Head,
  ...infer Tail,
]
  ? Head extends string
    ? Tail extends []
      ? `${Head}`
      : Tail[0] extends number
        ? `${Head}[${Tail[0]}]${Tail extends [number, ...infer Rest]
            ? Rest extends []
              ? ""
              : `.${PathCollectionToString<Rest>}`
            : ""}`
        : `${Head}.${PathCollectionToString<Tail>}`
    : Head extends number
      ? Tail extends []
        ? `[${Head}]`
        : `[${Head}]${PathCollectionToString<Tail>}`
      : never
  : "";

// To work on -> https://www.typescriptlang.org/play/?#code/C4TwDgpgBAShYBsCGBjCAhATqg1hYAzgOoCWwAFgCID2hAPAApIUB8UAvAFBRRMVQQAHsAgA7ACYEoAAwAkAbxKiAZhEy9MEZSUEBfANoKlq9QEkJQ3QF0jKtVADKAV2Xa907jygB+GQoaabroKnl5e5uJCAsJiklAARPE+fvIRltJQAFwyAHQKae6hUMHycIioGNgoeISkFDT0zq46LLoeYdl85ADcnJygkFAAKhyw8MhoWLj4xGRUtAR0AOQEq-pWSyycAPTbXgB63v3g0EMATKNlE5XTtXMNiytrAMwbW7sHR30D0AEkALZkEgAN2g7CgBGAmCUAHMoAAfKCiJz-ABG9kRqOo1AQECQogRSKcCAQhKcFm0ogg4l6PygAEFMNgQF1FqYRP82OD2RB-tERBIpAAKYz2ACqAEp1p5fPpkWi1AAaKA5VWsgDCONxKGAJGoojoYpYVk82SpoMwvQ+EAICCUwAAtOISAQkKjcQ6qcIHXaqVAAAI-AgoaFgR0233AbaiagOoSIEgoMgO-EgY6DADyqIAVhAday6DzOaMi-zYlI4ChqJhxIxMNRIJhQABpCAgZWprY8XzyKD6VsgKBKKB4EDUZRQItWbL9ttWQmz9sqtXMcgETUkvO6-WFjmLqzG4r6Ufjycck08M0QC20k68VfrrVbvUGotcs+8suCjQAoGgmV9heWQfnyQgCnE0phL4paIoyzIFm+RTZFmub5g+u68iwVp7GKup2qAUB0sA1BQFWogoMwYiUVAYAPkOojEVASAQrCuIQlCsLpr8D4OBxogwiQ2jUhh-zKrxSBNgEWg6KMiTvqWYHln2niiuoA6Kp4qo5KpYyQhpQG+AOX5xJC0L8UUvhwJCxlSJBYTJHI8jiZJgQyQAZOxZkwiUA5tEUl4pM5wBSW4UAeaZsI+W2JSsrxXmCSQwlWcAyrxDk8StO0XjZEZinfo5OkFDZRIKpgfn2ckyXFXZFW+NIhipBYehWFlFXZPV+RNdYeTyLFfECUJtbJZl-nAeaaimki14TTwt6DJQEDwAWQzvn18WDYwD4btq24GitWHfHeQzPKMGpPjqL50L2qwEDO8gIJkAAMujKgAjMqZzKq8xTvHsPCHFxwwACyjAtS3oddqwzo9b0fV9866L9nx9EUHwjHlEE6QAEni4jKlpOlDEgJAIEBPAfFBUA40g4jFRF5lhBTFXJETJPVWTUBM7VKTU+I5VeFz9nZKzpIY7ZjnyuiZXSPjqo6clHOC1BqN-czYSIo5vMGDYpQ2sA7PJEsSzAdIPVdNtz76kM1BxbCdDDW0-Pk6ras8BrChaw1Iv6I9VjWAoVVi4BhvG+1ZurhbF1Wzb-X23rmVO5zLuu+78iezrgcxN+6whyb4cUJHu3W7b-Fx5CCf+BH51FzHXll8AI2M8naup57Cje77-u69ZQc574Rt55XBfVy+xexw70gxVXm5R6IY91xPKtC1NFpLx0K8zQLydXjegPmyP0clzCdDo1ncSpus76n+BtkqXY6i8xpPAE-fwzEwg+kAbzdP9RZb9s73Dm3Yea40TgFDu84g70zhIiSWm9uYi2qhLFEUs2iy20q-BWo1Kaa1AV7d+Ps-YZz1gbXwiRB69WnjtUetc7YTzAcvXBNMDDtwIZ3HW+8Z41yPifd+jdmbtQ9nglqSEN6YEmuNS0h1BicOoYffqZwT5ck4NfJS+hsa40VC-Ew-9SZf1xj-Lyf9EGANGnVIRzDWrZV0YQ4qcDxFq3MWnPBrCSaEK7iYs+tl7HoPlnrIBzNLIkNMa7eyZD4jYIEbkIe5BC40KPooxeoSAqJAYQFJhfN86xIPnPWh-FFEi34QFb+Qd7FmN0ezSJdUGpaxEWrdqNTQEcKoZbXJCTeEkyKdYyRk1Ei9BRmjEhFECA2kBkMcZ4zTpbRyVdCEUM+z3UyPIXQL0oDvSgJ9KA31EY7FVgDOkQwAD6owJmTI+PoeIN14jzkRBcq56CL5WBuX2S5qx4ipUetchcryCDvISJ81KCAvm3J+X8+Ir1gUvPuQkM4kK7lvNSs8a5Yy9aPSmcPLh8TY7DFOVhZJFUPigt2cjA5etXrouyZi+Rdd4W-IPN0fF9lCVXOJf9I4pLIQXHBLI1p887a0r+VpR59LmbMrWFYCJTN9lHT1idblLTZ58tLgKj51y8XJLFQQQhkq9nsplZCEG8qMVyLabHFV-ywVApFQSvYPzCE5CBayqA0rBhDD1gAVgpXE6l-LQWpQhda0Jmr9CvQlU6l1pw9YADYvU5KVcfc18RYWBtdsGs4YapV6tdXrAA7LGqlpqaV+oSEilNatg2vB1cjFGNaa10iuBUKY1QZh1HmPQLoyieBdGKgVV+IUdAsMUK-AoXcdJNCCFYpx-a9A9RHQHcYjaqg1FmPUBYdBx0tETp0Vc2FCJ3gbZMJdLb7hro7RwJ13ag69p0dOwdhUuo6zHS4CdTrgGOVvZ1SIghiqJFfWElII6PBK2sabT96QSgHpuM2u4q7GjPs3UB7e94KBzWgAAcXwAANSQAgJwGAQANAcPANQlFxBdDoJ4IsT9kPkEMbCDSq1Vw9tsDo3yPU-GQn5oZNsxUTwTiLH-DDwBsO4fw+Ros+5lTDVEblLxKR7EMOghyYqIpX6Shqv+oTIm8PoBZKuQ0Un46RJ3vA7p00HHAUvXJvjIE-4Sa6Bzbd-Ar0KAU1Y4BCk5OqZ0epgJwCxTGbEaNEzUjtgACowvcDCwGIQSB-iIAgFFqLMhpDSEIMlj4ABRQQcWEtQGoDmLce7IDJftGoZQFQoDZdy2xeQyWeBkF5LdKAdWoDRbCMRcQ1Bmu9hEMIbI0CjxWF6G1rw2sRvRd0El0bgzrLDNGaNjlwByXgi0zhnTemKB0Gq-F3EqVGv-C1b7DKDKsuCEgDqak2RevUC6z1wiYEBv9SG8UZLS2uVQDW6J3T5GdsJf2xyI7Vgcide6ydpOVXztbiuy1h7-XPKwiG29-VwA5Wfaw+tsT+m-t7YSAdoHIPbvde1Xis7F2RDiGu3D4AT2vKvcWyjw16PhOY5+9jnLu2IAA6a4Tu7JPTt7Gy+TmHkioCqeBDhkgtNaIUAlMl1L7QwvbE4PGas+s6RfY2+RyjHJqNWZvgj-iDHRia-w4R4j2AKfid12Mcoh7bgrrbYsDtB0xmTNWxj77m3yCzJundB6z1YYbPhsUVKN19BAwlSwIAA
