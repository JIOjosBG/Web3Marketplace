import axios from 'axios';

export const getRates = async () => {
    try{
        const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`);
        let r = (await res.data).ethereum.usd;
        return r;
    }catch(e){
        console.log(e);
    }
}

export const getBids = async (id) => {
    try{
        const res = await axios.get(`http://localhost:5000/a/b/${id}`);

        let b = await res.data;
        console.log(b)
        return b
    }catch(e){
        console.log(e);
    }
}