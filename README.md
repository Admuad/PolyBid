# PolyBid - Privacy-Preserving Auctions with FHE 🔒

PolyBid is a decentralized auction platform that leverages **Fully Homomorphic Encryption (FHE)** to enable sealed-bid auctions on the blockchain. Built on the Zama fhEVM, it ensures that bid amounts remain encrypted and private until the auction ends, preventing front-running and bid sniping.

![PolyBid Banner](frontend/public/zama-logo.svg)

## 🌟 Features

- **Encrypted Bidding:** Bids are encrypted using Zama's FHE technology. Only the contract can determine the winner without ever revealing losing bids.
- **Privacy by Design:** Bid amounts are never visible on-chain in plaintext.
- **Fair Auctions:** Prevents common auction manipulation tactics like front-running.
- **User-Friendly Interface:** Modern, responsive UI built with React and TailwindCSS.
- **Mobile Optimized:** Fully responsive design for bidding on the go.
- **Profile Management:** Track your auctions, bids, and winnings in a dedicated dashboard.

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity ^0.8.28**
- **Zama fhEVM:** For on-chain encrypted computation
- **Hardhat:** Development environment

### Frontend
- **React 18 + TypeScript**
- **Vite:** Build tool
- **Wagmi v2 + Viem:** Blockchain interaction
- **TailwindCSS:** Styling
- **Framer Motion:** Animations
- **RainbowKit:** Wallet connection

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MetaMask Wallet
- Sepolia ETH (for testnet)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Admuad/PolyBid.git
   cd PolyBid
   ```

2. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install contract dependencies
   cd ../contracts
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the `frontend` directory:
   ```env
   VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
   VITE_PINATA_API_KEY=your_pinata_key
   VITE_PINATA_SECRET_API_KEY=your_pinata_secret
   ```

4. **Run Locally**
   ```bash
   cd frontend
   npm run dev
   ```

## 🏗️ Architecture

PolyBid uses a **Factory Pattern** for creating auctions:

1. **AuctionFactory:** Deploys individual `Auction` contracts.
2. **Auction Contract:** Handles the logic for a single auction:
   - `submitBid()`: Accepts encrypted bids.
   - `closeAuction()`: Ends the auction and determines the winner using FHE.
   - `claimWin()`: Allows the winner to decrypt their bid and claim the item.

## 🔒 Security & Privacy

- **Bid Encryption:** All bids are encrypted client-side before being sent to the contract.
- **On-Chain Computation:** The fhEVM compares encrypted values directly without decryption.
- **Winner Determination:** The contract identifies the highest bidder while keeping all other bids private.

## 📜 License

This project is licensed under the MIT License.

## 🤝 Acknowledgments

- **Zama:** For the groundbreaking FHE technology and fhEVM.
- **Polynomial:** For the inspiration and branding support.
- Built for the **Zama Builder Contest**.

---

<p align="center">
  Built with 💚 by Admuad
</p>
