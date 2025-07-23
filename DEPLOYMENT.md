# Onchain Sticky Notes - Deployment Guide

## Smart Contract Setup

To make this app fully functional onchain, you'll need to deploy a smart contract. Here's a sample Solidity contract:

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
    
    event NoteCreated(
        uint256 indexed noteId,
        address indexed author,
        string content,
        uint256 x,
        uint256 y,
        string color
    );
    
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
        
        emit NoteCreated(notes.length - 1, msg.sender, content, x, y, color);
    }
    
    function getNotes() external view returns (Note[] memory) {
        return notes;
    }
    
    function getNotesCount() external view returns (uint256) {
        return notes.length;
    }
}
```

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