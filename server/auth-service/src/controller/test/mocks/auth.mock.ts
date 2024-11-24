import { IAuthDocument, IAuthPayload } from 'jobber-shared-for-hkhanq'
import { Response } from 'express'

export const authMockRequest = (sessionData: IJWT, body: IAuthMock, currentUser?: IAuthPayload | null, params?: unknown) => ({
    session: sessionData,
    body,
    params,
    currentUser
  })
  
  export const authMockResponse = (): Response => {
    const res: Response = {} as Response
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
  }
  
  export interface IJWT {
    jwt?: string
  }
  
  export interface IAuthMock {
    id?: number
    username?: string
    email?: string
    password?: string
    createdAt?: Date | string
  }
  
  export const authUserPayload: IAuthPayload = {
    id: 1,
    username: 'khanq',
    email: 'khanq@test.com',
    iat: 1235282483
  }
  
  export const authMock: IAuthDocument = {
    id: 1,
    profilePublicId: '4345456456',
    username: 'Khanq',
    email: 'kkk@test.com',
    country: 'VN',
    profilePicture: '',
    emailVerified: 1,
    createdAt: '2024-11-23T07:42:24.431Z',
    comparePassword: () => {},
    hashPassword: () => false,
  } as unknown as IAuthDocument