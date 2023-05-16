const C = require('./constants');

const happyPath = require('./tests/happyPath');
const adminTest = require('./tests/adminTest');
const { createTests, createTestsError } = require('./tests/createTest');

const paramsMatrix = [{ amount: C.E18_1000, unlockShift: 100 }];

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
