import type {
  FieldError,
  FieldErrors,
  FieldValues,
  InternalFieldName,
  Ref,
  ResolverOptions,
  ResolverResult,
} from "react-hook-form";
import type { z, ZodError } from "zod";
import { appendErrors, get, set } from "react-hook-form";

const setCustomValidity = (
  ref: Ref,
  fieldPath: string,
  errors: FieldErrors,
) => {
  if (ref && "reportValidity" in ref) {
    const error = get(errors, fieldPath) as FieldError | undefined;
    ref.setCustomValidity(error?.message ?? "");

    ref.reportValidity();
  }
};

// Native validation (web only)
export const validateFieldsNatively = <TFieldValues extends FieldValues>(
  errors: FieldErrors,
  options: ResolverOptions<TFieldValues>,
): void => {
  for (const fieldPath in options.fields) {
    const field = options.fields[fieldPath];
    if (field && field.ref && "reportValidity" in field.ref) {
      setCustomValidity(field.ref, fieldPath, errors);
    } else if (field?.refs) {
      field.refs.forEach((ref: HTMLInputElement) =>
        setCustomValidity(ref, fieldPath, errors),
      );
    }
  }
};

export const toNestErrors = <TFieldValues extends FieldValues>(
  errors: FieldErrors,
  options: ResolverOptions<TFieldValues>,
): FieldErrors<TFieldValues> => {
  options.shouldUseNativeValidation && validateFieldsNatively(errors, options);

  const fieldErrors = {} as FieldErrors<TFieldValues>;
  for (const path in errors) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const field = get(options.fields, path);
    const error = Object.assign(errors[path] ?? {}, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      ref: field?.ref,
    });

    if (isNameInFieldArray(options.names ?? Object.keys(errors), path)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const fieldArrayErrors = Object.assign({}, get(fieldErrors, path));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      set(fieldArrayErrors, "root", error);
      set(fieldErrors, path, fieldArrayErrors);
    } else {
      set(fieldErrors, path, error);
    }
  }

  return fieldErrors;
};

const isNameInFieldArray = (
  names: InternalFieldName[],
  name: InternalFieldName,
) => names.some((n: string) => n.startsWith(name + "."));

export type Resolver = <T extends z.Schema<any, any>>(
  schema: T,
  schemaOptions?: Partial<z.ParseParams>,
  factoryOptions?: {
    /**
     * @default async
     */
    mode?: "async" | "sync";
    /**
     * Return the raw input values rather than the parsed values.
     * @default false
     */
    raw?: boolean;
  },
) => <TFieldValues extends FieldValues, TContext>(
  values: TFieldValues,
  context: TContext | undefined,
  options: ResolverOptions<TFieldValues>,
) => Promise<ResolverResult<TFieldValues>>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const isZodError = (error: any): error is ZodError => error.errors != null;

const parseErrorSchema = (
  zodErrors: z.ZodIssue[],
  validateAllFieldCriteria: boolean,
) => {
  const errors: Record<string, FieldError> = {};
  for (; zodErrors.length; ) {
    const error = zodErrors[0]!;
    const { code, message, path } = error;
    const _path = path.join(".");

    if (!errors[_path]) {
      if ("unionErrors" in error) {
        const unionError = error.unionErrors[0]!.errors[0];

        errors[_path] = {
          message: unionError!.message,
          type: unionError!.code,
        };
      } else {
        errors[_path] = { message, type: code };
      }
    }

    if ("unionErrors" in error) {
      error.unionErrors.forEach((unionError) =>
        unionError.errors.forEach((e) => zodErrors.push(e)),
      );
    }

    if (validateAllFieldCriteria) {
      const types = errors[_path]!.types;
      const messages = types && types[error.code];

      errors[_path] = appendErrors(
        _path,
        validateAllFieldCriteria,
        errors,
        code,
        messages
          ? ([] as string[]).concat(messages as string[], error.message)
          : error.message,
      ) as FieldError;
    }

    zodErrors.shift();
  }

  return errors;
};

export const zodResolver: Resolver =
  (schema, schemaOptions, resolverOptions = {}) =>
  async (values, _, options) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await schema[
        resolverOptions.mode === "sync" ? "parse" : "parseAsync"
      ](values, schemaOptions);

      options.shouldUseNativeValidation && validateFieldsNatively({}, options);

      return {
        errors: {} as FieldErrors,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        values: resolverOptions.raw ? values : data,
      };
    } catch (error: any) {
      if (isZodError(error)) {
        return {
          values: {},
          errors: toNestErrors(
            parseErrorSchema(
              error.errors,
              !options.shouldUseNativeValidation &&
                options.criteriaMode === "all",
            ),
            options,
          ),
        };
      }

      throw error;
    }
  };
