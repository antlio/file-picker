/**
 * build navigation URL with query parameters preserved
 * @param folderPath - target folder path
 * @param preserveSearch - whether to preserve current search params
 * @returns formatted URL string
 */
export function buildNavigationUrl(
  folderPath: string,
  preserveSearch = true,
): string {
  const searchParams = preserveSearch
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams()
  const queryString = searchParams.toString()
  const query = queryString ? `?${queryString}` : ''

  // root navigation
  if (folderPath === '/') {
    return `/${query}`
  }

  // encode path segments for URL safety
  const cleanPath = folderPath.replace(/^\/+/, '')
  const pathSegments = cleanPath
    .split('/')
    .filter((segment) => segment.length > 0)
  const encodedPath =
    pathSegments.length > 0
      ? `/${pathSegments.map((segment) => encodeURIComponent(segment)).join('/')}`
      : ''

  return `${encodedPath}${query}`
}

/**
 * decode path segments from URL params
 * @param pathArray
 * @returns
 */
export function decodeFolderPath(pathArray?: string[]): string {
  if (!pathArray?.length) return '/'

  const decodedSegments = pathArray.map((segment) =>
    decodeURIComponent(segment),
  )
  return `/${decodedSegments.join('/')}`
}
