import { describe, expect, it } from 'vitest'
import { formatBytes } from './format'

describe('formatBytes', () => {
  it('should format zero bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('should format bytes correctly', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1023)).toBe('1023 B')
  })

  it('should format kilobytes correctly', () => {
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(2048)).toBe('2 KB')
  })

  it('should format megabytes correctly', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MB')
    expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.5 MB')
    expect(formatBytes(2.25 * 1024 * 1024)).toBe('2.3 MB')
  })

  it('should format gigabytes correctly', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
    expect(formatBytes(2.5 * 1024 * 1024 * 1024)).toBe('2.5 GB')
  })

  it('should format terabytes correctly', () => {
    expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe('1 TB')
    expect(formatBytes(1.2 * 1024 * 1024 * 1024 * 1024)).toBe('1.2 TB')
  })

  it('should respect custom decimal places', () => {
    expect(formatBytes(1536, 0)).toBe('2 KB')
    expect(formatBytes(1536, 2)).toBe('1.5 KB')
    expect(formatBytes(1536, 3)).toBe('1.5 KB')
    expect(formatBytes(1234567, 2)).toBe('1.18 MB')
  })

  it('should handle negative decimal places', () => {
    expect(formatBytes(1536, -1)).toBe('2 KB')
    expect(formatBytes(1536, -5)).toBe('2 KB')
  })

  it('should handle edge cases', () => {
    expect(formatBytes(1)).toBe('1 B')
    expect(formatBytes(1025)).toBe('1 KB')
    expect(formatBytes(1048577)).toBe('1 MB')
  })

  it('should handle very large numbers', () => {
    const largeNumber = 1024 * 1024 * 1024 * 1024 * 5.5
    expect(formatBytes(largeNumber)).toBe('5.5 TB')
  })

  it('should handle decimal precision correctly for various sizes', () => {
    expect(formatBytes(1536, 2)).toBe('1.5 KB')

    expect(formatBytes(1.7 * 1024 * 1024, 0)).toBe('2 MB')

    expect(formatBytes(1.234 * 1024 * 1024 * 1024, 3)).toBe('1.234 GB')

    expect(formatBytes(1234567, 2)).toBe('1.18 MB')
    expect(formatBytes(1234567890, 3)).toBe('1.15 GB')
  })
})
