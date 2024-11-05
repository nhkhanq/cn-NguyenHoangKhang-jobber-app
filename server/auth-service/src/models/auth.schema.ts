import { sequelize } from '@auth/database'
import { IAuthDocument } from '@tanlan/jobber-shared'
import { compare, hash } from 'bcryptjs'
import { DataTypes, DATE, Model, ModelDefined, Optional } from 'sequelize'

const COUNT_HASH = 15

interface AuthModelInstanceMethods extends Model {
    prototype: {
      comparePassword: (password: string, hashedPassword: string) => Promise<boolean>
      hashPassword: (password: string) => Promise<string>
    }
  }
  
  type AuthUserCreationAttributes = Optional<IAuthDocument, 'id' | 'createdAt' | 'passwordResetToken' | 'passwordResetExpires'>
  
  const AuthModel: ModelDefined<IAuthDocument, AuthUserCreationAttributes> & AuthModelInstanceMethods = sequelize.define('auths', {
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profilePublicId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: false
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    browserName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deviceType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    otp: {
      type: DataTypes.STRING
    },
    otpExpiration: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date()
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Date.now
    },
    passwordResetToken: { type: DataTypes.STRING, allowNull: true },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date()
    }
  }) as ModelDefined<IAuthDocument, AuthUserCreationAttributes> & AuthModelInstanceMethods
  
  AuthModel.addHook('beforeCreate', async (auth: Model) => {
    const hashedPassword: string = await hash(auth.dataValues.password as string, COUNT_HASH)
    auth.dataValues.password = hashedPassword
  })
  
  AuthModel.prototype.comparePassword = async function (password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword)
  }
  
  AuthModel.prototype.hashPassword = async function (password: string): Promise<string> {
    return hash(password, COUNT_HASH)
  }
  
  AuthModel.sync({})
  export { AuthModel }