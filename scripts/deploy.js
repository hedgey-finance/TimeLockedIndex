const { ethers } = require("hardhat");

async function deploy(args, uriBase) {
    const wallet = await ethers.getSigner();
    const TLINDEX = await ethers.getContractFactory('TimeLockedIndex');
    const tlIndex = await TLBANK.TLINDEX(...args);
    await tlIndex.deployed();
    console.log(`new TLINDEX Address: ${tlIndex.address}`);
    const uri = `${uriBase}${tlIndex.address.toLowerCase()}/`
    const tx = await tlIndex.updateBaseURI(uri);
    console.log(`uriHash: ${tx.hash}`);
}

const name = 'TimeLockedIndex';
const symbol = 'TLINDEX';
const minter = '0x';

deploy([name, symbol, minter], 'https://nft.hedgey.finance/ethereum/');
