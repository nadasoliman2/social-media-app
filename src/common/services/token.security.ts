import {
  user_access_token_secret,
  refresh_user_token_secret,
  access_token_expires_in,
  refresh_token_expires_in,
  system_access_token_secret,
  refresh_system_token_secret
} from "../../config/config.service.js"

import jwt, { JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken"
import { UserRepository } from "../../DB/repository/user.repository.js"
import { NotFoundException, BadRequestException, UnauthorizedException } from "../../common/exception/index.js"
import { RoleEnum, TokenTypeEnum } from "../../common/enums/index.js"
import { randomUUID } from "node:crypto"
import redis from "./redis.service.js"
import { HydratedDocument } from "mongoose"
import { UserModel } from "../../DB/model/user.model.js"
import { IUser } from "../interfaces/user.interface.js"
import { Types } from "mongoose"

/* ============================= */
/*            TYPES              */
/* ============================= */
interface IGenerateToken {
  payload?: string | Buffer | object
  secret?: string
  options?: SignOptions
}

interface IVerifyToken {
  token: string
  secret?: string
  options?: VerifyOptions
}

interface IGetTokenSignature {
  tokenType?: TokenTypeEnum
  level: RoleEnum
}

interface IDecodeTokenInput {
  token: string
  tokenType?: TokenTypeEnum
}

interface IDecodedToken {
  sub: Types.ObjectId,
  aud: [TokenTypeEnum, RoleEnum]
  jti: string
  iat: number
}


/* ============================= */
/*        JWT GENERATION         */
/* ============================= */

export const generateToken = async (
  { payload = {}, secret = user_access_token_secret, options = {} }: IGenerateToken
): Promise<string> => {
  return jwt.sign(payload, secret as string, options)
}



export const verifyToken = async (
  { token, secret = user_access_token_secret, options = {} }: IVerifyToken
): Promise<string | JwtPayload> => {
  return jwt.verify(token, secret as string, options)
}



/* ============================= */
/*      SIGNATURE DETECTION      */
/* ============================= */

export const detectSigntureLevel = async (
  level: RoleEnum
): Promise<{ accessSignature: string; refreshSignature: string }> => {

  switch (level) {
    case RoleEnum.ADMIN:
      return {
        accessSignature: system_access_token_secret as string,
        refreshSignature: refresh_system_token_secret as string
      }

    default:
      return {
        accessSignature: user_access_token_secret as string,
        refreshSignature: refresh_user_token_secret as string
      }
  }
}



export const getTokenSignture = async (
  { tokenType = TokenTypeEnum.Access, level }: IGetTokenSignature
): Promise<string> => {

  const { accessSignature, refreshSignature } =
    await detectSigntureLevel(level)

  switch (tokenType) {
    case TokenTypeEnum.Refresh:
      return refreshSignature

    default:
      return accessSignature
  }
}



/* ============================= */
/*          DECODE TOKEN         */
/* ============================= */

export const decodeToken = async (
  { token, tokenType = TokenTypeEnum.Access }: IDecodeTokenInput
): Promise<{
  user: HydratedDocument<IUser>,
  decoded: IDecodedToken
}> => {

  const decoded = jwt.decode(token) as IDecodedToken | null

  if (!decoded) {
     throw new BadRequestException( "Invalid token" )
  }

  const { sub, aud, jti, iat } = decoded

  if (!aud?.length) {
     throw new BadRequestException( "Missing token audience" )
  }

  const [tokenApproach, level] = aud

  if (tokenType !== tokenApproach) {
     throw new BadRequestException( "Unexpected token mechanism" )
  }

  // Check revoked session
  if (jti && await redis.get( redis.revokeTokenKey({ userId: sub as Types.ObjectId, jti: jti as string }))) {
     throw new UnauthorizedException( "Invalid login session" )
  }

  const secret = await getTokenSignture({
    tokenType: tokenApproach,
    level
  })

  jwt.verify(token, secret)

  const user:HydratedDocument<IUser> | null = await UserModel.findById(
    sub,
    { gender: 0, email: 0 }
  ) 

  if (!user) {
     throw new NotFoundException( "User not found" )
  }

  // Check if credentials changed after token issue
  if (
    user.changeCredentialsTime &&
    user.changeCredentialsTime.getTime() >= iat * 1000
  ) {
     throw new UnauthorizedException("Invalid login session" )
  }

  return { user, decoded }
}



/* ============================= */
/*      CREATE LOGIN TOKENS      */
/* ============================= */

export const createloginCredentials = async (
  user: HydratedDocument<IUser>,
  issuer: string
): Promise<{ access_token: string; refresh_token: string }> => {

  const { accessSignature, refreshSignature } =
    await detectSigntureLevel(user.role)

  const jwtid = randomUUID()

  const access_token = await generateToken({
    payload: {
      sub: user.id,
      extra: 250
    },
    secret: accessSignature,
    options: {
      issuer,
audience: [TokenTypeEnum.Access as unknown as string, user.role as unknown as string],
      expiresIn: access_token_expires_in,
      jwtid
    }
  })

  const refresh_token = await generateToken({
    payload: {
      sub: user.id,
      extra: 250
    },
    secret: refreshSignature,
    options: {
      issuer,
      audience: [TokenTypeEnum.Refresh  as unknown as string, user.role as unknown as string],
      expiresIn: refresh_token_expires_in,
      jwtid
    }
  })

  return { access_token, refresh_token }
}