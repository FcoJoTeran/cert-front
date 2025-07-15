#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");

#[program]
pub mod certfront {
    use super::*;

    pub fn close(_ctx: Context<CloseCertfront>) -> Result<()> {
        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.certfront.count = ctx.accounts.certfront.count.checked_sub(1).unwrap();
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        ctx.accounts.certfront.count = ctx.accounts.certfront.count.checked_add(1).unwrap();
        Ok(())
    }

    pub fn initialize(_ctx: Context<InitializeCertfront>) -> Result<()> {
        Ok(())
    }

    pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
        ctx.accounts.certfront.count = value.clone();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeCertfront<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  init,
  space = 8 + Certfront::INIT_SPACE,
  payer = payer
    )]
    pub certfront: Account<'info, Certfront>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseCertfront<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
  mut,
  close = payer, // close account and return lamports to payer
    )]
    pub certfront: Account<'info, Certfront>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub certfront: Account<'info, Certfront>,
}

#[account]
#[derive(InitSpace)]
pub struct Certfront {
    count: u8,
}
