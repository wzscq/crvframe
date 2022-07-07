import { sha256 } from 'js-sha256';

export const encodePassword=(password)=>{
    return sha256(password);
}