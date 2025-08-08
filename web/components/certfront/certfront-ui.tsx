'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
// import { useMemo } from 'react';
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCertfrontProgram, useCertfrontProgramAccount } from './certfront-data-access'
import { useWallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { PinataSDK } from 'pinata'

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY!,
})
console.log(process.env.NEXT_PUBLIC_PINATA_GATEWAY)
export function CertfrontCreate() {
  const { createCertificate } = useCertfrontProgram()
  const { publicKey } = useWallet()
  const [studentName, setStudentName] = useState('')
  const [courseName, setCourseName] = useState('')
  const [date, setDate] = useState('')
  const [issuingCompany, setIssuingCompany] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const isFormValid =
    studentName.trim() !== '' &&
    courseName.trim() !== '' &&
    date.trim() !== '' &&
    issuingCompany.trim() !== '' &&
    pdfFile !== null

  const handleSubmit = async () => {
    if (!publicKey || !isFormValid) return

    // Construir formData para el backend
    const formData = new FormData()
    formData.append('studentName', studentName)
    formData.append('courseName', courseName)
    formData.append('date', date)
    formData.append('issuingCompany', issuingCompany)
    formData.append('file', pdfFile as File)

    let certId = ''
    try {
      // 1. Normalizar el nombre del curso
      const normalizedGroupName = courseName.trim().toUpperCase()

      // 2. Verificar si el grupo ya existe en Pinata
      const groupsList = await pinata.groups.public.list().name(normalizedGroupName)

      let groupId: string

      if (groupsList && groupsList.groups && groupsList.groups.length > 0) {
        // Grupo encontrado
        groupId = groupsList.groups[0].id
        console.log(`Grupo encontrado: ${normalizedGroupName} (ID: ${groupId})`)
      } else {
        // 3. Crear grupo si no existe
        const newGroup = await pinata.groups.public.create({
          name: normalizedGroupName,
        })
        groupId = newGroup.id
        console.log(`Grupo creado: ${normalizedGroupName} (ID: ${groupId})`)
      }

      // 4. Subir el archivo a Pinata y asignarlo al grupo
      const upload = await pinata.upload.public.file(pdfFile).group(groupId)

      console.log('Archivo subido a IPFS con CID:', upload.cid)

      // 5. Usar CID como certId
      const certId = upload.cid.slice(0, 32)

      // 6. Guardar en el smart contract
      await createCertificate.mutateAsync({
        certId,
        studentName,
        courseName: normalizedGroupName,
        date,
        issuingCompany,
        owner: publicKey,
      })

      toast.success('Certificado registrado en blockchain')
      // Limpia el formulario
      setStudentName('')
      setCourseName('')
      setDate('')
      setIssuingCompany('')
      setPdfFile(null)
    } catch (err: any) {
      console.error(err)
      toast.error('Error al procesar el certificado: ' + err.message)
    }
  }

  if (!publicKey) return <p>Conecta tu billetera</p>

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Estudiante"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <input
        type="text"
        placeholder="Curso"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <input
        type="date"
        placeholder="Fecha"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <input
        type="text"
        placeholder="Empresa emisora"
        value={issuingCompany}
        onChange={(e) => setIssuingCompany(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
        className="file-input file-input-bordered w-full max-w-xs"
      />
      <button className="btn btn-primary" onClick={handleSubmit} disabled={createCertificate.isPending || !isFormValid}>
        Crear Certificado {createCertificate.isPending && '...'}
      </button>
    </div>
  )
}

// LISTAR CERTIFICADOS
export function CertfrontList() {
  const { accounts, getProgramAccount } = useCertfrontProgram()

  if (getProgramAccount.isLoading) return <span className="loading loading-spinner loading-lg"></span>

  if (!getProgramAccount.data?.value)
    return (
      <div className="flex justify-center alert alert-info">
        <span>Asegúrate de haber desplegado el programa y estar en la red correcta.</span>
      </div>
    )

  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.data?.map((account: { publicKey: PublicKey }) => (
            <CertfrontCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No hay cuentas registradas</h2>
          No hay cuentas registradas, crea una para comenzar.
        </div>
      )}
    </div>
  )
}

// TARJETA INDIVIDUAL DE CERTIFICADO
function CertfrontCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateCertificate, deleteCertificate } = useCertfrontProgramAccount({ account })
  const { publicKey } = useWallet()

  const [studentName, setStudentName] = useState('')
  const [courseName, setCourseName] = useState('')
  const [date, setDate] = useState('')
  const [issuingCompany, setIssuingCompany] = useState('')

  const isFormValid =
    studentName.trim() !== '' && courseName.trim() !== '' && date.trim() !== '' && issuingCompany.trim() !== ''

  const handleUpdate = () => {
    if (publicKey && isFormValid) {
      updateCertificate.mutateAsync({
        certId: accountQuery.data.certId,
        studentName,
        courseName,
        date,
        issuingCompany,
        owner: publicKey,
      })
    }
  }

  const handleDelete = () => {
    const certId = accountQuery.data?.certId
    if (certId && publicKey && window.confirm('¿Estás seguro de eliminar este certificado?')) {
      deleteCertificate.mutateAsync({ certId, owner: publicKey })
    }
  }

  if (!publicKey) return <p>Conecta tu billetera</p>

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg" />
  ) : (
    <div className="card card-bordered border-4 border-base-300 text-neutral-content">
      <div className="card-body text-center">
        <h2 className="card-title">{accountQuery.data?.studentName}</h2>
        <p>Curso: {accountQuery.data?.courseName}</p>
        <p>Fecha: {accountQuery.data?.date}</p>
        <p>Empresa: {accountQuery.data?.issuingCompany}</p>
        <a
          href={`https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${accountQuery.data?.certId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Ver certificado
        </a>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Nuevo nombre"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
          <input
            type="text"
            placeholder="Nuevo curso"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
          <input
            type="text"
            placeholder="Nueva fecha"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
          <input
            type="text"
            placeholder="Nueva empresa emisora"
            value={issuingCompany}
            onChange={(e) => setIssuingCompany(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
          <button
            className="btn btn-primary"
            onClick={handleUpdate}
            disabled={updateCertificate.isPending || !isFormValid}
          >
            Actualizar {updateCertificate.isPending && '...'}
          </button>
          <button
            className="btn btn-secondary btn-outline"
            onClick={handleDelete}
            disabled={deleteCertificate.isPending}
          >
            Eliminar
          </button>
          <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
        </div>
      </div>
    </div>
  )
}
