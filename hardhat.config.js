
/**
* @type import('hardhat/config').HardhatUserConfig
*/

require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

const { API_URL, PRIVATE_KEY } = process.env;

const networks = { hardhat: {} };

// Only add Sepolia if credentials are available (not in CI)
if (API_URL && PRIVATE_KEY) {
   networks.sepolia = {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
   };
}

module.exports = {
   solidity: "0.8.20",
   defaultNetwork: "hardhat",
   networks,
}
