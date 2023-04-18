# General Outline

A state management for forms value, validation, and errors, it's supposed to have the following features:

- A Headless UI.
- Easy field validations.
- field/s validation can be customized and working on different like on Blur, Change, Mount, and Submit.
- Tracking the field:

      - `isDirty`.
      - validation for the events `submit`, `change` .while tracking their `passed` and `failed` validation attempts.
      - `errors` resulted from the validation of fields.
      - field `metadata` like `id`, `name`, and `initialValue`.

- Can track validation history.
