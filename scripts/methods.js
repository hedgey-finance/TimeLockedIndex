const { ethers } = require("hardhat");


// admin functions
async function updateURI(privKey, contractAddress, uri) {
    const wallet = new ethers.Wallet(privKey);
    const tlIndex = (await ethers.getContractFactory('TimeLockedIndex')).attach(contractAddress);
    const tx = await tlIndex.connect(wallet).updateBaseURI(uri);
    console.log(tx.hash);
}

async function deleteAdmin(privKey, contractAddress) {
    const wallet = new ethers.Wallet(privKey);
    const tlIndex = (await ethers.getContractFactory('TimeLockedIndex')).attach(contractAddress);
    const tx = await tlIndex.connect(wallet).deleteAdmin();
    console.log(tx.hash);
}

// minter admin functions

async function addMinter(privKey, newMinter, contractAddress) {
    const wallet = new ethers.Wallet(privKey);
    const tlIndex = (await ethers.getContractFactory('TimeLockedIndex')).attach(contractAddress);
    const tx = await tlIndex.connect(wallet).addMinter(newMinter);
    console.log(tx.hash);
}

async function removeMinter(privKey, formerMinter, contractAddress) {
    const wallet = new ethers.Wallet(privKey);
    const tlIndex = (await ethers.getContractFactory('TimeLockedIndex')).attach(contractAddress);
    const tx = await tlIndex.connect(wallet).removeMinter(formerMinter);
    console.log(tx.hash);
}

async function changePrimaryMinter(privKey, newPrimaryMinter, contractAddress) {
    const wallet = new ethers.Wallet(privKey);
    const tlIndex = (await ethers.getContractFactory('TimeLockedIndex')).attach(contractAddress);
    const tx = await tlIndex.connect(wallet).changePrimaryMinter(newPrimaryMinter);
    console.log(tx.hash);
}

// function to approve tokens to use on the platform

async function approveIndex(privKey, indexAddress, contractAddress, amount) {
    const wallet = new ethers.Wallet(privKey);
    const index = (await ethers.getContractFactory('Token')).attach(indexAddress);
    const tx = await index.connect(wallet).approve(contractAddress, amount);
    console.log(tx.hash);
}

// create function

async function createNFT(privKey, contractAddress, recipient, tokenAddress, amount, unlockDate) {
    const wallet = new ethers.Wallet(privKey);
    const tlIndex = (await ethers.getContractFactory('TimeLockedIndex')).attach(contractAddress);
    const tx = await tlIndex.connect(wallet).createNFT(recipient, tokenAddress, amount, unlockDate);
    console.log(tx.hash);
}

// for this function the recipients, amounts and unlocks should be an array of each of the underlying data type
async function createNFTs(privKey, contractAddress, recipients, tokenAddress, amounts, unlocks) {
    const wallet = new ethers.Wallet(privKey);
    const tlIndex = (await ethers.getContractFactory('TimeLockedIndex')).attach(contractAddress);
    const tx = await tlIndex.connect(wallet).createNFT(recipients, tokenAddress, amounts, unlocks);
    console.log(tx.hash);
}

async function redeemNFT(privKey, contractAddress, tokenId) {
    const wallet = new ethers.Wallet(privKey);
    const tlIndex = (await ethers.getContractFactory('TimeLockedIndex')).attach(contractAddress);
    const tx = await tlIndex.connect(wallet).redeemNFT(tokenId);
    console.log(tx.hash);
}

async function lockedBalances(contractAddress, holder, token) {
    const tlIndex = (await ethers.getContractFactory('TimeLockedIndex')).attach(contractAddress);
    const balances = await tlIndex.lockedBalances(holder, token);
    console.log(balances);
    return balances;
}