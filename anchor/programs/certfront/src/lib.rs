use anchor_lang::prelude::*;

declare_id!("53BEEq4ztqFLuSiHD3gatfeS5sHVZeS6hkmih1UUnNjG");

#[program]
pub mod certificates {
    use super::*;

    pub fn create_certificate(
        ctx: Context<CreateCertificate>,
        cert_id: String,
        student_name: String,
        course_name: String,
        issuing_company: String,
        date: String,
    ) -> Result<()> {
        msg!("Creating certificate...");
        let cert = &mut ctx.accounts.certificate;
        cert.owner = ctx.accounts.owner.key();
        cert.cert_id = cert_id;
        cert.student_name = student_name;
        cert.course_name = course_name;
        cert.issuing_company = issuing_company;
        cert.date = date;
        Ok(())
    }

    pub fn update_certificate(
        ctx: Context<UpdateCertificate>,
        student_name: String,
        course_name: String,
        issuing_company: String,
        date: String,
    ) -> Result<()> {
        msg!("Updating certificate...");
        let cert = &mut ctx.accounts.certificate;
        cert.student_name = student_name;
        cert.course_name = course_name;
        cert.issuing_company = issuing_company;
        cert.date = date;
        Ok(())
    }

    pub fn delete_certificate(_ctx: Context<DeleteCertificate>, cert_id: String) -> Result<()> {
        msg!("Deleting certificate with ID: {}", cert_id);
        Ok(())
    }
}

#[account]
pub struct CertificateState {
    pub owner: Pubkey,
    pub cert_id: String,
    pub student_name: String,
    pub course_name: String,
    pub issuing_company: String,
    pub date: String,
}

#[derive(Accounts)]
#[instruction(cert_id: String, student_name: String, course_name: String, issuing_company: String, date: String)]
pub struct CreateCertificate<'info> {
    #[account(
        init,
        seeds = [cert_id.as_bytes(), owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + 32 + (4 + cert_id.len()) + (4 + student_name.len()) + (4 + course_name.len()) + (4 + issuing_company.len()) + (4 + date.len()),
    )]
    pub certificate: Account<'info, CertificateState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(cert_id: String, student_name: String, course_name: String, issuing_company: String, date: String)]
pub struct UpdateCertificate<'info> {
    #[account(
        mut,
        seeds = [cert_id.as_bytes(), owner.key().as_ref()],
        bump,
        realloc = 8 + 32 + (4 + cert_id.len()) + (4 + student_name.len()) + (4 + course_name.len()) + (4 + issuing_company.len()) + (4 + date.len()),
        realloc::payer = owner,
        realloc::zero = true,
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
