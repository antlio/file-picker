/**
 * format bytes to human readable string
 * @param bytes - file size in bytes
 * @param decimals - number of decimal places
 * @returns formatted string like "1.5 MB"
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}
