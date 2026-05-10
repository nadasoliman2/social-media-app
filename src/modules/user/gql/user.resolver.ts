import userService  from "../user.service.js"
import { HydratedDocument } from "mongoose"
import {IUser} from "../../../common/interfaces/user.interface.js"
import {decodeToken} from '../../../common/services/index.js'
import {GQLauthorization} from '../../../middleware/index.js'
import {endpoint} from '../user.authorization.js'
import {profileGQL} from '../user.validation.js'
import {GQLValidation} from '../../../middleware/validation.middleware.js'
class UserResolver{
    private userService: typeof userService
    constructor(){
        this.userService=userService
    }
profile = async (
  parent: unknown,
  args: { search?: string },
  context: any
) => {

await GQLauthorization(endpoint.profile,context.user)
await GQLValidation(profileGQL,args)
  if (!context.user) {
    throw new Error("Unauthorized")
  }

  const data = await this.userService.profile(context.user)

  return {
    message: "Hello",
    data
  }
}
}
export const userResolver = new UserResolver()