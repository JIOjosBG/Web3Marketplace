const dotenv = require("dotenv")

dotenv.config();

function hexToArray(hexx) {
    var hex = hexx.toString().slice(2);
    var arr = [];
    for (var i = 0; i < hex.length; i += 2)
        arr.push(parseInt(hex.substr(i, 2), 16));
    return arr;
}

publicKey = ethers.utils.computePublicKey(process.env.ACCOUNT_PRIVATE_KEY);
publicKey = hexToArray(publicKey);

module.exports = [
    publicKey
];