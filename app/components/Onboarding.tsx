'use client';

import { useEffect } from 'react';
import {
  ConnectWallet,
  Wallet,
} from '@coinbase/onchainkit/wallet';
import {
  Avatar,
  Name,
  Identity,
} from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { isConnected, address } = useAccount();

  useEffect(() => {
    if (isConnected) {
      setTimeout(() => {
        onComplete();
      }, 1200);
    }
  }, [isConnected, onComplete]);

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="text-center">
        {!isConnected ? (
          <div className="animate-fade-in">
            {/* Logo */}
            <div className="w-20 h-20 mx-auto mb-8 bg-black rounded-lg flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            
            {/* Title */}
            <h1 className="text-5xl font-bold text-black mb-3 tracking-tight">
              StickyChain
            </h1>
            <p className="text-gray-500 mb-12 text-lg">
              Collaborative onchain sticky notes
            </p>

            {/* Connect Button */}
            <div className="flex justify-center">
              <Wallet>
                <ConnectWallet>
                  <div className="bg-black hover:bg-gray-800 text-white font-medium px-8 py-4 rounded-lg transition-colors text-lg flex items-center justify-center cursor-pointer">
                    Connect wallet
                  </div>
                </ConnectWallet>
              </Wallet>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto mb-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-black mb-2">Connected</h2>
            {address && (
              <Identity address={address} className="flex items-center justify-center gap-2 mb-8">
                <Avatar className="h-5 w-5 border border-gray-300 rounded-full bg-gray-100" />
                <Name className="text-black font-medium" />
              </Identity>
            )}
            
            <div className="text-gray-500">Loading workspace...</div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}