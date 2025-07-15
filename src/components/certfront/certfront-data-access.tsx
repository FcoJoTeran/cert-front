import {
  CertfrontAccount,
  getCloseInstruction,
  getCertfrontProgramAccounts,
  getCertfrontProgramId,
  getDecrementInstruction,
  getIncrementInstruction,
  getInitializeInstruction,
  getSetInstruction,
} from '@project/anchor'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { generateKeyPairSigner } from 'gill'
import { useWalletUi } from '@wallet-ui/react'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { useClusterVersion } from '@/components/cluster/use-cluster-version'
import { toastTx } from '@/components/toast-tx'
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer'
import { install as installEd25519 } from '@solana/webcrypto-ed25519-polyfill'

// polyfill ed25519 for browsers (to allow `generateKeyPairSigner` to work)
installEd25519()

export function useCertfrontProgramId() {
  const { cluster } = useWalletUi()
  return useMemo(() => getCertfrontProgramId(cluster.id), [cluster])
}

export function useCertfrontProgram() {
  const { client, cluster } = useWalletUi()
  const programId = useCertfrontProgramId()
  const query = useClusterVersion()

  return useQuery({
    retry: false,
    queryKey: ['get-program-account', { cluster, clusterVersion: query.data }],
    queryFn: () => client.rpc.getAccountInfo(programId).send(),
  })
}

export function useCertfrontInitializeMutation() {
  const { cluster } = useWalletUi()
  const queryClient = useQueryClient()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()

  return useMutation({
    mutationFn: async () => {
      const certfront = await generateKeyPairSigner()
      return await signAndSend(getInitializeInstruction({ payer: signer, certfront }), signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx)
      await queryClient.invalidateQueries({ queryKey: ['certfront', 'accounts', { cluster }] })
    },
    onError: () => toast.error('Failed to run program'),
  })
}

export function useCertfrontDecrementMutation({ certfront }: { certfront: CertfrontAccount }) {
  const invalidateAccounts = useCertfrontAccountsInvalidate()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()

  return useMutation({
    mutationFn: async () => await signAndSend(getDecrementInstruction({ certfront: certfront.address }), signer),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}

export function useCertfrontIncrementMutation({ certfront }: { certfront: CertfrontAccount }) {
  const invalidateAccounts = useCertfrontAccountsInvalidate()
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()

  return useMutation({
    mutationFn: async () => await signAndSend(getIncrementInstruction({ certfront: certfront.address }), signer),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}

export function useCertfrontSetMutation({ certfront }: { certfront: CertfrontAccount }) {
  const invalidateAccounts = useCertfrontAccountsInvalidate()
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()

  return useMutation({
    mutationFn: async (value: number) =>
      await signAndSend(
        getSetInstruction({
          certfront: certfront.address,
          value,
        }),
        signer,
      ),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}

export function useCertfrontCloseMutation({ certfront }: { certfront: CertfrontAccount }) {
  const invalidateAccounts = useCertfrontAccountsInvalidate()
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()

  return useMutation({
    mutationFn: async () => {
      return await signAndSend(getCloseInstruction({ payer: signer, certfront: certfront.address }), signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}

export function useCertfrontAccountsQuery() {
  const { client } = useWalletUi()

  return useQuery({
    queryKey: useCertfrontAccountsQueryKey(),
    queryFn: async () => await getCertfrontProgramAccounts(client.rpc),
  })
}

function useCertfrontAccountsInvalidate() {
  const queryClient = useQueryClient()
  const queryKey = useCertfrontAccountsQueryKey()

  return () => queryClient.invalidateQueries({ queryKey })
}

function useCertfrontAccountsQueryKey() {
  const { cluster } = useWalletUi()

  return ['certfront', 'accounts', { cluster }]
}
