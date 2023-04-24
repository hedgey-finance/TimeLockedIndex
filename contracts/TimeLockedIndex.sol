// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.18;

import '@openzeppelin/contracts/utils/Counters.sol';
import './ERC721Delegate/ERC721Delegate.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './libraries/TransferHelper.sol';

contract TimeLockedIndex is ERC721Delegate, ReentrancyGuard, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  string private baseURI;

  mapping(address => bool) private minters;

  struct TimeLock {
    address token;
    uint256 amount;
    uint256 unlockDate;
  }

  mapping(uint256 => TimeLock) public timeLocks;
  //events
  event NFTCreated(
    uint256 indexed tokenId,
    address indexed recipient,
    address token,
    uint256 amount,
    uint256 unlockDate
  );
  event NFTRedeemed(uint256 indexed tokenId, address indexed holder, address token, uint256 amount);
  event URISet(string _uri);

  constructor(string memory name, string memory symbol, address minter) ERC721(name, symbol) {
    minters[minter] = true;
  }

  function updateBaseURI(string memory _uri) external onlyOwner {
    baseURI = _uri;
    emit URISet(_uri);
  }

  function addMinter(address minter) external onlyOwner {
    minters[minter] = true;
  }

  function removeMinter(address minter) external onlyOwner {
    delete minters[minter];
  }

  function createNFT(
    address recipient,
    address token,
    uint256 amount,
    uint256 unlockDate
  ) external nonReentrant returns (uint256) {
    require(validMint(msg.sender, token));
    require(validInput(recipient, amount, unlockDate));
    TransferHelper.transferTokens(token, msg.sender, address(this), amount);
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    _safeMint(recipient, newItemId);
    timeLocks[newItemId] = TimeLock(token, amount, unlockDate);
    emit NFTCreated(newItemId, recipient, token, amount, unlockDate);
    return newItemId;
  }

  function batchCreate(
    address[] memory recipients,
    address token,
    uint256[] memory amounts,
    uint256[] memory unlocks
  ) external nonReentrant {
    require(validMint(msg.sender, token));
    require(recipients.length == amounts.length && amounts.length == unlocks.length, 'array len');
    uint256 totalAmount;
    for (uint256 i; i < amounts.length; i++) {
      require(validInput(recipients[i], amounts[i], unlocks[i]));
      _tokenIds.increment();
      uint256 newItemId = _tokenIds.current();
      totalAmount += amounts[i];
      _safeMint(recipients[i], newItemId);
      timeLocks[newItemId] = TimeLock(token, amounts[i], unlocks[i]);
      emit NFTCreated(newItemId, recipients[i], token, amounts[i], unlocks[i]);
    }
    TransferHelper.transferTokens(token, msg.sender, address(this), totalAmount);
  }

  function redeemNFT(uint256 tokenId) external nonReentrant {
    require(ownerOf(tokenId) == msg.sender, '!owner');
    TimeLock memory tl = timeLocks[tokenId];
    require(tl.unlockDate < block.timestamp && tl.amount > 0, 'Not redeemable');
    _burn(tokenId);
    delete timeLocks[tokenId];
    TransferHelper.withdrawTokens(tl.token, msg.sender, tl.amount);
    emit NFTRedeemed(tokenId, msg.sender, tl.token, tl.amount);
  }

  function delegateNFT(address delegate, uint256 tokenId) external {
    _delegateToken(delegate, tokenId);
  }

  function _baseURI() internal view override returns (string memory) {
    return baseURI;
  }

  function validInput(address recipient, uint256 amount, uint256 unlock) internal returns (bool) {
    require(recipient != address(0), 'zero address');
    require(amount > 0, 'zero amount');
    require(unlock < block.timestamp + 1100 days, 'day guardrail');
    require(unlock > block.timestamp, '!future');
    return true;
  }

  function validMint(address minter, address token) internal returns (bool) {
    require(minters[minter], 'not minter');
    require(token != address(0), 'zero_token');
    return true;
  }

  function lockedBalances(address holder, address token) public view returns (uint256 lockedBalance) {
    uint256 holdersBalance = balanceOf(holder);
    for (uint256 i; i < holdersBalance; i++) {
      uint256 tokenId = _tokenOfOwnerByIndex(holder, i);
      if (timeLocks[tokenId].token == token) lockedBalance += timeLocks[tokenId].amount;
    }
  }

  function delegatedBalances(address delegate, address token) public view returns (uint256 delegatedBalance) {
    uint256 delegateBalance = balanceOfDelegate(delegate);
    for (uint256 i; i < delegateBalance; i++) {
      uint256 tokenId = tokenOfDelegateByIndex(delegate, i);
      if (timeLocks[tokenId].token == token) lockedBalance += timeLocks[tokenId].amount;
    }
  }

  function isMinter(address minter) public view returns (bool) {
    return minters[minter];
  }
}
