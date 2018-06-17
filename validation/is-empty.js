    //custom function to turn the values 'null or undefined' into an empty string because Validator.isEmty only validates empty strings
    const isEmpty = value =>
        value === undefined ||
        value === null ||
        (typeof value === 'object' && Object.keys(value).length === 0) ||
        (typeof value === 'string' && value.trim().length === 0);

    module.exports = isEmpty;