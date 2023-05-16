const C = require('../constants');
const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');
const { setupTlIndex } = require('../fixtures');

module.exports = (params) => {
  let tlIndex, index, admin, minter, a, b, c, d, uri, amount, unlock;
  it('deploys the contract and sets the primary minter, primary minter mints 1 nft to wallet a', async () => {
    const setup = await setupTlIndex();
    tlIndex = setup.tlIndex;
    index = setup.index;
    admin = setup.admin;
    minter = setup.minter;
    a = setup.a;
    b = setup.b;
    c = setup.c;
    d = setup.d;
    uri = 'https://hedgey.finance';
    amount = params.amount;
    let now = await time.latest();
    unlock = now + params.unlockShift;
    expect(await tlIndex.updateBaseURI(uri))
      .to.emit('URISet')
      .withArgs(uri);
    await tlIndex.deleteAdmin();
    expect(await tlIndex.isMinter(minter.address)).to.eq(true);
    const preBalance = await index.balanceOf(minter.address);
    expect(await tlIndex.connect(minter).createNFT(a.address, index.address, amount, unlock))
      .to.emit('NFTCreated')
      .withArgs('1', a.address, index.address, amount, unlock);
    expect(await index.balanceOf(tlIndex.address)).to.eq(amount);
    expect(await index.balanceOf(minter.address)).to.eq(preBalance.sub(amount));
    expect(await tlIndex.balanceOf(a.address)).to.eq(1);
    expect(await tlIndex.ownerOf('1')).to.eq(a.address);
    const timelock = await tlIndex.timeLocks('1');
    expect(timelock.token).to.eq(index.address);
    expect(timelock.amount).to.eq(amount);
    expect(timelock.unlock).to.eq(unlock);
  });
  it('wallet a unlocks the tokens after the unlock date', async () => {
    await time.increase(params.unlockShift);
    expect(await tlIndex.connect(a).redeemNFT('1'))
      .to.emit('NFTRedeemed')
      .withArgs('1', a.address, index.address, amount);
    expect(await tlIndex.balanceOf(a.address)).to.eq(0);
    expect(await index.balanceOf(a.address)).to.eq(amount);
    expect(await index.balanceOf(tlIndex.address)).to.eq(0);
  });
  it('minter mints several NFTs to each of wallets a, b, c, d', async () => {
    let amountA = C.E18_1000;
    let amountB = C.E18_13;
    let amountC = C.E18_10000;
    let amountD = C.E18_05;
    let now = await time.latest();
    let unlockA = now + 100;
    let unlockB = now + 1300;
    let unlockC = now + 5000;
    let unlockD = now + 700;
    let wallets = [a.address, b.address, c.address, d.address];
    let amounts = [amountA, amountB, amountC, amountD];
    let unlocks = [unlockA, unlockB, unlockC, unlockD];
    expect(await tlIndex.connect(minter).createNFTs(wallets, index.address, amounts, unlocks))
      .to.emit('NFTCreated')
      .withArgs('2', a.address, index.address, amountA, unlockA)
      .to.emit('NFTCreated')
      .withArgs('3', b.address, index.address, amountB, unlockB)
      .to.emit('NFTCreated')
      .withArgs('4', c.address, index.address, amountC, unlockC)
      .to.emit('NFTCreated')
      .withArgs('5', d.address, index.address, amountD, unlockD);
    let totalAmount = amountA.add(amountB).add(amountC).add(amountD);
    expect(await index.balanceOf(tlIndex.address)).to.eq(totalAmount);
    expect(await tlIndex.totalSupply()).to.eq(4);
    expect(await tlIndex.balanceOf(a.address)).to.eq(1);
    expect(await tlIndex.balanceOf(b.address)).to.eq(1);
    expect(await tlIndex.balanceOf(c.address)).to.eq(1);
    expect(await tlIndex.balanceOf(d.address)).to.eq(1);
    expect(await tlIndex.ownerOf('2')).to.eq(a.address);
    expect(await tlIndex.ownerOf('3')).to.eq(b.address);
    expect(await tlIndex.ownerOf('4')).to.eq(c.address);
    expect(await tlIndex.ownerOf('5')).to.eq(d.address);
    const timelockA = await tlIndex.timeLocks('2');
    const timelockB = await tlIndex.timeLocks('3');
    const timelockC = await tlIndex.timeLocks('4');
    const timelockD = await tlIndex.timeLocks('5');
    expect(timelockA.token).to.eq(index.address);
    expect(timelockB.token).to.eq(index.address);
    expect(timelockC.token).to.eq(index.address);
    expect(timelockD.token).to.eq(index.address);
    expect(timelockA.amount).to.eq(amountA);
    expect(timelockB.amount).to.eq(amountB);
    expect(timelockC.amount).to.eq(amountC);
    expect(timelockD.amount).to.eq(amountD);
    expect(timelockA.unlock).to.eq(unlockA);
    expect(timelockB.unlock).to.eq(unlockB);
    expect(timelockC.unlock).to.eq(unlockC);
    expect(timelockD.unlock).to.eq(unlockD);
  });
  it('wallet D transfers its NFT to wallet A', async () => {
    expect(await tlIndex.connect(d).transferFrom(d.address, a.address, '5'))
      .to.emit('Transfer')
      .withArgs(d.address, a.address, '5');
    expect(await tlIndex.balanceOf(a.address)).to.eq(2);
    expect(await tlIndex.ownerOf('5')).to.eq(a.address);
    expect(await tlIndex.lockedBalances(a.address, index.address)).to.eq(C.E18_05.add(C.E18_1000));
  });
  it('each wallet redeems its NFTs', async () => {
    await time.increase(100);
    expect(await tlIndex.connect(a).redeemNFT('2'))
      .to.emit('NFTRedeemed')
      .withArgs('2', a.address, index.address, C.E18_1000);
    await time.increase(600);
    expect(await tlIndex.connect(a).redeemNFT('5'))
      .to.emit('NFTRedeemed')
      .withArgs('5', a.address, index.address, C.E18_05);
    await time.increase(600);
    expect(await tlIndex.connect(b).redeemNFT('3'))
      .to.emit('NFTRedeemed')
      .withArgs('3', b.address, index.address, C.E18_13);
    await time.increase(4000);
    expect(await tlIndex.connect(c).redeemNFT('4'))
      .to.emit('NFTRedeemed')
      .withArgs('4', c.address, index.address, C.E18_10000);
    await expect(tlIndex.ownerOf('4')).to.be.reverted;
    expect(await index.balanceOf(c.address)).to.eq(C.E18_10000);
    expect(await index.balanceOf(tlIndex.address)).to.eq(0);
  });
};
