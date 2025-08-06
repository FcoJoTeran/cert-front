/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/certificates.json`.
 */
export type Certificates = {
  address: '53BEEq4ztqFLuSiHD3gatfeS5sHVZeS6hkmih1UUnNjG'
  metadata: {
    name: 'certificates'
    version: '0.1.0'
    spec: '0.1.0'
    description: 'Created with Anchor'
  }
  instructions: [
    {
      name: 'createCertificate'
      discriminator: [238, 189, 143, 29, 100, 80, 70, 10]
      accounts: [
        {
          name: 'certificate'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'arg'
                path: 'certId'
              },
              {
                kind: 'account'
                path: 'owner'
              },
            ]
          }
        },
        {
          name: 'owner'
          writable: true
          signer: true
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'certId'
          type: 'string'
        },
        {
          name: 'studentName'
          type: 'string'
        },
        {
          name: 'courseName'
          type: 'string'
        },
        {
          name: 'issuingCompany'
          type: 'string'
        },
        {
          name: 'date'
          type: 'string'
        },
      ]
    },
    {
      name: 'deleteCertificate'
      discriminator: [153, 12, 152, 31, 165, 196, 10, 95]
      accounts: [
        {
          name: 'certificate'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'arg'
                path: 'certId'
              },
              {
                kind: 'account'
                path: 'owner'
              },
            ]
          }
        },
        {
          name: 'owner'
          writable: true
          signer: true
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'certId'
          type: 'string'
        },
      ]
    },
    {
      name: 'updateCertificate'
      discriminator: [235, 236, 67, 125, 170, 84, 113, 218]
      accounts: [
        {
          name: 'certificate'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'arg'
                path: 'certId'
              },
              {
                kind: 'account'
                path: 'owner'
              },
            ]
          }
        },
        {
          name: 'owner'
          writable: true
          signer: true
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'studentName'
          type: 'string'
        },
        {
          name: 'courseName'
          type: 'string'
        },
        {
          name: 'issuingCompany'
          type: 'string'
        },
        {
          name: 'date'
          type: 'string'
        },
      ]
    },
  ]
  accounts: [
    {
      name: 'certificateState'
      discriminator: [51, 162, 176, 91, 206, 185, 64, 21]
    },
  ]
  types: [
    {
      name: 'certificateState'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'owner'
            type: 'pubkey'
          },
          {
            name: 'certId'
            type: 'string'
          },
          {
            name: 'studentName'
            type: 'string'
          },
          {
            name: 'courseName'
            type: 'string'
          },
          {
            name: 'issuingCompany'
            type: 'string'
          },
          {
            name: 'date'
            type: 'string'
          },
        ]
      }
    },
  ]
}
