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