import { describe, it, expect } from 'vitest'
import { toCSV } from '../csv'

describe('toCSV', () => {
  it('converts rows to CSV', () => {
    const rows = [{ a: 1, b: 'x' }, { a: 2, b: 'y' }]
    const csv = toCSV(rows)
    expect(csv).toContain('a,b')
    expect(csv).toContain('1,x')
    expect(csv).toContain('2,y')
  })
})
