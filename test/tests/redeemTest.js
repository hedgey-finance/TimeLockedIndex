const C = require('../constants');
const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');
const { setupTlIndex } = require('../fixtures');

async function redeemTests(params) {
  let tlIndex, index, admin, minter, a, b, c, d, uri, amount, unlock;
  it('Redeems a single NFT to wallet a', async () => {
    const setup = await setupTlIndex();
    tlIndex = setup.tlIndex;
    index = setup.index;
    admin = setup.admin;
    minter = setup.minter;
    a = setup.a;
    b = setup.b;
    c = setup.c;
    d = setup.d;
    uri = 'https://hedgey.finance/';
    amount = params.amount;
    let now = await time.latest();
    unlock = now + params.unlockShift;
    await tlIndex.connect(minter).createNFT(a.address, index.address, amount, unlock);
    await time.increaseTo(unlock + 1);
    expect(await tlIndex.connect(a).redeemNFT('1'))
      .to.emit('NFTRedeemed')
      .withArgs('1', a.address, index.address, amount);
    expect(await index.balanceOf(tlIndex.address)).to.eq(0);
    expect(await index.balanceOf(a.address)).to.eq(amount);
    expect(await tlIndex.balanceOf(a.address)).to.eq(0);
  });
  it('Transfers an NFT and the recipient of the transfer redeems', async () => {
    let now = await time.latest();
    unlock = now + params.unlockShift;
    await tlIndex.connect(minter).createNFT(a.address, index.address, amount, unlock);
    await tlIndex.connect(a).transferFrom(a.address, b.address, '2');
    expect(await tlIndex.balanceOf(b.address)).to.eq(1);
    expect(await tlIndex.ownerOf('2')).to.eq(b.address);
    await time.increaseTo(unlock + 1);
    expect(await tlIndex.connect(b).redeemNFT('2'))
      .to.emit('NFTRedeemed')
      .withArgs('2', a.address, index.address, amount);
    expect(await index.balanceOf(tlIndex.address)).to.eq(0);
    expect(await index.balanceOf(b.address)).to.eq(amount);
    expect(await tlIndex.balanceOf(b.address)).to.eq(0);
  });
}

async function redeemErrorTests() {
  let tlIndex, index, admin, minter, a, b, c, d, uri, amount, unlock;
  it('Reverts if a not owner of token tries to redeem', async () => {
    const setup = await setupTlIndex();
    tlIndex = setup.tlIndex;
    index = setup.index;
    admin = setup.admin;
    minter = setup.minter;
    a = setup.a;
    b = setup.b;
    c = setup.c;
    d = setup.d;
    amount = C.E18_100;
    let now = await time.latest();
    unlock = now + 100;
    await tlIndex.connect(minter).createNFT(a.address, index.address, amount, unlock);
    await expect(tlIndex.redeemNFT('1')).to.be.revertedWith('!owner');
  });
  it('reverts if the token has not unlocked yet', async () => {
    await expect(tlIndex.connect(a).redeemNFT('1')).to.be.revertedWith('Not redeemable');
  });
  it('reverts if the token has already been redeemed', async () => {
    await time.increase(101);
    await tlIndex.connect(a).redeemNFT('1');
    await expect(tlIndex.connect(a).redeemNFT('1')).to.be.reverted;
  });
}

module.exports = {
  redeemTests,
  redeemErrorTests,
};
