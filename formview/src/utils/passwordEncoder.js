import sha256 from 'crypto-js/sha256';
import { JSEncrypt } from 'jsencrypt';

export const encodePassword=(password)=>{
    return sha256(password).toString();
}

export const RSAEncrypt=(value,publicKey)=>{
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    var encrypted = encrypt.encrypt(value);
    console.log(value,publicKey,encrypted);
    return encrypted;
}
