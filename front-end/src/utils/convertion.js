import {ethers} from 'ethers';

export const weiToUsd = (wei,r) => {
    if(wei===0) return 0;
    let usd = 1/r;
    const priceInEth = ethers.utils.formatEther(wei);
    return priceInEth/usd;
}

export const usdToWei = (usd,r) => {
    let eth = usd/r;
    eth = parseFloat(eth).toFixed( 18 );
    return ethers.utils.parseEther(eth.toString());
}

export const stringToHex = (str) => {
    var arr1 = ['0','x'];
    for (var n = 0, l = str.length; n < l; n ++){
        var hex = Number(str.charCodeAt(n)).toString(16);
        arr1.push(hex);
    }
    return arr1.join('');
}

export const hexToBytes = (hex) => {
    let bytes=[];
    for (let i=2;i<hex.length;i+=2)
        bytes.push(parseInt(hex.substr(i, 2), 16));
    return bytes;
}