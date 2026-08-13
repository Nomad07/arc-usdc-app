# Arc USDC App

A React and TypeScript dApp for interacting with Arc Testnet and reading USDC wallet information directly through the Arc RPC.

## Features

- Connect an EVM wallet
- Connect Rabby and compatible browser wallets
- Switch to Arc Testnet
- Verify Arc Testnet Chain ID
- Display connected wallet address
- Display the current Arc block number
- Read USDC balance directly through Arc RPC
- Display the current USDC balance
- Disconnect the connected wallet
- Show Arc network connection status
- Browser-based interface

## Network

The application is currently configured for Arc Testnet.

- Network: Arc Testnet
- Chain ID: `5042002`
- Hex Chain ID: `0x4cef52`
- RPC: `https://rpc.testnet.arc.network`

## USDC

The application reads the USDC balance directly from the Arc Testnet RPC.

- Token: USDC
- Decimals: `6`
- Contract: `0x3600000000000000000000000000000000000000`

## Requirements

- Node.js 20+
- npm
- An EVM-compatible browser wallet such as Rabby or MetaMask
- Arc Testnet access

## Installation

Clone the repository:

    git clone https://github.com/Nomad07/arc-usdc-app.git
    cd arc-usdc-app

Install dependencies:

    npm install

## Development

Start the development server:

    npm run dev

Open the local development URL shown by Vite in your browser.

Connect your wallet and switch to Arc Testnet when prompted.

## How It Works

The application connects the browser wallet to Arc Testnet and verifies the active network before reading wallet information.

The main flow is:

    Connect Wallet
        ↓
    Switch to Arc Testnet
        ↓
    Verify Chain ID
        ↓
    Read Wallet Address
        ↓
    Read Current Arc Block
        ↓
    Read USDC Balance
        ↓
    Display Wallet Information

USDC balance data is read directly through the Arc RPC rather than relying on a third-party wallet adapter for the token balance.

## Example

Example wallet information:

    Arc Testnet

    Chain ID: 5042002
    Wallet: 0x...
    Current Block: 56800000

    USDC Balance
    41.796567 USDC

The interface also provides a Disconnect action for ending the current wallet connection.

## Project Status

Arc USDC App is an experimental developer project built to explore wallet connectivity and direct RPC interaction with Arc Testnet.

Current functionality focuses on:

- EVM wallet connection
- Arc Testnet network switching
- Wallet information
- Arc block information
- Direct USDC balance reading
- Wallet disconnect

Future versions may explore additional USDC interactions and Arc-based payment functionality.

## Security

The application does not require users to enter or store their private keys.

Transactions, when added in future versions, should be signed directly by the connected browser wallet.

Never share your wallet seed phrase or private key with the application.

## Tech Stack

- React
- TypeScript
- Vite
- EVM-compatible browser wallets
- Arc Testnet
- Web3 RPC

## License

MIT License
