import type { CodegenConfig } from '@graphql-codegen/cli';

// This configuration generates typed GraphQL artifacts for the frontend app.
// It reads the schema from the backend's SDL file and scans the frontend
// source tree for GraphQL operations embedded in TS/TSX files.
const config: CodegenConfig = {
  schema: '../backend/schema.gql',
  documents: ['src/**/*.{ts,tsx}'],
  generates: {
    'src/gql/': {
      preset: 'client',
      config: {
        useTypeImports: true,
        documentMode: 'string',
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
