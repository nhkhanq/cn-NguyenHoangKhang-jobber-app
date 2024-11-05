import Joi, { ObjectSchema } from "joi"

const loginSchema: ObjectSchema = Joi.object().keys({
  username: Joi.string().email().required().messages({
    'string.base': 'Email must be type string',
    'string.email': 'Invalid email',
    'string.empty': 'Email is required'
  }),
  password: Joi.string().min(8).max(20).required().messages({
    'string.base': 'User name must be type string',
    'string.min': 'Invalid username',
    'string.max': 'Invalid username',
    'string.empty': 'Username is required field'
    })
})

export { loginSchema }