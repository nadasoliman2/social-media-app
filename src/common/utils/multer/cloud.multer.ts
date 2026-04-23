import multer from "multer"
import {tmpdir} from 'node:os'
import {randomUUID} from 'node:crypto'
import { Express,Request } from "express";
import{StorageApproachEnum} from '../../enums/index.js'
import {fileFilter} from './validation.multer.js'
export const cloudFileUpload=(
    {storageApproach=StorageApproachEnum.MEMORY,
        validation=[],
    maxSize=2}
    : 
    {storageApproach?: StorageApproachEnum,
        validation?:string[],
        maxSize?:number
    })=>{
    console.log(tmpdir())
// const storage = multer.memoryStorage()
const storage = storageApproach == StorageApproachEnum.MEMORY ? multer.memoryStorage() : multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
      cb(null, tmpdir())},
    filename: function (req: Request, file:Express.Multer.File,cb: (error: Error | null, filename: string) => void) {
        cb(null,`${randomUUID()}__${file.originalname}`)
    }
})
    return multer({ fileFilter: fileFilter(validation),storage,limits:{fileSize:maxSize * 1024 * 1024} })
}