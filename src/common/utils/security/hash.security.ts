import {compare, hash } from 'bcrypt';
export const generateHash=async({plaintext,salt=10}:{
    plaintext: string,
    salt?: number
}):Promise<string>=>{
    return await hash(plaintext,salt);
}
export const compareHash=async({plaintext,cypherText}:{
    plaintext: string,
    cypherText: string
}):Promise<boolean>=>{
    return await compare(plaintext,cypherText);
}


