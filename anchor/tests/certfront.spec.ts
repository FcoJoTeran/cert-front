import * as anchor from '@coral-xyz/anchor';
import { Program, Idl } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import { Certificates } from '../target/types/certificates';
import { CERTIFICATES_PROGRAM_ID, CertificatesIDL } from '../src/certfront-exports';

describe('certificates', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;
  console.log('Payer PublicKey:', payer.publicKey.toString());
  
  console.log('Program ID:', CERTIFICATES_PROGRAM_ID.toString());
  console.log('Program IDL:', CertificatesIDL);

  const program = new Program(CertificatesIDL as Idl, provider);

  // Datos de prueba
  const certId = 'cert-001-xyz';
  const studentName = 'Alice Johnson';
  const courseName = 'Blockchain Fundamentals';
  const issuingCompany = 'Coursera';
  const date = '2025-07-09';

  const updatedStudentName = 'Alice J.';
  const updatedCourseName = 'Advanced Blockchain';
  const updatedIssuingCompany = 'Udemy';
  const updatedDate = '2025-07-10';

  // Derivar la PDA con cert_id + owner
  let certificatePda: PublicKey;
  let bump: number;

  beforeAll(async () => {
    [certificatePda, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(certId), payer.publicKey.toBuffer()],
      program.programId
    );
  });

  console.log('CertId:', certId);
  console.log('Payer PublicKey Buffer:', payer.publicKey.toBuffer());

  it('Create certificate', async () => {
    await program.methods
      .createCertificate(certId, studentName, courseName, issuingCompany, date)
      .accounts({
        certificate: certificatePda,
        owner: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const certAccount = await program.account.CertificateState.fetch(certificatePda);

    expect(certAccount.certId).toBe(certId);
    expect(certAccount.studentName).toBe(studentName);
    expect(certAccount.courseName).toBe(courseName);
    expect(certAccount.issuingCompany).toBe(issuingCompany);
    expect(certAccount.date).toBe(date);
  });

  it('Update certificate', async () => {
    await program.methods
      .updateCertificate(updatedStudentName, updatedCourseName, updatedIssuingCompany, updatedDate)
      .accounts({
        certificate: certificatePda,
        owner: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const certAccount = await program.account.CertificateState.fetch(certificatePda);

    expect(certAccount.studentName).toBe(updatedStudentName);
    expect(certAccount.courseName).toBe(updatedCourseName);
    expect(certAccount.issuingCompany).toBe(updatedIssuingCompany);
    expect(certAccount.date).toBe(updatedDate);
  });

  it('Delete certificate', async () => {
    await program.methods
      .deleteCertificate(certId)
      .accounts({
        certificate: certificatePda,
        owner: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const certAccount = await program.account.certificateState.fetchNullable(certificatePda);
    expect(certAccount).toBeNull();
  });
});
