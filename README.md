# Time Locked Index

Time Locked Index is an NFT representation of locked Index Coop Tokens.

You can clone this repository for testing and deployments. 

# Contract Testing
``` bash
npm install
npx hardhat compile
npx hardhat test
```

# Deployment
To deploy the contracts you should create a .env file, and add your private keys, network rpc URL, and etherscan API Key. 
Navigate to ./scripts/deploy and adjust the token name, symbol, and bankless token address to the desired inputs for the contract deployment. These are the constructor arguments in the contract. 
Then you can use the hardhat deploy plugin to deploy to supported networks. 

``` bash
npx hardhat run scripts/deploy.js --network <network-name>
```

Afterwards using the etherscan verify plugin you can verify the network with the arguments you've input to the constructor; 

``` bash
npx hardhat verify --newtork <network-name> <contract_addresss> <tokenName> <tokenSymbol> <indexTokenAddress>
```

# Sending Transactions
You can use the methods.js file to send transactions to the TLBank contract. Be sure to input your private key and the desired parameters. All function inputs should be a string, including the amount and unlock date. 
Then you can use the below command in the terminal to send the transaction.  

``` bash
npx hardhat run scripts/methods.js -network <network-name>
```

## Production Deployment: 

Ethereum Mainnet: `0xAc5fCFCE14729Cc03420252b1f8bc1f35d58d30A`