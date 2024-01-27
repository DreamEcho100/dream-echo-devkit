// https://www.w3.org/WAI/tutorials/forms/

const defaultGetErrorLabelWAIAriaLive = 'assertive';

/**
 * @param {{ controlId: string; 'aria-live'?: 'off' | 'polite' | 'assertive' }} params - Properties for generating error label attributes.
 */
export function getErrorLabelWAI(params) {
	/**
	 * @type {{ id: string; role: "alert"; 'aria-live': 'off' | 'polite' | 'assertive'; href: string; }}
	 */
	const attributes = {
		id: `${params.controlId}-error`,
		role: 'alert',
		'aria-live': params['aria-live'] ?? defaultGetErrorLabelWAIAriaLive,
		href: `#${params.controlId}`,
	};

	return attributes;
}

/**
 * @param {{ id: string; title?: string; labelById?: string | true; required?: boolean; isError?: boolean; descriptionById?: string | true; placeholder?: string; }} params - Properties for generating control attributes.
 */
export function getControlWAI(params) {
	/**
	 * @type {{ title?: string; 'aria-label'?: string; 'aria-labelledby'?: string; 'required'?: boolean; 'aria-required'?: boolean; 'placeholder'?: string; 'aria-placeholder'?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string; }} - Object containing control attributes.
	 */
	const attributes = {
		title: params.title,
		'aria-label': params.title,
		'aria-placeholder': params.placeholder,
		placeholder: params.placeholder,
		'aria-labelledby':
			typeof params.labelById === 'boolean'
				? `${params.id}-label`
				: params.labelById,
		required: params.required,
		'aria-required': params.required,
		'aria-describedby':
			typeof params.descriptionById === 'boolean'
				? `${params.id}-description`
				: params.descriptionById,
	};

	if (params.isError) {
		attributes['aria-describedby'] = attributes['aria-describedby']
			? `${attributes['aria-describedby']} ${params.id}-error`
			: `${params.id}-error`;

		attributes['aria-invalid'] = true;
	}

	return attributes;
}

/**
 * @param {{ controlId: string; 'aria-live'?: 'off' | 'polite' | 'assertive' }} params
 */
export function getGroupWAI(params) {
	return {
		'aria-labelledby': `${params.controlId}-label`,
		role: 'group',
		tabindex: '0',
	};
}

// export default {
// 	getErrorLabel: getErrorLabelWAI,
// 	getControl: getControlWAI,
// 	getGroup: getGroupWAI,
// };
