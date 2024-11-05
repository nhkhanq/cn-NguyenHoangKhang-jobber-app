import { sequelize } from '@auth/database'
import { IAuthDocument } from '@tanlan/jobber-shared'
import { date } from 'joi'
import { DataTypes, DATE, ModelDefined, Optional } from 'sequelize'
import { toDefaultValue } from 'sequelize/types/utils'

type AuthUserCreateAttributes = Optional <IAuthDocument, 'id' | 'createdAt' | 'passwordResetToken' | 'passwordResetExpires'>

const AuthModel: ModelDefined<IAuthDocument, AuthUserCreateAttributes> = sequelize.define('auth', {
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
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Date.now
    },
    passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date()
    }
})