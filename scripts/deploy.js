const { ethers } = require("hardhat");

async function deploy(args, uriBase) {
    const wallet = await ethers.getSigner();
    const TLINDEX = await ethers.getContractFactory('TimeLockedIndex');
    const tlIndex = await TLINDEX.deploy(...args);
    await tlIndex.deployed();
    console.log(`new TLINDEX Address: ${tlIndex.address}`);
    const uri = `${uriBase}${tlIndex.address.toLowerCase()}/`
    const tx = await tlIndex.updateBaseURI(uri)
    console.log(`uriHash: ${tx.hash}`);
}

const name = 'TimeLockedIndex';
const symbol = 'TLINDEX';
const minter = '0x215275f3fe5aCc82BfF9D8894f90c4E8D51030a1';

deploy([name, symbol, minter], 'https://nft.hedgey.finance/ethereum/');