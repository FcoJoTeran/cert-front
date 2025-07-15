import { ellipsify } from '@wallet-ui/react'
import {
  useCertfrontAccountsQuery,
  useCertfrontCloseMutation,
  useCertfrontDecrementMutation,
  useCertfrontIncrementMutation,
  useCertfrontInitializeMutation,
  useCertfrontProgram,
  useCertfrontProgramId,
  useCertfrontSetMutation,
} from './certfront-data-access'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExplorerLink } from '../cluster/cluster-ui'
import { CertfrontAccount } from '@project/anchor'
import { ReactNode } from 'react'

export function CertfrontProgramExplorerLink() {
  const programId = useCertfrontProgramId()

  return <ExplorerLink address={programId.toString()} label={ellipsify(programId.toString())} />
}

export function CertfrontList() {
  const certfrontAccountsQuery = useCertfrontAccountsQuery()

  if (certfrontAccountsQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!certfrontAccountsQuery.data?.length) {
    return (
      <div className="text-center">
        <h2 className={'text-2xl'}>No accounts</h2>
        No accounts found. Initialize one to get started.
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {certfrontAccountsQuery.data?.map((certfront) => (
        <CertfrontCard key={certfront.address} certfront={certfront} />
      ))}
    </div>
  )
}

export function CertfrontProgramGuard({ children }: { children: ReactNode }) {
  const programAccountQuery = useCertfrontProgram()

  if (programAccountQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!programAccountQuery.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }

  return children
}

function CertfrontCard({ certfront }: { certfront: CertfrontAccount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Certfront: {certfront.data.count}</CardTitle>
        <CardDescription>
          Account: <ExplorerLink address={certfront.address} label={ellipsify(certfront.address)} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 justify-evenly">
          <CertfrontButtonIncrement certfront={certfront} />
          <CertfrontButtonSet certfront={certfront} />
          <CertfrontButtonDecrement certfront={certfront} />
          <CertfrontButtonClose certfront={certfront} />
        </div>
      </CardContent>
    </Card>
  )
}

export function CertfrontButtonInitialize() {
  const mutationInitialize = useCertfrontInitializeMutation()

  return (
    <Button onClick={() => mutationInitialize.mutateAsync()} disabled={mutationInitialize.isPending}>
      Initialize Certfront {mutationInitialize.isPending && '...'}
    </Button>
  )
}

export function CertfrontButtonIncrement({ certfront }: { certfront: CertfrontAccount }) {
  const incrementMutation = useCertfrontIncrementMutation({ certfront })

  return (
    <Button variant="outline" onClick={() => incrementMutation.mutateAsync()} disabled={incrementMutation.isPending}>
      Increment
    </Button>
  )
}

export function CertfrontButtonSet({ certfront }: { certfront: CertfrontAccount }) {
  const setMutation = useCertfrontSetMutation({ certfront })

  return (
    <Button
      variant="outline"
      onClick={() => {
        const value = window.prompt('Set value to:', certfront.data.count.toString() ?? '0')
        if (!value || parseInt(value) === certfront.data.count || isNaN(parseInt(value))) {
          return
        }
        return setMutation.mutateAsync(parseInt(value))
      }}
      disabled={setMutation.isPending}
    >
      Set
    </Button>
  )
}

export function CertfrontButtonDecrement({ certfront }: { certfront: CertfrontAccount }) {
  const decrementMutation = useCertfrontDecrementMutation({ certfront })

  return (
    <Button variant="outline" onClick={() => decrementMutation.mutateAsync()} disabled={decrementMutation.isPending}>
      Decrement
    </Button>
  )
}

export function CertfrontButtonClose({ certfront }: { certfront: CertfrontAccount }) {
  const closeMutation = useCertfrontCloseMutation({ certfront })

  return (
    <Button
      variant="destructive"
      onClick={() => {
        if (!window.confirm('Are you sure you want to close this account?')) {
          return
        }
        return closeMutation.mutateAsync()
      }}
      disabled={closeMutation.isPending}
    >
      Close
    </Button>
  )
}
