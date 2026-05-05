import {z } from 'zod'
import {createComment,reactPost,updateComment,replyComment,deleteComment} from './comment.validation.js'
export type createCommentBodyDto = z.infer<typeof createComment.body>
export type createCommentParamsDto = z.infer<typeof createComment.params>

export type ReactPostQueryDto = z.infer<typeof reactPost.query>
export type ReactPostParamsDto = z.infer<typeof reactPost.params>

export type UpdateCommentBodyDto = z.infer<typeof updateComment.body>
export type UpdateCommentParamsDto = z.infer<typeof updateComment.params>

export type ReplyCommentParamsDto = z.infer<typeof replyComment.params>
export type ReplyCommentBodyDto = z.infer<typeof replyComment.body>

export type DeleteCommentParamsDto = z.infer<typeof deleteComment.params>

 