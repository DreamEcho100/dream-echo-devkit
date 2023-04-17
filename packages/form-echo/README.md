# Typed Form Library

Priority is high starting 0

## In Progress, priority 0

- [] Remove the `event.preventDefault()`, and add the ability to use uncontrolled fields and validate them on submit.

## TODO, priority 1

- [] On <packages/form-echo/src/Example.tsx:43> abstract the `try/catch` on the `onChange` to a reusable function.
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

## ChatGPT 3.5v Suggestion `\\('-')/^

- Support for multi-step forms: Allows users to break down a long form into multiple steps or pages, making it easier to complete.
- Support for conditional fields: Enables users to show or hide certain fields based on the value of other fields, making the form more dynamic and personalized.
- Automatic field focus on validation error: When a validation error occurs, automatically scrolls the page to the field that needs attention, making it easier for users to correct the error.
- Integration with form submission APIs: Provides an easy way to submit form data to a backend API, reducing the amount of code required.
- Customizable form error messages: Allows users to customize the error messages that are displayed for each field validation error, making them more user-friendly and informative.
- Support for client-side field formatting: Automatically formats field input according to a specified format, such as phone numbers or credit card numbers, making it easier for users to enter the correct format.
- Support for field masking: Masks field input so that it appears as a certain format, such as masking a phone number as "(123) 456-7890", improving the user experience.
- Support for nested field values: Allows users to manage complex forms with nested fields or arrays of fields, making it easier to organize and manipulate the data.
- Support for dependent validation: Automatically validates fields based on their dependencies, reducing the amount of code required.
- Support for formatting on blur: Automatically formats field values on blur, making the form more user-friendly.
- Support for child functions: Provides support for child functions to allow users to easily render custom UI components based on form state, making the form more flexible and customizable.
- Tracking errors count for fields: Keeps track of the number of errors for each field, making it easier to highlight fields with multiple errors or display error messages.
- Adding a debounce feature for field values: Delays the execution of a function until a certain amount of time has passed since the last time it was called, improving the performance and user experience.
- Researching and adding more helper methods: Improves the library by researching and adding more helper methods for common form-related tasks, such as handling input masking or working with dates.
- Integration with popular form libraries: Allows users to easily integrate the library with popular form libraries like Formik or React Hook Form, reducing the amount of code required.
- Support for different types of inputs: Allows users to easily use different types of inputs like checkboxes, radio buttons, or select dropdowns, making the form more flexible and customizable.
- Conditional field rendering: Allows users to conditionally show or hide fields based on the values of other fields or other conditions, making the form more dynamic and personalized.
- Integration with form data validation libraries: Allows users to easily integrate with libraries that validate the entire form data, like Yup or Joi, reducing the amount of code required.
- Support for asynchronous validations: Allows users to validate fields asynchronously, for example, to check if a username is available, improving the performance and user experience.
- Support for form submission handling: Allows users to easily handle form submissions and display success or error messages, improving the user experience.
- Internationalization and localization support: Allows users to easily translate error messages and other UI elements for different languages and regions, making the form more accessible and user-friendly.

## Done

- [x] Adding `isTouched`, `isDirty`, `onMountValidate`, and `onBlurValidate` per Field.
- [x] There could be more than one error?
- [x] Support all errors access.
- [x] Tracking submit attempt count?
- [x] Fixing a performance issue <https://stackoverflow.com/a/72236411/13961420>

## General Outline

I'm building a library to manage forms in React.js, it's supposed to have the following features:

- A Headless UI.
- Easy field validations.
- field/s validation can be customized and working on different like on Blur, Change, Mount, and Submit.
- Tracking the field:

      - `isDirty`.
      - validation for the events `submit`, `change`, `mount`, and `blur` .while tracking their `passed` and `failed` validation attempts
      - `errors` in result of the validation.
      - field `metadata` like `id`, `name`, and `initialValue`.

- Can track validation history.
- Have some useful utilities like `reInitFieldsValues`, `setFieldValue`, and `setFieldErrors`.

## Bugs To Fox

```ts
const handleAllFieldsShapePartial = <TAllFields extends TAllFieldsShape>(
	fields: TAllFieldsShapePartial<TAllFields>,
): TAllFields => {
	const allFields = {} as TAllFields;

	for (const fieldName in fields) {
		/*
   const fieldName: Extract<keyof TAllFields, string>
   Type 'TAllFieldsShapePartial<TAllFields>[Extract<keyof TAllFields, string>] & { errors: []; isDirty: false; isTouched: false; }' is not assignable to type 'TAllFields[Extract<keyof TAllFields, string>]'.
   'TAllFieldsShapePartial<TAllFields>[Extract<keyof TAllFields, string>] & { errors: []; isDirty: false; isTouched: false; }' is assignable to the constraint of type 'TAllFields[Extract<keyof TAllFields, string>]', but 'TAllFields[Extract<keyof TAllFields, string>]' could be instantiated with a different subtype of constraint 'TFieldShape'.ts(2322)
  */
		allFields[fieldName] = {
			...fields[fieldName],
			errors: [],
			isDirty: false,
			isTouched: false,
		} as (typeof allFields)[typeof fieldName];
	}

	return allFields;
};
```
