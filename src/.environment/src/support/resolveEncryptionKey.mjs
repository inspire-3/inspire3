export const resolveEncryptionKey = (encryptionKey) => {
  let resolvedEncryptionKey = process.env?.ENVIRONMENT_ENCRYPTION_KEY ?? undefined

  if (encryptionKey) {
    resolvedEncryptionKey = encryptionKey
  }

  return resolvedEncryptionKey
}