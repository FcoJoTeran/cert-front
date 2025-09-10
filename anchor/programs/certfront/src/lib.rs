use anchor_lang::prelude::*;

declare_id!("Bgw2cgw5iAufJ2ZwMTdhSP1gTGWg74buvgtyq2NhzM6M");

#[program]
pub mod certificates {
    use super::*;

    pub fn create_certificate(
        ctx: Context<CreateCertificate>,
        cert_id: String,
        cid: String,
        student_name: String,
        course_name: String,
        issuing_company: String,
        date: String,
        hours: u32,
        city: String,
        expiration: String,
        cert_type: String,
    ) -> Result<()> {
        msg!("Creating certificate...");
        let cert = &mut ctx.accounts.certificate;
        cert.owner = ctx.accounts.owner.key();
        cert.cert_id = cert_id;
        cert.cid = cid;
        cert.student_name = student_name;
        cert.course_name = course_name;
        cert.issuing_company = issuing_company;
        cert.date = date;
        cert.hours = hours;
        cert.city = city;
        cert.expiration = expiration;
        cert.cert_type = cert_type;
        Ok(())
    }

    pub fn update_certificate(
        ctx: Context<UpdateCertificate>,
        cid: String,
        student_name: String,
        course_name: String,
        issuing_company: String,
        date: String,
        hours: u32,
        city: String,
        expiration: String,
        cert_type: String,
    ) -> Result<()> {
        msg!("Updating certificate...");
        let cert = &mut ctx.accounts.certificate;
        cert.cid = cid;
        cert.student_name = student_name;
        cert.course_name = course_name;
        cert.issuing_company = issuing_company;
        cert.date = date;
        cert.hours = hours;
        cert.city = city;
        cert.expiration = expiration;
        cert.cert_type = cert_type;
        Ok(())
    }

    pub fn delete_certificate(
        _ctx: Context<DeleteCertificate>,
        cert_id: String
    ) -> Result<()> {
        msg!("Deleting certificate with ID: {}", cert_id);
        Ok(())
    }
}

#[account]
pub struct CertificateState {
    pub owner: Pubkey,
    pub cert_id: String,
    pub cid: String,
    pub student_name: String,
    pub course_name: String,
    pub issuing_company: String,
    pub date: String,
    pub hours: u32,
    pub city: String,
    pub expiration: String,
    pub cert_type: String,
}

#[derive(Accounts)]
#[instruction(cert_id: String)]
pub struct CreateCertificate<'info> {
    #[account(
        init,
        seeds = [cert_id.as_bytes(), owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + 32
            + (4 + 100)  // cert_id
            + (4 + 100)  // cid
            + (4 + 100)  // student_name
            + (4 + 100)  // course_name
            + (4 + 100)  // issuing_company
            + (4 + 20)   // date
            + 4          // hours
            + (4 + 50)   // city
            + (4 + 20)   // expiration
            + (4 + 20),  // cert_type
    )]
    pub certificate: Account<'info, CertificateState>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(cert_id: String)]
pub struct UpdateCertificate<'info> {
    #[account(
        mut,
        seeds = [cert_id.as_bytes(), owner.key().as_ref()],
        bump,
    )]
    pub certificate: Account<'info, CertificateState>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(cert_id: String)]
pub struct DeleteCertificate<'info> {
    #[account(
        mut,
        seeds = [cert_id.as_bytes(), owner.key().as_ref()],
        bump,
        close = owner,
    )]
    pub certificate: Account<'info, CertificateState>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}
