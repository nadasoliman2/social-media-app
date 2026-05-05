import { Request, Response, NextFunction } from 'express';
import { BadRequestException } from '../common/exception/domain.exception.js';
import { ZodError, ZodType } from 'zod';
type keyofSchema = keyof Request
type SchemaType =Partial<Record <keyofSchema ,ZodType>>
type issues= Array<{
        key: keyofSchema,
        issues: Array<{ message: string, 
            path: (Symbol | string | number | undefined| null)[] }>
    }> 
export const validation = (schema : SchemaType) => {
return async (req: Request, res: Response, next: NextFunction) => {
    const issues:issues = []
    for(const key of Object.keys(schema) as keyofSchema []){
        if(!schema[key])
            continue

        if(req.file){
            req.body.file = req.file
        }
         if(req.files){
            console.log({files:req.files})
            req.body.files = req.files
        }
        const validationResult = await schema[key].safeParse(req[key])
        if(!validationResult.success){
            const error = validationResult.error as ZodError
            issues.push({ key, issues: error.issues.map(issue => ({ message: issue.message, path: issue.path })) })
        }
    }
if(issues.length){
    throw new BadRequestException("validation error", issues)
}

next()
}
}