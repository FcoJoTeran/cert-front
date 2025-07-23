"use client";

import { PublicKey } from "@solana/web3.js";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import {
  useCertfrontProgram,
  useCertfrontProgramAccount,
} from "./certfront-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { toast } from "react-toastify";

// CREAR CERTIFICADO
export function CertfrontCreate() {
  const { createEntry } = useCertfrontProgram();
  const { publicKey } = useWallet();

  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [date, setDate] = useState("");
  const [issuingCompany, setIssuingCompany] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const isFormValid =
    studentName.trim() !== "" &&
    courseName.trim() !== "" &&
    date.trim() !== "" &&
    issuingCompany.trim() !== "";
    pdfFile !== null;
  
  
  const handleSubmit = async () => {
    if (!publicKey || !isFormValid) return;

    // Construir formData para el backend
    const formData = new FormData();
    formData.append("studentName", studentName);
    formData.append("courseName", courseName);
    formData.append("date", date);
    formData.append("issuingCompany", issuingCompany)
    formData.append("file", pdfFile as File);

    let certId = "";
    try {
      const response = await fetch("/api/certificates", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error al subir el certificado");

      const data = await response.json();
      certId = data.certId;

      // Aquí invocas el contrato si todo salió bien
      await createEntry.mutateAsync({
        certId,
        studentName,
        courseName,
        issuingCompany,
        date,
        owner: publicKey,
      });

      toast.success("Certificado registrado en blockchain");
      // Limpia el formulario
      setStudentName("");
      setCourseName("");
      setDate("");
      setIssuingCompany("");
      setPdfFile(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Error al procesar el certificado: " + err.message);
    }
  };  
  

  if (!publicKey) return <p>Conecta tu billetera</p>;

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
        type="text"
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
      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={createEntry.isPending || !isFormValid}
      >
        Crear Certificado {createEntry.isPending && "..."}
      </button>
    </div>
  );
}

// LISTAR CERTIFICADOS
export function CertfrontList() {
  const { accounts, getProgramAccount } = useCertfrontProgram();

  if (getProgramAccount.isLoading)
    return <span className="loading loading-spinner loading-lg"></span>;

  if (!getProgramAccount.data?.value)
    return (
      <div className="flex justify-center alert alert-info">
        <span>
        Asegúrate de haber desplegado el programa y estar en la red correcta.
          </span>
      </div>
    );

  return (
    <div className={"space-y-6"}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.data?.map((account) => (
            <CertfrontCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No hay cuentas registradas</h2>
          No hay cuentas registradas, crea una para comenzar.
        </div>
      )}
    </div>
  );
}

// TARJETA INDIVIDUAL DE CERTIFICADO
function CertfrontCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useCertfrontProgramAccount({ account });
  const { publicKey } = useWallet();

  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [date, setDate] = useState("");
  const [issuingCompany, setIssuingCompany] = useState("");

  const isFormValid =
  studentName.trim() !== "" &&
  courseName.trim() !== "" &&
  date.trim() !== "" &&
  issuingCompany.trim() !== "";

  const handleUpdate = () => {
    if (publicKey && isFormValid) {
      updateEntry.mutateAsync({
        studentName,
        courseName,
        date,
        issuingCompany,
        owner: publicKey,
      });
    }
  };

  const handleDelete = () => {
    const originalStudent = accountQuery.data?.studentName;
    if (
      originalStudent &&
      window.confirm("¿Estás seguro de eliminar este certificado?")
    ) {
      deleteEntry.mutateAsync(originalStudent);
    }
  };

  if (!publicKey) return <p>Conecta tu billetera</p>;

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg" />
  ) : (
    <div className="card card-bordered border-4 border-base-300 text-neutral-content">
      <div className="card-body text-center">
        <h2 className="card-title">{accountQuery.data?.studentName}</h2>
        <p>Curso: {accountQuery.data?.courseName}</p>
        <p>Fecha: {accountQuery.data?.date}</p>
        <p>Empresa: {accountQuery.data?.issuingCompany}</p>

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
            disabled={updateEntry.isPending || !isFormValid}
          >
            Actualizar {updateEntry.isPending && "..."}
          </button>
          <button
            className="btn btn-secondary btn-outline"
            onClick={handleDelete}
            disabled={deleteEntry.isPending}
          >
            Eliminar
          </button>
          <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
        </div>
      </div>
    </div>
  );
}
