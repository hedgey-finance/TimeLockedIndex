const C = require('../constants');
const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');
const { setupTlIndex } = require('../fixtures');

module.exports = async () => {
  let tlIndex, index, admin, minter, a, b, c, d, uri, amount, unlock;
  it('deploys with a primary minter and updates the base URI', async () => {
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
    expect(await tlIndex.updateBaseURI(uri))
      .to.emit('URISet')
      .withArgs(uri);
    expect(await tlIndex.isMinter(minter.address)).to.eq(true);
    uri = 'https://this is not right';
    expect(await tlIndex.updateBaseURI(uri))
      .to.emit('URISet')
      .withArgs(uri);
  });
  it('a non admin cannot update the URI', async () => {
    await expect(tlIndex.connect(a).updateBaseURI(uri)).to.be.revertedWith('!admin');
  });
  it('deletes the admin', async () => {
    await tlIndex.deleteAdmin();
  });
  it('the primary minter adds another minter', async () => {
    expect(await tlIndex.isMinter(a.address)).to.eq(false);
    await tlIndex.connect(minter).addMinter(a.address);
    expect(await tlIndex.isMinter(a.address)).to.eq(true);
  });
  it('not primary minter cannot add or remove a minter', async () => {
    await expect(tlIndex.connect(a).addMinter(b.address)).to.be.revertedWith('!primary');
    await expect(tlIndex.connect(a).removeMinter(minter.address)).to.be.revertedWith('!primary');
  });
  it('the primary minter deletes the added minter', async () => {
    await tlIndex.connect(minter).removeMinter(a.address);
    expect(await tlIndex.isMinter(a.address)).to.eq(false);
  });
  it('the primary minter changes to the admin', async () => {
    await tlIndex.connect(minter).changePrimaryMinter(admin.address);
    expect(await tlIndex.isMinter(admin.address)).to.eq(true);
    expect(await tlIndex.isMinter(minter.address)).to.eq(false);
  });
}

