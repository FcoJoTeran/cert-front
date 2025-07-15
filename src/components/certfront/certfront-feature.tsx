import { WalletButton } from '../solana/solana-provider'
import { CertfrontButtonInitialize, CertfrontList, CertfrontProgramExplorerLink, CertfrontProgramGuard } from './certfront-ui'
import { AppHero } from '../app-hero'
import { useWalletUi } from '@wallet-ui/react'

export default function CertfrontFeature() {
  const { account } = useWalletUi()

  return (
    <CertfrontProgramGuard>
      <AppHero
        title="Certfront"
        subtitle={
          account
            ? "Initialize a new certfront onchain by clicking the button. Use the program's methods (increment, decrement, set, and close) to change the state of the account."
            : 'Select a wallet to run the program.'
        }
      >
        <p className="mb-6">
          <CertfrontProgramExplorerLink />
        </p>
        {account ? (
          <CertfrontButtonInitialize />
        ) : (
          <div style={{ display: 'inline-block' }}>
            <WalletButton />
          </div>
        )}
      </AppHero>
      {account ? <CertfrontList /> : null}
    </CertfrontProgramGuard>
  )
}
