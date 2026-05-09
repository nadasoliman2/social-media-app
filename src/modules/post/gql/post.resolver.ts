import postService from "../post.service.js"
import { HydratedDocument } from "mongoose"
import { IUser } from "../../../common/interfaces/user.interface.js"
import { IPost } from "../../../common/interfaces/post.interface.js"
import { GQLValidation } from '../../../middleware/index.js'
import { reactPostGQL } from '../post.validation.js'
import { ReactOnPostDTo } from '../post.dto.js'

export class PostResolver {

  postList = async (
    parent: unknown,
    args: any,
    { user }: { user: HydratedDocument<IUser> }
  ) => {

    const data = await postService.postList(args, user)

    return { message: "done", data }
  }

reactOnPost = async (parent, args, { user }) => {

  console.log("STEP 1 - resolver entered")
  console.log({ args, user })

  await GQLValidation(reactPostGQL, args)

  console.log("STEP 2 - validation passed")

  const { postId, react } = args

  const data = await postService.reactPost(
    { postId },
    { react },
    user
  )

  console.log("STEP 3 - service returned")

  return {
    message: "done",
    data
  }
}
}

export const postResolver = new PostResolver()