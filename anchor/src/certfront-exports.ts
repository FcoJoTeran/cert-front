// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
//import * as anchor from "@coral-xyz/anchor";
import { Cluster, PublicKey } from "@solana/web3.js";
import * as CertificatesIDL from "anchor/target/idl/certificates.json";
//import type { Certificates } from "../target/types/certificates";

// Re-export the generated IDL and type
//export { Certificates, CertificatesIDL };
export {CertificatesIDL};

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const CERTIFICATES_PROGRAM_ID = new PublicKey(
  "Bgw2cgw5iAufJ2ZwMTdhSP1gTGWg74buvgtyq2NhzM6M"
);

// This is a helper function to get the Certificates Anchor program.
export function getCertificatesProgram(provider: AnchorProvider) {
  return new Program(CertificatesIDL as Idl, provider);
}

// This is a helper function to get the program ID for the Certificates program depending on the cluster.
export function getCertificatesProgramId(cluster: Cluster) {
  switch (cluster) {
    case "devnet":
    case "testnet":
    case "mainnet-beta":
    default:
      return CERTIFICATES_PROGRAM_ID;
  }
}