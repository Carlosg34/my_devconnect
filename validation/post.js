const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePostInput(data) {
    let errors = {};

    //this turn the values 'null or undefined' into an empty string because 'Validator.isEmty' only validates empty strings
    data.text = !isEmpty(data.text) ? data.text : '';

    if (!Validator.isLength(data.text, {
            min: 10,
            max: 200
        })) {
        errors.text = 'Post must be between 10 and 200 characters';
    }

    if (Validator.isEmpty(data.text)) {
        errors.text = 'Text fiel is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};