'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';

interface OnchainStickyNote {
  id: string;
  content: string;
  x: number;
  y: number;
  author: string;
  color: string;
  timestamp: number;
}

const STICKY_NOTES_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` | undefined;
const STICKY_NOTES_ABI = [
  {
    inputs: [],
    name: 'getNotes',
    outputs: [
      {
        components: [
          { name: 'content', type: 'string' },
          { name: 'x', type: 'uint256' },
          { name: 'y', type: 'uint256' },
          { name: 'color', type: 'string' },
          { name: 'author', type: 'address' },
          { name: 'timestamp', type: 'uint256' }
        ],
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'noteId', type: 'uint256' },
      { indexed: true, name: 'author', type: 'address' }
    ],
    name: 'NoteCreated',
    type: 'event'
  }
] as const;

export function useStickyNotes() {
  const { address, isConnected, chain } = useAccount();
  const [notes, setNotes] = useState<OnchainStickyNote[]>([]);
  const [forceRefetch, setForceRefetch] = useState(0);

  // Debug wallet connection
  console.log('=== WALLET STATUS ===');
  console.log('- Connected:', isConnected);
  console.log('- Address:', address);
  console.log('- Chain ID:', chain?.id);
  console.log('- Chain Name:', chain?.name);
  console.log('- Expected Chain IDs: 84532 (Base Sepolia) or 8453 (Base Mainnet)');
  console.log('====================');

  // Read notes from contract with aggressive retry strategy
  const { data: contractNotes, error, refetch } = useReadContract({
    address: STICKY_NOTES_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    abi: STICKY_NOTES_ABI,
    functionName: 'getNotes',
    query: {
      enabled: !!STICKY_NOTES_CONTRACT_ADDRESS && isConnected && (chain?.id === 84532 || chain?.id === 8453),
      refetchInterval: 2000, // More frequent refetch
      retry: (failureCount, error) => {
        // Retry up to 10 times for connection-related errors
        if (failureCount < 10) {
          console.log(`🔄 RETRY ATTEMPT ${failureCount + 1}/10 for blockchain connection`);
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 0, // Always consider data stale
      cacheTime: 0, // Don't cache to ensure fresh data
    }
  });

  // Debug contract call details
  console.log('=== CONTRACT CALL DETAILS ===');
  console.log('- Address:', STICKY_NOTES_CONTRACT_ADDRESS);
  console.log('- Address valid:', STICKY_NOTES_CONTRACT_ADDRESS?.startsWith('0x'));
  console.log('- Address length:', STICKY_NOTES_CONTRACT_ADDRESS?.length);
  console.log('- Query enabled conditions:');
  console.log('  - Has address:', !!STICKY_NOTES_CONTRACT_ADDRESS);
  console.log('  - Is connected:', isConnected);
  console.log('  - On Base network:', chain?.id === 84532 || chain?.id === 8453);
  console.log('  - Overall enabled:', !!STICKY_NOTES_CONTRACT_ADDRESS && isConnected && (chain?.id === 84532 || chain?.id === 8453));
  console.log('=============================');

  // Watch for new notes being created - always call this hook with fallback address
  useWatchContractEvent({
    address: STICKY_NOTES_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    abi: STICKY_NOTES_ABI,
    eventName: 'NoteCreated',
    onLogs() {
      // Refetch notes when new ones are created
      if (STICKY_NOTES_CONTRACT_ADDRESS) {
        refetch();
      }
    },
  });

  // Force refetch when wallet connects to ensure immediate blockchain sync
  useEffect(() => {
    if (isConnected && STICKY_NOTES_CONTRACT_ADDRESS && (chain?.id === 84532 || chain?.id === 8453)) {
      console.log('🔗 WALLET CONNECTED - FORCING IMMEDIATE BLOCKCHAIN REFETCH');
      console.log('Wallet address:', address);
      console.log('Chain:', chain?.name, '(ID:', chain?.id, ')');
      console.log('Contract Address:', STICKY_NOTES_CONTRACT_ADDRESS);
      
      // Force immediate refetch with more aggressive attempts
      const attemptRefetch = async (attempt = 1) => {
        console.log(`🚀 EXECUTING FORCED REFETCH ATTEMPT ${attempt} FOR WALLET CONNECTION`);
        try {
          const result = await refetch();
          console.log(`✅ REFETCH ATTEMPT ${attempt} SUCCESSFUL`);
          console.log('Refetch result:', result);
          
          // If we got data, log it immediately
          if (result.data && Array.isArray(result.data)) {
            console.log(`🎯 IMMEDIATE RESULT: ${result.data.length} notes found`);
            console.log('Notes data:', result.data);
          } else {
            console.log('🎯 IMMEDIATE RESULT: No data returned yet');
          }
        } catch (error) {
          console.log(`❌ REFETCH ATTEMPT ${attempt} FAILED:`, error);
          if (attempt < 8) {
            // Retry up to 8 times with shorter delays
            setTimeout(() => attemptRefetch(attempt + 1), 500 * attempt);
          }
        }
      };
      
      // Start immediately with very aggressive retries
      attemptRefetch();
      const intervals = [
        setTimeout(() => attemptRefetch(2), 200),
        setTimeout(() => attemptRefetch(3), 600), 
        setTimeout(() => attemptRefetch(4), 1200),
        setTimeout(() => attemptRefetch(5), 2000),
        setTimeout(() => attemptRefetch(6), 3000),
        setTimeout(() => attemptRefetch(7), 5000),
        setTimeout(() => attemptRefetch(8), 8000)
      ];
      
      return () => {
        intervals.forEach(clearTimeout);
      };
    }
  }, [isConnected, address, chain?.id, refetch]);

  // Process contract data when it changes - PURE BLOCKCHAIN READING ONLY
  useEffect(() => {
    console.log('=== BLOCKCHAIN READ STATUS ===');
    console.log('🔗 READING FROM BLOCKCHAIN - NO SESSION/LOCALSTORAGE');
    console.log('Contract address:', STICKY_NOTES_CONTRACT_ADDRESS);
    console.log('Contract notes data:', contractNotes);
    console.log('Contract error:', error);
    console.log('Error type:', error?.name);
    console.log('Error message:', error?.message);
    console.log('Data source: BLOCKCHAIN ONLY');
    console.log('Is connected:', isConnected);
    console.log('Chain ID:', chain?.id);

    if (STICKY_NOTES_CONTRACT_ADDRESS) {
      if (contractNotes && Array.isArray(contractNotes)) {
        console.log('✅ BLOCKCHAIN READ SUCCESS:', contractNotes.length, 'notes from smart contract');
        console.log('🌐 Network:', chain?.name, `(Chain ID: ${chain?.id})`);
        console.log('📦 Raw blockchain data:', contractNotes);
        
        if (contractNotes.length === 0) {
          console.log('📝 CONTRACT IS EMPTY - No notes have been created yet on this network');
          console.log('🎯 This is normal for a new contract or different network');
        }
        
        // Transform contract data to our format - DIRECT FROM BLOCKCHAIN
        const transformedNotes: OnchainStickyNote[] = contractNotes.map((note, index) => {
          console.log(`🔗 Processing blockchain note ${index}:`, {
            content: note.content,
            x: note.x.toString(),
            y: note.y.toString(),
            color: note.color,
            author: note.author,
            timestamp: note.timestamp.toString()
          });
          return {
            id: index.toString(),
            content: note.content,
            x: Number(note.x),
            y: Number(note.y),
            color: note.color,
            author: note.author,
            timestamp: Number(note.timestamp)
          };
        });
        
        console.log('✅ FINAL BLOCKCHAIN NOTES TO DISPLAY:', transformedNotes);
        console.log('🚫 NO SESSION/LOCALSTORAGE USED - PURE ONCHAIN DATA');
        setNotes(transformedNotes);
      } else if (error) {
        console.log('❌ BLOCKCHAIN READ FAILED:', error);
        console.log('This likely means:');
        console.log('1. Contract not deployed at this address');
        console.log('2. Contract missing getNotes function'); 
        console.log('3. Wrong network (need Base Sepolia or Base Mainnet)');
        console.log('4. Network connection issue');
        setNotes([]); // Empty array - no fallback to session storage
      } else if (contractNotes === undefined) {
        console.log('⏳ BLOCKCHAIN READ IN PROGRESS...');
        console.log('🔗 Waiting for smart contract response...');
        console.log('🌐 Current network:', chain?.name, `(ID: ${chain?.id})`);
        console.log('📋 Query enabled:', !!STICKY_NOTES_CONTRACT_ADDRESS && isConnected && (chain?.id === 84532 || chain?.id === 8453));
        // Still loading, but no UI loading state shown
      } else {
        console.log('⚠️ UNEXPECTED BLOCKCHAIN RESPONSE:', contractNotes);
        setNotes([]);
      }
    } else {
      console.log('❌ NO CONTRACT ADDRESS - CANNOT READ FROM BLOCKCHAIN');
      console.log('🚫 NO FALLBACK TO SESSION - ONCHAIN ONLY MODE');
      setNotes([]);
    }
  }, [contractNotes, error]);

  const addNote = (note: Omit<OnchainStickyNote, 'id' | 'timestamp'>) => {
    // 🔗 ONCHAIN ONLY - Notes are added via blockchain transaction only
    // The actual addition happens in the smart contract
    // The contract event will trigger a refetch from blockchain
    console.log('🔗 addNote called - ONCHAIN TRANSACTION ONLY', note);
    console.log('🚫 NO SESSION/LOCALSTORAGE - BLOCKCHAIN ONLY');
    console.log('📝 Note will be added via smart contract transaction');
  };

  // Notes are completely immutable - no local updates allowed
  // All modifications must go through blockchain transactions

  return {
    notes,
    addNote,
    isOnchain: !!STICKY_NOTES_CONTRACT_ADDRESS
  };
}