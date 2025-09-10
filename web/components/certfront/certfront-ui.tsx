'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
// import { useMemo } from 'react';
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCertfrontProgram, useCertfrontProgramAccount } from './certfront-data-access'
import { useWallet } from '@solana/wallet-adapter-react'
import { useState, useRef } from 'react'
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
  const [studentLastName, setStudentLastName] = useState('')
  const [courseName, setCourseName] = useState('')
  const [date, setDate] = useState('')
  const [issuingCompany, setIssuingCompany] = useState('')
  const [hours, setHours] = useState(0)
  const [city, setCity] = useState('')
  const [expiration, setExpiration] = useState('')
  const [certType, setCertType] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const isFormValid =
    studentName.trim() !== '' &&
    studentLastName.trim() !== '' &&
    courseName.trim() !== '' &&
    date.trim() !== '' &&
    issuingCompany.trim() !== '' &&
    hours > 0 &&
    city.trim() !== '' &&
    expiration.trim() !== '' &&
    certType.trim() !== '' &&
    pdfFile !== null

  const handleSubmit = async () => {
    if (!publicKey || !isFormValid) return

    // Construir formData para el backend
    const formData = new FormData()
    formData.append('studentName', studentName)
    formData.append('studentLastName', studentLastName)
    formData.append('courseName', courseName)
    formData.append('date', date)
    formData.append('issuingCompany', issuingCompany)
    formData.append('hours', hours.toString())
    formData.append('city', city)
    formData.append('expiration', expiration)
    formData.append('certType', certType)
    formData.append('file', pdfFile as File)

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
      const cid = upload.cid

      // 6. Guardar en el smart contract
      await createCertificate.mutateAsync({
        certId,
        cid,
        studentName,
        studentLastName,
        courseName: normalizedGroupName,
        issuingCompany,
        date,
        hours,
        city,
        expiration,
        certType,
        owner: publicKey,
      })

      toast.success('Certificado registrado en blockchain')
      // Limpia el formulario
      setStudentName('')
      setStudentLastName('')
      setCourseName('')
      setDate('')
      setIssuingCompany('')
      setHours(0)
      setCity('')
      setExpiration('')
      setCertType('')
      setPdfFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      console.error(err)
      toast.error('Error al procesar el certificado: ' + err.message)
    }
  }

  if (!publicKey) return <p>Conecta tu billetera</p>

  return (
    <div className="space-y-4">
      <div className="form-control">
        <label className="label" htmlFor="studentName">
          <span className="label-text">Nombre del estudiante</span>
        </label>
        <input
          id="studentName"
          type="text"
          placeholder="Estudiante"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="input input-bordered w-full max-w-xs"
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="studentLastName">
          <span className="label-text">Apellido del estudiante</span>
        </label>
        <input
          id="studentLastName"
          type="text"
          placeholder="Apellido"
          value={studentLastName}
          onChange={(e) => setStudentLastName(e.target.value)}
          className="input input-bordered w-full max-w-xs"
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="courseName">
          <span className="label-text">Curso</span>
        </label>
        <input
          id="courseName"
          type="text"
          placeholder="Curso"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          className="input input-bordered w-full max-w-xs"
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="date">
          <span className="label-text">Fecha</span>
        </label>
        <input
          id="date"
          type="date"
          placeholder="Fecha"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input input-bordered w-full max-w-xs"
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="issuingCompany">
          <span className="label-text">Empresa emisora</span>
        </label>
        <input
          id="issuingCompany"
          type="text"
          placeholder="Empresa emisora"
          value={issuingCompany}
          onChange={(e) => setIssuingCompany(e.target.value)}
          className="input input-bordered w-full max-w-xs"
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="hours">
          <span className="label-text">Horas</span>
        </label>
        <input
          id="hours"
          type="number"
          placeholder="Horas"
          min="1"
          value={hours}
          onChange={(e) => setHours(parseInt(e.target.value, 10))}
          className="input input-bordered w-full max-w-xs"
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="city">
          <span className="label-text">Ciudad</span>
        </label>
        <input
          id="city"
          type="text"
          placeholder="Ciudad"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="input input-bordered w-full max-w-xs"
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="expiration">
          <span className="label-text">Fecha de expiración</span>
        </label>
        <input
          id="expiration"
          type="date"
          placeholder="Fecha de expiración"
          value={expiration}
          onChange={(e) => setExpiration(e.target.value)}
          className="input input-bordered w-full max-w-xs"
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="certType">
          <span className="label-text">Tipo de certificado</span>
        </label>
        <select
          id="certType"
          value={certType}
          onChange={(e) => setCertType(e.target.value)}
          className="select select-bordered w-full max-w-xs"
        >
          <option value="" disabled>
            Selecciona tipo de certificado
          </option>
          <option value="Asistencia">Asistencia</option>
          <option value="Aprobación">Aprobación</option>
        </select>
      </div>

      <div className="form-control">
        <label className="label" htmlFor="pdfFile">
          <span className="label-text">Archivo PDF</span>
        </label>
        <input
          id="pdfFile"
          type="file"
          accept=".pdf"
          onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
          ref={fileInputRef}
          className="file-input file-input-bordered w-full max-w-xs"
        />
      </div>

      <div className="form-control mt-4">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={createCertificate.isPending || !isFormValid}
        >
          Crear Certificado {createCertificate.isPending && '...'}
        </button>
      </div>
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

  const [showDetails, setShowDetails] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  // Estados de edición
  const [studentName, setStudentName] = useState('')
  const [studentLastName, setStudentLastName] = useState('')
  const [courseName, setCourseName] = useState('')
  const [date, setDate] = useState('')
  const [issuingCompany, setIssuingCompany] = useState('')
  const [hours, setHours] = useState(0)
  const [city, setCity] = useState('')
  const [expiration, setExpiration] = useState('')
  const [certType, setCertType] = useState('')

  const isFormValid =
    studentName.trim() !== '' &&
    studentLastName.trim() !== '' &&
    courseName.trim() !== '' &&
    date.trim() !== '' &&
    issuingCompany.trim() !== '' &&
    hours > 0 &&
    city.trim() !== '' &&
    expiration.trim() !== '' &&
    certType.trim() !== ''

  const handleUpdate = async () => {
    if (!publicKey || !isFormValid) return
    await updateCertificate.mutateAsync({
      certId: accountQuery.data.certId,
      cid: accountQuery.data.cid,
      studentName,
      studentLastName,
      courseName,
      issuingCompany,
      date,
      hours,
      city,
      expiration,
      certType,
      owner: publicKey,
    })
    setShowEdit(false) // cerrar modal después de guardar
  }

  const handleDelete = () => {
    const certId = accountQuery.data?.certId
    if (certId && publicKey && window.confirm('¿Estás seguro de eliminar este certificado?')) {
      deleteCertificate.mutateAsync({ certId, owner: publicKey })
    }
  }

  if (!publicKey) return <p>Conecta tu billetera</p>
  if (accountQuery.isLoading) return <span className="loading loading-spinner loading-lg" />

  return (
    <div className="card card-bordered border-4 border-base-300">
      <div className="card-body text-center">
        <h2 className="card-title">{accountQuery.data?.courseName}</h2>
        <p className="text-sm text-gray-500">
          {accountQuery.data?.studentName} {accountQuery.data?.studentLastName}
        </p>
        <a
          href={`https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${accountQuery.data?.cid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="link link-primary"
        >
          Ver PDF
        </a>

        <div className="justify-center card-actions mt-4 space-x-2">
          <button className="btn btn-primary" onClick={() => setShowDetails(true)}>
            Ver Detalles
          </button>
          <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>
            Editar
          </button>
          <button className="btn btn-outline btn-error" onClick={handleDelete} disabled={deleteCertificate.isPending}>
            Eliminar
          </button>
          <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
        </div>
      </div>

      {/* MODAL DETALLES */}
      {showDetails && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Detalles del Certificado</h3>
            <p>
              <strong>Nombres:</strong> {accountQuery.data?.studentName}
            </p>
            <p>
              <strong>Apellidos:</strong> {accountQuery.data?.studentLastName}
            </p>
            <p>
              <strong>Curso:</strong> {accountQuery.data?.courseName}
            </p>
            <p>
              <strong>Fecha:</strong> {accountQuery.data?.date}
            </p>
            <p>
              <strong>Empresa:</strong> {accountQuery.data?.issuingCompany}
            </p>
            <p>
              <strong>Horas:</strong> {accountQuery.data?.hours}
            </p>
            <p>
              <strong>Ciudad:</strong> {accountQuery.data?.city}
            </p>
            <p>
              <strong>Expiración:</strong> {accountQuery.data?.expiration}
            </p>
            <p>
              <strong>Tipo:</strong> {accountQuery.data?.certType}
            </p>
            <a
              href={`https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${accountQuery.data?.cid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary"
            >
              Ver PDF
            </a>

            <div className="modal-action">
              <button className="btn" onClick={() => setShowDetails(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* MODAL EDITAR */}
      {showEdit && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Editar Certificado</h3>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label" htmlFor="studentName">
                  <span className="label-text">Nombres</span>
                </label>
                <input
                  id="studentName"
                  type="text"
                  placeholder="Nombres"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="studentLastName">
                  <span className="label-text">Apellidos</span>
                </label>
                <input
                  id="studentLastName"
                  type="text"
                  placeholder="Apellidos"
                  value={studentLastName}
                  onChange={(e) => setStudentLastName(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="courseName">
                  <span className="label-text">Curso</span>
                </label>
                <input
                  id="courseName"
                  type="text"
                  placeholder="Curso"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="date">
                  <span className="label-text">Fecha</span>
                </label>
                <input
                  id="date"
                  type="date"
                  placeholder="Fecha"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="issuingCompany">
                  <span className="label-text">Empresa emisora</span>
                </label>
                <input
                  id="issuingCompany"
                  type="text"
                  placeholder="Empresa"
                  value={issuingCompany}
                  onChange={(e) => setIssuingCompany(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="hours">
                  <span className="label-text">Horas</span>
                </label>
                <input
                  id="hours"
                  type="number"
                  placeholder="Horas"
                  min="1"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value, 10))}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="city">
                  <span className="label-text">Ciudad</span>
                </label>
                <input
                  id="city"
                  type="text"
                  placeholder="Ciudad"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="expiration">
                  <span className="label-text">Fecha de expiración</span>
                </label>
                <input
                  id="expiration"
                  type="date"
                  placeholder="Expiración"
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="certType">
                  <span className="label-text">Tipo de certificado</span>
                </label>
                <select
                  id="certType"
                  value={certType}
                  onChange={(e) => setCertType(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="" disabled>
                    Selecciona tipo
                  </option>
                  <option value="Asistencia">Asistencia</option>
                  <option value="Aprobación">Aprobación</option>
                </select>
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={handleUpdate}
                disabled={updateCertificate.isPending || !isFormValid}
              >
                Guardar {updateCertificate.isPending && '...'}
              </button>
              <button className="btn" onClick={() => setShowEdit(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}
