# \_

## In Progress, priority 0

- [] Remove the `event.preventDefault()`.

## TODO, priority 1

- [] On <packages/typed-form/src/Example.tsx:43> abstract the `try/catch` on the `onChange` to a reusable function.
- [] Adding the option to an all fields value validation on submit and if not it will validate with fields an validation if exist, _(Adding the option to do both)_.
- [] Adding the feature to have uncontrolled fields and validate them on submit, _(Throwing an error if the validation doesn't exist?)_.
- [] Adding the ability to listen/compare field/s with one another _(Dependent Validation)_.
- [] Adding an easier way to set the form field.
- [] Adding the ability to reset field/s.

## TODO, priority 2

- [] Adding `isValidating` and what is being validated?
- [] Adding a debounce feature for the fields values.
- [] Research and look if there any other helper methods to build for the form/input handling.
- [] Support Nested Field Values?
- [] Research and look at what is "child functions"
- [] Tracking errors count for field/s?
- [] Format on blur?

## Done

- [x] Adding `isTouched`, `isDirty`, `onMountValidate`, and `onBlurValidate` per Field.
- [x] There could be more than one error?
- [x] Support all errors access.
- [x] Tracking submit attempt count?
