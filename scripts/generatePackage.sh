#!/bin/bash

# Function to convert to kebab-case
to_kebab_case() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | \
    sed -E 's/[^a-zA-Z0-9]/-/g' | \
    sed -E 's/-+/-/g' | \
    sed -E 's/^-+|-+$//g'
}

# Get package name from user
read -p "Enter package name: " package_name
package_name=$(to_kebab_case "$package_name")

# Create directory structure
mkdir -p "packages/$package_name/src/lib"

# Create tsconfig.json
cat > "packages/$package_name/tsconfig.json" << EOL
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["./**/*.ts"],
  "exclude": ["jest.config.ts"]
}
EOL

# Create package.json
cat > "packages/$package_name/package.json" << EOL
{
  "name": "@weeklyhackathon/$package_name",
  "version": "0.0.1",
  "private": true,
  "main": "./index.ts",
  "scripts": {
    "test": "npx jest"
  },
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/lib/*.ts"
  }
}
EOL

# Create jest.config.ts
cat > "packages/$package_name/jest.config.ts" << EOL
export default {
  displayName: '$package_name',
  preset: '../../jest.config.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?\$': ['@swc/jest',
    {
      jsc: { baseUrl: '.' }
    }],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage'
};
EOL

# Create empty index.ts
touch "packages/$package_name/src/index.ts"

echo "Package $package_name has been generated successfully!"

