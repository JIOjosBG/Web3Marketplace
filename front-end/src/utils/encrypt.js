import EthCrypto from 'eth-crypto';

import { stringToHex } from "./convertion";

export const encryptWithPublicKey = async (message,publicKey) => {
    console.log("11",message)
    let pk = new Uint8Array(publicKey)
    let data = await EthCrypto.encryptWithPublicKey(pk,message);
    data = JSON.stringify(data)
    data = stringToHex(data);
    console.log("22",data)

    return data;
}