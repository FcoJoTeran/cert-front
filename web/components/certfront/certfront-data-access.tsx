"use client";

import { getCertificatesProgram, getCertificatesProgramId } from "anchor/src/certfront-exports";
import { useConnection } from "@solana/wallet-adapter-react";
import { Cluster, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import { useMemo } from "react";

interface CertificateArgs {
  certId?: string;
  studentName: string;
  courseName: string;
  date: string;
  issuingCompany: string;
  owner: PublicKey;
}

export function useCertfrontProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();

  const programId = useMemo(
    () => getCertificatesProgramId(cluster.network as Cluster),
    [cluster]
  );

  const program = getCertificatesProgram(provider);

  const accounts = useQuery({
    queryKey: ["certificates", "all", { cluster }],
    queryFn: () => program.account.certificateState.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createCertificate = useMutation<string, Error, CertificateArgs>({
    mutationKey: ["certificate", "create", { cluster }],
    mutationFn: async ({ certId, studentName, courseName, date, issuingCompany, owner }) => {

    if (!certId || !owner) throw new Error("Faltan certId o owner");

    // Calcular PDA del certificado
    const [certificatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(certId), owner.toBuffer()],
      program.programId
    );

      return program.methods
        .createCertificate(certId, studentName, courseName, date, issuingCompany)
        .accounts({
          certificate: certificatePDA,
          owner,
          systemProgram: PublicKey.default,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error al crear certificado: ${error.message}`);
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createCertificate,
  };
}

export function useCertfrontProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useCertfrontProgram();

  const accountQuery = useQuery({
    queryKey: ["certificates", "fetch", { cluster, account }],
    queryFn: () => program.account.certificateState.fetch(account),
  });

  const updateCertificate = useMutation<string, Error, CertificateArgs>({
    mutationKey: ["certificate", "update", { cluster }],
    mutationFn: async ({ studentName, courseName, date, issuingCompany }) => {
      return program.methods
        .updateCertificate(studentName, courseName, date, issuingCompany)
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error al actualizar certificado: ${error.message}`);
    },
  });

  const deleteCertificate = useMutation({
    mutationKey: ["certificate", "delete", { cluster, account }],
    mutationFn: (studentName: string) =>
      program.methods.deleteCertificate(studentName).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error al eliminar certificado: ${error.message}`);
    },
  });

  return {
    accountQuery,
    updateCertificate,
    deleteCertificate,
  };
}