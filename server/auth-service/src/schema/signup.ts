import Joi, { ObjectSchema } from 'joi'

const signupSchema: ObjectSchema = Joi.object().keys({
    username: Joi.string().min(4).max(20).required().messages({
        'string.base': 'User name must be type string',
        'string.min': 'Invalid username',
        'string.max': 'Invalid username',
        'string.empty': 'Username is required field'
    }),
    password: Joi.string().min(4).max(20).required().messages({
        'string.base': 'User name must be type string',
        'string.min': 'Invalid username',
        'string.max': 'Invalid username',
        'string.empty': 'Username is required field'
    }),
    country: Joi.string().min(1).max(25).required().messages({
        'string.base': 'Country must be type string',
        'string.empty': 'Country is required field'
    }),
    email: Joi.string().min(8).max(20).required().messages({
        'string.base': 'Email name must be type string',
        'string.email': 'Invalid email',
        'string.empty': 'Username is required field'
    }),
    profilePicture: Joi.string().required().messages({
      'string.base': 'Please add a profile picture',
      'string.email': 'Profile picture is required',
      'string.empty': 'Profile picture is required'
    }),
})

export { signupSchema }
