# StickyChain - Deployment Guide

## Quick Start (Demo Mode)

The app currently runs in **demo mode** with local storage. To enable onchain functionality:

## Option 1: Deploy Your Own Contract

### Smart Contract (Solidity):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract StickyNotes {
    struct Note {
        string content;
        uint256 x;
        uint256 y;
        string color;
        address author;
        uint256 timestamp;
    }
    
    Note[] public notes;
    
    event NoteCreated(uint256 indexed noteId, address indexed author);
    
    function createNote(
        string memory content,
        uint256 x,
        uint256 y,
        string memory color
    ) external {
        notes.push(Note({
            content: content,
            x: x,
            y: y,
            color: color,
            author: msg.sender,
            timestamp: block.timestamp
        }));
        
        emit NoteCreated(notes.length - 1, msg.sender);
    }
    
    function getNotes() external view returns (Note[] memory) {
        return notes;
    }
}
```

### Deploy with Remix (Step-by-Step):

#### 1. Open Remix
- Go to [remix.ethereum.org](https://remix.ethereum.org)
- You'll see a default workspace with sample contracts

#### 2. Create Contract File
- In the **File Explorer** (left sidebar), right-click on the `contracts` folder
- Select **"New File"**
- Name it: `StickyNotes.sol`
- Click the new file to open it

#### 3. Add Contract Code
- Delete any existing content in the file
- Copy and paste the entire contract code from above
- Press `Ctrl+S` (or `Cmd+S`) to save

#### 4. Compile Contract
- Click the **"Solidity Compiler"** tab (second icon in left sidebar)
- Make sure compiler version is `0.8.19` or higher
- Click **"Compile StickyNotes.sol"**
- ✅ You should see a green checkmark when compilation succeeds

#### 5. Deploy Contract
- Click **"Deploy & Run Transactions"** tab (third icon in left sidebar)
- In the **Environment** dropdown, select **"WalletConnect"**
- A QR code will appear - scan it with your mobile wallet OR
- If using browser wallet, click the **"WalletConnect"** option to connect
- **IMPORTANT**: Make sure your wallet is connected to **Base Sepolia** network:
  - Network Name: Base Sepolia
  - RPC URL: `https://sepolia.base.org`
  - Chain ID: `84532`
  - Currency: ETH
  - Block Explorer: `https://sepolia.basescan.org`

**Alternative if WalletConnect doesn't work:**
- Select **"Custom - External Http Provider"**
- Enter RPC URL: `https://sepolia.base.org`
- Then use your browser wallet extension to connect

#### 6. Get Test ETH
- Go to [Base Sepolia Faucet](https://docs.base.org/tools/network-faucets)
- Enter your wallet address
- Get some test ETH (needed for deployment)

#### 7. Deploy
- In Remix, make sure **"StickyNotes"** contract is selected
- Click the orange **"Deploy"** button
- Confirm the transaction in your wallet
- Wait for confirmation (usually 1-2 seconds on Base Sepolia)

#### 8. Copy Contract Address
- After deployment, you'll see the contract under **"Deployed Contracts"**
- Click the copy button next to the contract address
- It will look like: `0x1234567890abcdef...`

### 9. Configure Your App:

Create `.env.local` in your project root:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890abcdef... # Paste your contract address here
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key # Optional - get from OnchainKit
```

### 10. Test Your Contract
- Restart your StickyChain app: `npm run dev`
- Connect your wallet
- Create a new note
- Click "Submit Transaction" (no longer demo mode!)
- Confirm in wallet
- ✅ Your note is now stored onchain!

---

## Troubleshooting

### **Remix Connection Issues:**

**Can't connect wallet in Remix:**
1. Try **WalletConnect** first
2. If that fails, use **Custom - External Http Provider**:
   - Enter: `https://sepolia.base.org`
   - Make sure your browser wallet is on Base Sepolia
3. Refresh Remix and try again

**Wallet not detected:**
- Make sure you have MetaMask or Coinbase Wallet installed
- Try refreshing the Remix page
- Check that your wallet extension is enabled

### **Network Issues:**

**How to check/add Base Sepolia network:**

**For MetaMask:**
1. Open your MetaMask extension
2. Look at the top - it shows your current network (probably "Ethereum Mainnet")
3. Click the network dropdown at the top
4. If you see "Base Sepolia" - click it to switch
5. If you DON'T see "Base Sepolia":
   - Click "Add Network" or "Add a network manually"
   - Enter these details:
     - **Network Name**: `Base Sepolia`
     - **RPC URL**: `https://sepolia.base.org`
     - **Chain ID**: `84532`
     - **Currency Symbol**: `ETH`
     - **Block Explorer**: `https://sepolia.basescan.org`
   - Click "Save"
   - Switch to Base Sepolia

**For Coinbase Wallet:**
1. Open Coinbase Wallet
2. Tap the network switcher (usually shows "Ethereum")
3. Look for "Base Sepolia" in the list
4. If not there, tap "Add Network" and use the same details above

**Quick way to add Base Sepolia:**
- Go to [chainlist.org](https://chainlist.org)
- Search "Base Sepolia"
- Click "Add to MetaMask" button
- Approve in your wallet

**How to verify you're on Base Sepolia:**
- Your wallet should show "Base Sepolia" at the top
- Your ETH balance might show 0 (that's normal - you need test ETH)
- The network should show Chain ID: 84532

### **Deployment Errors:**

**"Insufficient funds" error:**
- Get more test ETH from the Base Sepolia faucet
- Make sure you're on Base Sepolia network, not Ethereum mainnet

**"Wrong network" error:**
- Switch your wallet to Base Sepolia network
- Network details above

**"Contract not found" error:**
- Double-check the contract address in `.env.local`
- Make sure the contract deployed successfully

**"Transaction failed" error:**
- Check you have enough test ETH for gas fees
- Try again - sometimes network congestion causes failures

---

## What Happens When Contract is Deployed?

✅ **Before (Demo Mode):**
- Notes stored in browser localStorage
- Only you can see your notes
- No transaction fees
- Works offline

🔗 **After (Onchain Mode):**
- Notes stored on Base blockchain
- Everyone can see all notes
- Small transaction fee (~$0.001)
- Permanent & decentralized
- Real Web3 app!

## Deployment Steps

1. **Deploy to Base Sepolia (Testnet)**
   - Use Remix, Hardhat, or Foundry
   - Deploy to Base Sepolia testnet (Chain ID: 84532)
   - Get testnet ETH from Base Sepolia faucet

2. **Update Contract Address**
   - Copy the deployed contract address
   - Update `STICKY_NOTES_CONTRACT_ADDRESS` in:
     - `app/components/StickyNoteContract.tsx`
     - `app/hooks/useStickyNotes.ts`

3. **Update Contract ABI**
   - Copy the contract ABI
   - Update `STICKY_NOTES_ABI` in both files above

4. **Environment Variables**
   Create a `.env.local` file:
   ```
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key
   NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
   ```

## Features Implemented

✅ **Wallet Connection**: Connect with Coinbase Wallet, MetaMask, etc.
✅ **Create Notes**: Write content and choose colors
✅ **Drag & Drop**: Move notes around the whiteboard
✅ **Dynamic Sizing**: Notes resize based on content
✅ **Click to Place**: Choose where to place notes
✅ **Transaction Flow**: OnchainKit transaction components
✅ **Real-time Updates**: Notes appear for all users
✅ **Edit Notes**: Double-click to edit content
✅ **Delete Notes**: Remove notes with delete button

## Current Demo Mode

The app currently uses localStorage for demo purposes. Once you deploy the smart contract and update the addresses, it will work fully onchain.

## Base Network Details

- **Mainnet**: Chain ID 8453
- **Testnet (Sepolia)**: Chain ID 84532
- **RPC**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org

## OnchainKit Integration

This app uses OnchainKit's:
- Wallet components for connection
- Transaction components for onchain interactions
- Identity components for user display
- Built-in Base network support