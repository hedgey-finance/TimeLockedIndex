const { ethers } = require('hardhat');
const C = require('./constants');

async function setupTlIndex() {
    const [admin, minter, a, b, c, d] = await ethers.getSigners();
    const TLIndex = await ethers.getContractFactory('TimeLockedIndex');
    const Token = await ethers.getContractFactory('Token');
    const tlIndex = await TLIndex.deploy('TimeLockedIndex', 'TLINDEX', minter.address);
    const index = await Token.connect(minter).deploy(C.E18_1000000, 'Index', 'INDEX');
    await index.connect(minter).approve((await tlIndex).address, C.E18_1000000);
    return {
        admin,
        minter,
        a,
        b,
        c,
        d,
        tlIndex,
        index
    }
}

module.exports = {
    setupTlIndex,
}