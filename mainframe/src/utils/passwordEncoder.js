import sha256 from 'crypto-js/sha256';

export const encodePassword=(password)=>{
    return sha256(password).toString();
}