import crypto from 'node:crypto'
const IV_LENGTH =16;
const ENCRYPTION_SECRET_KEY = Buffer.from('12345678901234567890123456789012');

export const encrypt = async(text:string) :Promise<string>=>{
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-cbc',
        ENCRYPTION_SECRET_KEY,
        iv
    )
    let encryptedData = cipher.update(text,'utf-8','hex')
encryptedData += cipher.final('hex')

    return `${iv.toString('hex')}:${encryptedData}`
}
export const decrypt = async(encryptedData:string) :Promise<string>=>{
    const [iv , encryptedText] = encryptedData.split(":")|| [] as string[]
    if(! iv || !encryptedText){
        throw new Error("Invalid encrypted data format")
    }
    const binaryLikeIv = Buffer.from(iv ,'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc',
        ENCRYPTION_SECRET_KEY,binaryLikeIv 
    )
let decryptedData = decipher.update(encryptedText,'hex','utf-8')
decryptedData += decipher.final('utf-8')
    return decryptedData
}