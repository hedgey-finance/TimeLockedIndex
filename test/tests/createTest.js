const C = require('../constants');
const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');
const { setupTlIndex } = require('../fixtures');

async function createTests(params) {
  let tlIndex, index, admin, minter, a, b, c, d, uri, amount, unlock;
  it('Mints a single NFT to wallet a', async () => {
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
    expect(await tlIndex.updateBaseURI(uri))
      .to.emit('URISet')
      .withArgs(uri);
    await tlIndex.deleteAdmin();
    expect(await tlIndex.isMinter(minter.address)).to.eq(true);
    expect(await tlIndex.connect(minter).createNFT(a.address, index.address, amount, unlock))
      .to.emit('NFTCreated')
      .withArgs('1', a.address, index.address, amount, unlock);
  });
  it('assigns a second wallet to be the minter, and that minter mints to wallet B', async () => {
    expect(await tlIndex.connect(minter).addMinter(admin.address))
      .to.emit('MinterAdded')
      .withArgs(admin.address);
    await index.connect(admin).mint(C.E18_1000000);
    await index.connect(admin).approve(tlIndex.address, C.E18_1000000);
    expect(await tlIndex.createNFT(b.address, index.address, amount, unlock))
      .to.emit('NFTCreated')
      .withArgs('2', b.address, index.address, amount, unlock);
  });
  it('primary minter bulk mints many tokens to wallets', async () => {
    let recipients = [a.address, b.address, c.address, d.address];
    let amounts = [amount, amount, amount, amount];
    let unlocks = [unlock, unlock, unlock, unlock];
    expect(await tlIndex.connect(minter).createNFTs(recipients, index.address, amounts, unlocks))
      .to.emit('NFTCreated')
      .withArgs('3', a.address, index.address, amount, unlock)
      .to.emit('NFTCreated')
      .withArgs('4', b.address, index.address, amount, unlock)
      .to.emit('NFTCreated')
      .withArgs('5', c.address, index.address, amount, unlock)
      .to.emit('NFTCreated')
      .withArgs('6', d.address, index.address, amount, unlock);
  });
  it('secondary minter bulk creates many NFTs to wallets', async () => {
    let recipients = [a.address, b.address, c.address, d.address];
    let amounts = [amount, amount, amount, amount];
    let unlocks = [unlock, unlock, unlock, unlock];
    expect(await tlIndex.createNFTs(recipients, index.address, amounts, unlocks))
      .to.emit('NFTCreated')
      .withArgs('7', a.address, index.address, amount, unlock)
      .to.emit('NFTCreated')
      .withArgs('8', b.address, index.address, amount, unlock)
      .to.emit('NFTCreated')
      .withArgs('9', c.address, index.address, amount, unlock)
      .to.emit('NFTCreated')
      .withArgs('10', d.address, index.address, amount, unlock);
  });
}

async function createTestsError() {
  let tlIndex, index, admin, minter, a, b, amount, unlock;
  it('fails if the creator is not a minter', async () => {
    const setup = await setupTlIndex();
    tlIndex = setup.tlIndex;
    index = setup.index;
    admin = setup.admin;
    minter = setup.minter;
    amount = C.E18_1000;
    a = setup.a;
    b = setup.b;
    unlock = (await time.latest()) + 100;
    await index.connect(admin).mint(C.E18_1000000);
    await index.connect(admin).approve(tlIndex.address, C.E18_1000000);
    await expect(tlIndex.createNFT(a.address, index.address, amount, unlock)).to.be.revertedWith('!minter');
  });
  it('fails if the recipient is 0 address', async () => {
    await expect(tlIndex.connect(minter).createNFT(C.ZERO_ADDRESS, index.address, amount, unlock)).to.be.revertedWith(
      'zero address'
    );
    await expect(
      tlIndex.connect(minter).createNFTs([C.ZERO_ADDRESS], index.address, [amount], [unlock])
    ).to.be.revertedWith('zero address');
  });
  it('fails if the token is the 0 address', async () => {
    await expect(tlIndex.connect(minter).createNFT(a.address, C.ZERO_ADDRESS, amount, unlock)).to.be.revertedWith(
      'zero_token'
    );
    await expect(
      tlIndex.connect(minter).createNFTs([a.address], C.ZERO_ADDRESS, [amount], [unlock])
    ).to.be.revertedWith('zero_token');
  });
  it('fails if the amount of tokens is 0', async () => {
    await expect(tlIndex.connect(minter).createNFT(a.address, index.address, C.ZERO, unlock)).to.be.revertedWith(
      'zero amount'
    );
    await expect(tlIndex.connect(minter).createNFTs([a.address], index.address, [C.ZERO], [unlock])).to.be.revertedWith(
      'zero amount'
    );
  });
  it('fails if the unlock date is in the past', async () => {
    let backdate = unlock - 200;
    await expect(tlIndex.connect(minter).createNFT(a.address, index.address, amount, backdate)).to.be.revertedWith(
      '!future'
    );
    await expect(
      tlIndex.connect(minter).createNFTs([a.address], index.address, [amount], [backdate])
    ).to.be.revertedWith('!future');
  });
  it('fails if the amounts array is not same as unlocks array', async () => {
    await expect(
      tlIndex.connect(minter).createNFTs([a.address, b.address], index.address, [amount], [unlock])
    ).to.be.revertedWith('array len');
    await expect(
      tlIndex.connect(minter).createNFTs([a.address, b.address], index.address, [amount], [unlock, unlock])
    ).to.be.revertedWith('array len');
  });
  it('fails if the unlocks array is not same as the recipients array', async () => {
    await expect(
      tlIndex.connect(minter).createNFTs([a.address, b.address], index.address, [amount, amount], [unlock])
    ).to.be.revertedWith('array len');
    await expect(
      tlIndex.connect(minter).createNFTs([a.address, b.address], index.address, [amount], [unlock])
    ).to.be.revertedWith('array len');
  });
}

module.exports = {
  createTests,
  createTestsError,
};
