const C = require('./constants');

const happyPath = require('./tests/happyPath');
const adminTest = require('./tests/adminTest');
const { createTests, createTestsError } = require('./tests/createTest');
const { redeemTests, redeemErrorTests } = require('./tests/redeemTest');

const paramsMatrix = [
  { amount: C.E18_1000, unlockShift: 100 },
  { amount: C.E18_13, unlockShift: 1000 },
  { amount: C.E18_1000, unlockShift: 10 },
  { amount: C.E18_1000, unlockShift: 80000 },
  { amount: C.E18_100, unlockShift: 1000000 }
];

describe('Testing for the basic admin testing', () => {
  adminTest();
});

describe('Testing the happy path', () => {
  paramsMatrix.forEach((param) => {
    happyPath(param);
  });
});

describe('Testing the create and minting NFT tests', () => {
  paramsMatrix.forEach((param) => {
    createTests(param);
  });
  createTestsError();
});

describe('Testing for the Redemption and redeem error tests', () => {
  paramsMatrix.forEach((param) => {
    redeemTests(param);
  });
  redeemErrorTests();
})
