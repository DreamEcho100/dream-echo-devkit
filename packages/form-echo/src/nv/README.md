#

## General types

```ts
type InferValueByPath<Values, Path> = Path extends `${infer Key}.${infer Rest}`
 ? Key extends keyof Values
  ? InferValueByPath<Values[Key], Rest>
  : never
 : Path extends keyof Values
  ? Values[Path]
  : never;

// it should also work with arrays and tuples and objects
type InferItemPaths<Values> = {
 [key in keyof Values]: Values[key] extends object
  ? InferItemPaths<Values[key]>
  : key;
};

type FormStoreErrors<Resolvers> = {
 [key in keyof Resolvers]?: string | null;
};

/** @description - used to set the values of the form. */
type SetValue = <Values, Path extends InferItemPaths<Values>>(
 path: Path,
 value: unknown
) => void;
/** @description - used to get the values of the form. */
type GetValue = <Values, Path extends InferItemPaths<Values>>(
 path: Path
) => InferValueByPath<Values, Path>;

type ResolverBaseShape = {
 [key: string]: {
  rules: ResolverRules;
  handler: ResolverHandler;
 };
};

type ResolverHandlerParam<Values, Resolvers extends ResolverBaseShape, Path> = {
 /** @description - used to set the errors of the form, by passing the path _(separated by dotes)_ of the error which is the paths of the `resolvers`. */
 setErrors: (path: keyof Resolvers, message: string) => void;
 getValue: GetValue;
 /** @description - used to get the resolver of the form, by passing the path _(separated by dotes)_ of the resolver. */
 getResolver: <Path extends keyof Resolvers>(
  path: Path
 ) => Resolvers[Path]['handler'];
} & (InferValueByPath<Values, Path> extends infer Value
 ? Value extends never
  ? { name: never; value: never }
  : { name: Path; value: Value }
 : { name: never; value: never });

type ResolverHandlerResult<Value> = { value: Value } | { error: Error };

/** @description - used to handle the form validation. */
type ResolverHandler = <Values, Resolvers extends ResolverBaseShape, Path>(
 param: ResolverHandlerParam<Values, Resolvers, Path>
) => ResolverHandlerResult<InferValueByPath<Values, Path>>;

/**
 * @description - used to handle the form validation.
 * 
 * Will have properties that will be used to validate items on the form for fine grained control.
 */
interface ResolverRules {
 required?: boolean;
 min?: number;
 max?: number;
 pattern?: RegExp;
 minLength?: number;
 maxLength?: number;
 multiple?: boolean;
 step?: number;
}
 ```

### To be added to the type

- [ ] Focus state management on the form.

- [ ] Add a way to handle the form submission.

- [ ] Add a way to handle the form and form items ids, Like:
  - Generating ids for the form and form items with a base id that will be passed from the user and have utility functions to get the form id and form item id.

- [ ] Add a way to handle the form items with arrays and tuples types, Like:
  - Using the index of the array or tuple to get the value of the item or set the value of the item and provide utilities to manage the array or tuple items.

- [ ] Add a way to handle deeply nested forms and provide utilities to manage the deeply nested forms, Like:
  - Getting the value of the deeply nested form item or setting the value of the deeply nested form item.
  - Getting the resolver of the deeply nested form item or setting the resolver of the deeply nested form item.
  - Getting the error of the deeply nested form item or setting the error of the deeply nested form item.

- [ ] Add a way to handle the form items debouncing the form items value changes.
  - Debouncing is a technique in which, no matter how many times the user fires the event, the attached function will be executed only after the user has stopped firing the event for a specified amount of time.
  - Provide utilities to manage it Like:
    - Getting the debouncing time of the form item or setting the debouncing time of the form item.
    - Managing the debouncing time of the form item by setting the debouncing time of the form item and clearing the debouncing time of the form item.

- [ ] Add a way to handle the form items and throttling the form items value changes.
  - Throttling is a technique in which, no matter how many times the user fires the event, the attached function will be executed only once in a given time interval.
  - Provide utilities to manage it Like:
    - Getting the throttling time of the form item or setting the throttling time of the form item.
    - Managing the throttling time of the form item by setting the throttling time of the form item and clearing the throttling time of the form item.

## Goals for this custom lib

- [ ] a headless form library that can be used with any UI library.

- [ ] it will provide the logic for the form store, and the user will choose which store/state management solution to use for example `zustand` or `jotai`.

- [ ] will be able to handle form validation.

- [ ] will have `values`, `resolvers`, and `errors` as the main states of the form.

  - [ ] `values` will be the values of the form.

  - [ ] `resolvers` will be the values that are derived from the `values` of the form and could have a validation which will throw an error and it will have the type of `PassedResolver`.

  - [ ] `PassedResolver` items could be:

    - [ ] a function that will have a type of `ResolverHandler`
    - [ ] an object that have an object with items `handler` and `rules`.
      - [ ] `handler` will be a function that will have a type of `ResolverHandler`.
      - [ ] `rules` will have type `ResolverRules`.
  
    - [ ] a zod item, as long as the keys on the zod items is the same on the values, and it will be converted inside the store to a shape that can be used for resolver/validation.

  - [ ] `PassedResolver` could also be passed a zod schema, as long as the keys on the schema is the same on the values, and it will be converted inside the store to a shape that can be used for resolver/validation.
  
  - [ ] `PassedResolver` will be transformed internally to an object that have keys separated by dots, with values of type `Resolver`.

    - [ ] `Resolver` will be an object that will have a `handler` with type of `ResolverHandler`.
  
  - [ ] `errors` will be the errors of the form, and it will be an object with the same shape as the `resolvers`.

  - Other useful methods like `setValue`, `getValue`, `setErrors`, `getResolver` will be available to be used.

## Suggestion by copilot

- [ ] TypeScript types defined for this library seem well structured and cover most of the required use-cases. However, some considerations should be taken into account:

- [ ] Make sure there are types for handling arrays and tuples in the `InferValueByPath` and `InferItemPaths` types.

- [ ] Consider documenting each type and function with a brief explanation of its purpose and usage.

- [ ] Ensure proper handling and validation for different input types like Numbers, Booleans, Dates, and complex objects.

- [ ] Consider adding examples and tests to ensure everything works as expected.

- [ ] Consider adding types for the store/state management solution (e.g., zustand or jotai) that the user can choose from.

## Suggestions by <https://console.groq.com/playground>

SYSTEM
Enter a system message
USER
I'm still on the process of building this library from the following README.md, what do you think? **The above ^**

ASSISTANT
It seems like you are building a custom form library with the following features:

1. A headless form library that can be used with any UI library.
2. Provides the logic for the form store, and the user can choose which store/state management solution to use (e.g., `zustand` or `jotai`).
3. Handles form validation.
4. Has `values`, `resolvers`, and `errors` as the main states of the form.
    - `values`: the values of the form.
    - `resolvers`: the derived values from the `values` of the form and could have a validation that will throw an error. It will have the type of `PassedResolver`.
    - `errors`: the errors of the form and it will be an object with the same shape as the `resolvers`.

5. Useful methods like `setValue`, `getValue`, `setErrors`, `getResolver` will be available.

TypeScript types defined for this library seem well-structured and cover most of the required use-cases. However, some considerations should be taken into account:

1. Make sure there are types for handling arrays and tuples in the `InferValueByPath` and `InferItemPaths` types.
2. Consider documenting each type and function with a brief explanation of its purpose and usage.
3. Ensure proper handling and validation for different input types like Numbers, Booleans, Dates, and complex objects.
4. Consider adding examples and tests to ensure everything works as expected.
5. Consider adding types for the store/state management solution (e.g., zustand or jotai) that the user can choose from.

Overall, it looks like you are on the right track with this library, and it seems like it has the potential to be a robust and valuable form handling solution.

USER
What do you think I can add more to make a fully comprehensive form logic state solution?

ASSISTANT
Here are some suggestions for features you can add to make a fully comprehensive form logic state solution:

1. Support for file inputs and handling file uploads.
2. Nested forms support for handling forms with multiple sections or tabs.
3. Conditional fields visibility and validation based on user input or form state.
4. Automatic form serialization and deserialization for sending and retrieving form data from an API.
5. Form versioning and rollback to previous form state.
6. Asynchronous validation support for handling validation that might take some time (e.g., checking user input against a remote database).
7. Form customization and theming to match the user's branding and style.
8. Accessibility support for users who use assistive technologies (e.g., screen readers, keyboard navigation).
9. Form localization and internationalization support for handling forms in different languages and regions.
10. Custom events and callbacks for handling form events like form submission, validation errors, and field changes.
11. Support for handling form state with a middleware like Redux, allowing for better debugging and testing of the form state.
12. Auto-generated documentation for the form library, including usage examples and detailed descriptions of each type and function.

Implementing these features will make your form logic state solution comprehensive and robust, providing a better user experience and a more flexible solution for developers.

USER
Any other suggestion that you didn't mention and I didn't implement that could make it:

- A fully comprehensive form logic state.
- Loved by developers and have a good Developer experience.
- Can compete with other form state/logic managers currently available.
- Easier and simple to use.

ASSISTANT
Here are some additional suggestions that can help make your form logic state solution comprehensive, loved by developers, and competitive with other form state/logic managers:

1. Provide detailed and accurate documentation, with examples and code snippets that make it easy for developers to get started.
2. Offer an interactive playground or sandbox for developers to experiment with the form library and see its capabilities.
3. Offer a migration path for developers who are currently using other form state/logic managers, with a clear explanation of how to switch to your library.
4. Provide a set of pre-built form components that can be easily integrated into any project, reducing the amount of boilerplate code needed.
5. Offer a set of integrations or plugins for popular frameworks, libraries, and tools, making it easier for developers to use your form library with their existing tech stack.
6. Provide a set of best practices and guidelines for using the form library, helping developers avoid common pitfalls and mistakes.
7. Offer community support through forums, chat rooms, or social media, allowing developers to ask questions, share experiences, and provide feedback.
8. Provide a roadmap for future development, with a clear plan for adding new features, fixing bugs, and responding to user feedback.
9. Offer regular updates, maintenance, and bug fixes, ensuring that the form library remains up-to-date and compatible with the latest technology.
10. Encourage user contributions, feedback, and collaboration by providing a clear and transparent contribution guide.

By implementing these suggestions, you can make your form library comprehensive, loved by developers, and competitive with other form state/logic managers. Developers will appreciate a well-documented, easy-to-use, and flexible form library that meets their needs and provides a good developer experience.</s>
