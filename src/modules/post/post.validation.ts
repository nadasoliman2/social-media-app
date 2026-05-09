import {z } from 'zod'
import { Types } from 'mongoose'
import { AvailabilityEnum ,React} from '../../common/enums/index.js'
import {fileFieldValidation} from '../../common/utils/index.js'
import { generalValidation } from '../../common/validation/general.validation.js';
export const deletePost={
params:z.strictObject({
   
    postId: generalValidation.id,

})
}
export const reactPostGQL = z.strictObject({
   
    react: z.coerce.number().min(0).max(7),
    postId: generalValidation.id

})
export const reactPost = {
query:z.strictObject({
   
    react: z.coerce.number().min(0).max(7),

}),
params:z.strictObject({
   
    postId: generalValidation.id,

})
}
export const createPost = {
  body: z
    .strictObject({
      content: z.string().optional(),

     files: z
        .array(generalValidation.file(fileFieldValidation.Image))
        .optional(),

      tags: z.array(generalValidation.id).optional(),

      availability: z.coerce.number().default(AvailabilityEnum.PUBLIC),
    })
    .superRefine((args, ctx) => {
      // ✅ لازم يكون فيه content أو files
      if (!args.content && !args.files?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "Content or files is required",
        });
      }
    
      // ✅ منع التاجات المكررة
      if (args.tags?.length) {
        const uniqueTags = [...new Set(args.tags)];

        if (uniqueTags.length !== args.tags.length) {
          ctx.addIssue({
            code: "custom",
            path: ["tags"],
            message: "Duplicated tag",
          });
        }
        for(const tag of args.tags){
            if(!Types.ObjectId.isValid(tag)){
                ctx.addIssue({
                    code:"custom",
                    path: ["tags"],
                    message: "Invalid tag format",
                });
            }}
      }
    }),
};
export const updatePost = {
    params:z.strictObject({
   
    postId: generalValidation.id,

}),
  body: z
    .strictObject({
      content: z.string().optional(),
removeFiles:z.array(z.string()).optional(),
removeTags:z.array(z.string()).optional(),

      files: z
        .array(generalValidation.file(fileFieldValidation.Image))
        .optional(),

      tags: z.array(generalValidation.id).min(1, "At least one tag is required")
  .optional(),

      availability: z.coerce.number().optional(),
    })
    .superRefine((args, ctx) => {
      // ✅ لازم يكون فيه content أو files
      if (!Object.values(args)?.length) {
        ctx.addIssue({
          code: "custom",
        
          message: "Insert data to update",
        });
      }

      // ✅ منع التاجات المكررة
      if (args.tags?.length) {
        const uniqueTags = [...new Set(args.tags)];

        if (uniqueTags.length !== args.tags.length) {
          ctx.addIssue({
            code: "custom",
            path: ["tags"],
            message: "Duplicated tag",
          });
        }

      }
    }),
};