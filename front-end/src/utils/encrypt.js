import EthCrypto from 'eth-crypto';

import { stringToHex } from "./convertion";

export const encryptWithPublicKey = async (message,publicKey) => {
    let pk = new Uint8Array(publicKey)
    let data = await EthCrypto.encryptWithPublicKey(pk,message);
    data = JSON.stringify(data)
    data = stringToHex(data);
    return data;
}