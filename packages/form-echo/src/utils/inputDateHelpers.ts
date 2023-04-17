import { InputDateTypes } from '../types';

/**
 * Formats a date object to the desired string format based on the type.
 * @param {Date} date - The Date object to be formatted.
 * @param {string} type - The format type ('date', 'time', 'datetime-local', 'week', or 'month').
 * @returns {string} A formatted string based on the specified format.
 */
function formatDate(date: Date, type: InputDateTypes): string {
	// Initialize an empty string to hold the formatted date
	let formattedDate = '';

	// Use a switch statement to determine the appropriate formatting based on the `type` argument
	switch (type) {
		case 'date':
			// For the 'date' type, format the date as yyyy-mm-dd using toISOString and slice
			formattedDate = date.toISOString().slice(0, 10);
			break;
		case 'time':
			// For the 'time' type, format the time as hh:mm:ss using toTimeString and slice
			formattedDate = date.toTimeString().slice(0, 8);
			break;
		case 'datetime-local':
			// For the 'datetime-local' type, format the date and time as yyyy-mm-ddThh:mm:ss using toISOString, slice, and replace
			formattedDate = date.toISOString().slice(0, 16);
			formattedDate = formattedDate.replace('T', ' ');
			break;
		case 'week':
			// For the 'week' type, format the week as yyyy-Www using getWeekNumber and padStart
			const year = date.getFullYear();
			const weekNumber = getWeekNumber(date);
			formattedDate = `${year}-W${
				weekNumber.toString().length < 2
					? '0' + weekNumber.toString()
					: weekNumber.toString()
			}`;
			// weekNumber.toString().padStart(2, '0')
			break;
		case 'month':
			// For the 'month' type, format the month as yyyy-mm using toISOString and slice
			formattedDate = date.toISOString().slice(0, 7);
			break;
		default:
			// If the type is not recognized, return an empty string
			break;
	}

	// Return the formatted date
	return formattedDate;
}

/**
 * Parses a string in the specified format and returns a Date object.
 * @param {string} dateString - The string to be parsed.
 * @param {string} type - The format type ('date', 'time', 'datetime-local', 'week', or 'month').
 * @returns {Date} - The parsed Date object.
 */
function parseDate(dateString: string | number, type: InputDateTypes): Date {
	// Declare a variable to hold the parsed date
	let parsedDate: Date;

	// Use a switch statement to handle the various date/time formats
	switch (type) {
		case 'date':
			// For the 'date' type, parse the string as a date in ISO format (yyyy-mm-dd)
			parsedDate = new Date(dateString);
			break;
		case 'time':
			// For the 'time' type, split the string into hours, minutes, and seconds components
			const [hours, minutes, seconds] = dateString.toString().split(':');
			// Create a new Date object and set the hours, minutes, and seconds based on the input string
			parsedDate = new Date();
			parsedDate.setHours(Number(hours));
			parsedDate.setMinutes(Number(minutes));
			parsedDate.setSeconds(Number(seconds));
			break;
		case 'datetime-local':
			// For the 'datetime-local' type, replace the space character with 'T' and parse the resulting string as a date in ISO format
			parsedDate = new Date(dateString.toString().replace(' ', 'T'));
			break;
		case 'week':
			// For the 'week' type, split the string into year and week number components
			const [yearString, weekString] = dateString.toString().split('-W');
			const year = Number(yearString);
			const week = Number(weekString);
			// Use the getFirstDateOfWeek helper function to calculate the first date of the specified week in the specified year
			parsedDate = getFirstDateOfWeek(year, week);
			break;
		case 'month':
			// For the 'month' type, append '-01' to the input string to represent the first day of the month and parse as a date in ISO format
			parsedDate = new Date(dateString + '-01');
			break;
		default:
			// For an unrecognized format, return the current date/time
			parsedDate = new Date();
			break;
	}

	// Return the parsed Date object
	return parsedDate;
}

/**
 * Returns the week number of the year for a given date.
 * @param {Date} date - The date object for which to calculate the week number.
 * @returns {number} - The week number.
 */
function getWeekNumber(date: Date): number {
	// Get the date for the first day of the year
	const yearStart = new Date(date.getFullYear(), 0, 1);

	// Calculate the number of days since the start of the year until the given date
	const daysSinceYearStart =
		(date.valueOf() - yearStart.valueOf()) / (1000 * 60 * 60 * 24);

	// Calculate the week number by dividing the number of days by 7 and rounding down
	const weekNumber = Math.floor(daysSinceYearStart / 7) + 1;

	return weekNumber;
}

/**
 * Returns the first date (Monday) of a given week in a year.
 * @param {number} year - The year of the target week.
 * @param {number} week - The week number (1-53) of the desired week.
 * @returns {Date} - The first date (Monday) of the specified week.
 */
function getFirstDateOfWeek(year: number, week: number): Date {
	// Find the date of January 1st for the given year
	const januaryFirst = new Date(year, 0, 1);

	// Calculate the number of days until the first Monday of the year
	// 0 represents Sunday, 1 represents Monday, and so on
	const daysToFirstMonday = (8 - januaryFirst.getDay()) % 7;

	// Set the date object to the first Monday of the year
	const firstMonday = new Date(januaryFirst);
	firstMonday.setDate(januaryFirst.getDate() + daysToFirstMonday);

	// Calculate the number of days until the target Monday of the week
	const daysToTargetMonday = (week - 1) * 7;

	// Set the date object to the target Monday of the week
	const targetMonday = new Date(firstMonday);
	targetMonday.setDate(firstMonday.getDate() + daysToTargetMonday);

	return targetMonday;
}

/**
 * A collection of helper functions for working with input date values.
 * @namespace
 */
const inputDateHelpers = {
	/**
	 * Formats a date object to the desired string format based on the type.
	 * @param {Date} date - The Date object to be formatted.
	 * @param {string} type - The format type ('date', 'time', 'datetime-local', 'week', or 'month').
	 * @returns {string} A formatted string based on the specified format.
	 */
	formatDate,

	/**
	 * Parses a string in the specified format and returns a Date object.
	 * @param {string} dateString - The string to be parsed.
	 * @param {string} type - The format type ('date', 'time', 'datetime-local', 'week', or 'month').
	 * @returns {Date} - The parsed Date object.
	 */
	parseDate,

	/**
	 * Returns the week number of the year for a given date.
	 * @param {Date} date - The date object for which to calculate the week number.
	 * @returns {number} - The week number.
	 */
	getWeekNumber,

	/**
	 * Returns the first date (Monday) of a given week in a year.
	 * @param {number} year - The year of the target week.
	 * @param {number} week - The week number (1-53) of the desired week.
	 * @returns {Date} - The first date (Monday) of the specified week.
	 */
	getFirstDateOfWeek,
};

export default inputDateHelpers;
