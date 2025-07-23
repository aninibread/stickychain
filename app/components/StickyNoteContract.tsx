'use client';

import { useState } from 'react';
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from '@coinbase/onchainkit/transaction';
import type { LifecycleStatus } from '@coinbase/onchainkit/transaction';
import { encodeFunctionData } from 'viem';

interface StickyNoteContractProps {
  content: string;
  x: number;
  y: number;
  color: string;
  onSuccess: () => void;
  onError: () => void;
}

// TODO: Replace with actual deployed contract address
const STICKY_NOTES_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || null;
const STICKY_NOTES_ABI = [
  {
    inputs: [
      { name: 'content', type: 'string' },
      { name: 'x', type: 'uint256' },
      { name: 'y', type: 'uint256' },
      { name: 'color', type: 'string' }
    ],
    name: 'createNote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

export default function StickyNoteContract({ 
  content, 
  x, 
  y, 
  color, 
  onSuccess, 
  onError 
}: StickyNoteContractProps) {
  const [transactionHash, setTransactionHash] = useState<string>('');

  const handleOnStatus = (status: LifecycleStatus) => {
    console.log('Transaction status:', status);
    
    if (status.statusName === 'success') {
      if (status.statusData.transactionReceipts && status.statusData.transactionReceipts.length > 0) {
        setTransactionHash(status.statusData.transactionReceipts[0].transactionHash);
      }
      onSuccess();
    }
    
    if (status.statusName === 'error') {
      console.error('Transaction error:', status.statusData);
      onError();
    }
  };

  // For demo purposes, skip the actual blockchain transaction
  if (!STICKY_NOTES_CONTRACT_ADDRESS) {
    return (
      <div className="w-full">
        <button
          onClick={() => {
            // Simulate success after a brief delay for demo
            setTimeout(() => {
              onSuccess();
            }, 1000);
          }}
          className="w-full px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
        >
          Post Note (Demo Mode)
        </button>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Demo mode - notes stored locally
        </div>
      </div>
    );
  }

  const calls = [{
    to: STICKY_NOTES_CONTRACT_ADDRESS as `0x${string}`,
    data: encodeFunctionData({
      abi: STICKY_NOTES_ABI,
      functionName: 'createNote',
      args: [content, BigInt(x), BigInt(y), color]
    })
  }];

  return (
    <div className="w-full">
      <Transaction
        chainId={84532} // Base Sepolia testnet
        calls={calls}
        onStatus={handleOnStatus}
      >
        <TransactionButton
          className="w-full px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors disabled:opacity-50"
          text="Submit Transaction"
        />
        <TransactionSponsor />
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
      </Transaction>
      
      {transactionHash && (
        <div className="mt-2 text-xs text-gray-500">
          <a 
            href={`https://sepolia.basescan.org/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black transition-colors"
          >
            View transaction →
          </a>
        </div>
      )}
    </div>
  );
}