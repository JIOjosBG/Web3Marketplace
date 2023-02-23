import {ethers} from 'ethers';


import MarketplaceJSON from '../shared/ABIs/Marketplace.json';
import addressesJSON from '../shared/contractAddresses.json';

let provider = new ethers.providers.Web3Provider(window.ethereum);
const marketplace= new ethers.Contract( addressesJSON.marketplace, MarketplaceJSON.abi , provider);


export const getCourierStatus = async (address) => {
    return (await marketplace.couriers(address))
}
export const getAdminStatus = async (address) => {
    return (await marketplace.admins(address))
}

