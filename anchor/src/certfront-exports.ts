// Here we export some useful types and functions for interacting with the Anchor program.
import { Account, address, getBase58Decoder, SolanaClient } from 'gill'
import { SolanaClusterId } from '@wallet-ui/react'
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded'
import { Certfront, CERTFRONT_DISCRIMINATOR, CERTFRONT_PROGRAM_ADDRESS, getCertfrontDecoder } from './client/js'
import CertfrontIDL from '../target/idl/certfront.json'

export type CertfrontAccount = Account<Certfront, string>

// Re-export the generated IDL and type
export { CertfrontIDL }

// This is a helper function to get the program ID for the Certfront program depending on the cluster.
export function getCertfrontProgramId(cluster: SolanaClusterId) {
  switch (cluster) {
    case 'solana:devnet':
    case 'solana:testnet':
      // This is the program ID for the Certfront program on devnet and testnet.
      return address('6z68wfurCMYkZG51s1Et9BJEd9nJGUusjHXNt4dGbNNF')
    case 'solana:mainnet':
    default:
      return CERTFRONT_PROGRAM_ADDRESS
  }
}

export * from './client/js'

export function getCertfrontProgramAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getCertfrontDecoder(),
    filter: getBase58Decoder().decode(CERTFRONT_DISCRIMINATOR),
    programAddress: CERTFRONT_PROGRAM_ADDRESS,
  })
}
