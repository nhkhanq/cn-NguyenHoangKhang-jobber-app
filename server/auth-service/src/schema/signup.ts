import Joi, { ObjectSchema } from 'joi'

const signupSchema: ObjectSchema = Joi.object().keys({
    username: Joi.string().min(8).max(20).required().messages({
        'string.base': 'User name must be type string',
        'string.min': 'Invalid username',
        'string.max': 'Invalid username',
        'string.empty': 'Username is required field'
    }),
    password: Joi.string().min(8).max(20).required().messages({
        'string.base': 'User name must be type string',
        'string.min': 'Invalid username',
        'string.max': 'Invalid username',
        'string.empty': 'Username is required field'
    }),
    country: Joi.string().min(8).max(20).required().messages({
        'string.base': 'Country must be type string',
        'string.empty': 'Country is required field'
    }),
    email: Joi.string().min(8).max(20).required().messages({
        'string.base': 'Email name must be type string',
        'string.email': 'Invalid email',
        'string.empty': 'Username is required field'
    }),
    profilePicture: Joi.string().min(8).max(20).required().messages({
        'string.base': 'Add profile picture',
        'string.picture': 'Require a picture',
        'string.empty': 'Require a picture'
    }),
})

export { signupSchema }