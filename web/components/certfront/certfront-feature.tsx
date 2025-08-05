'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useCertfrontProgram } from './certfront-data-access';
import { CertfrontCreate, CertfrontList } from './certfront-ui';

export default function CertfrontFeature() {
  const { publicKey } = useWallet();
  const { programId } = useCertfrontProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="My Solana Certfront"
        subtitle={
          'Create your certfront here!'
        }
      >
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <CertfrontCreate />
      </AppHero>
      <CertfrontList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
