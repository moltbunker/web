import { describe, it, expect } from 'vitest'
import { parsePrometheusText } from '@/lib/metrics-parser'

describe('parsePrometheusText', () => {
  it('returns [] for an empty string', () => {
    expect(parsePrometheusText('')).toEqual([])
  })

  it('returns [] for comment-only input', () => {
    const input = '# HELP something a metric with no samples\n# TYPE something gauge\n'
    expect(parsePrometheusText(input)).toEqual([])
  })

  it('parses a single metric with HELP + TYPE + value', () => {
    const input = [
      '# HELP container_memory_usage_bytes Memory usage in bytes',
      '# TYPE container_memory_usage_bytes gauge',
      'container_memory_usage_bytes 1048576',
    ].join('\n')

    const out = parsePrometheusText(input)
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({
      name: 'container_memory_usage_bytes',
      help: 'Memory usage in bytes',
      type: 'gauge',
      value: 1048576,
      labels: {},
    })
  })

  it('parses labels on a metric line', () => {
    const input = 'container_cpu_usage{id="abc",cpu="0"} 1.5'
    const out = parsePrometheusText(input)
    expect(out).toHaveLength(1)
    expect(out[0].name).toBe('container_cpu_usage')
    expect(out[0].value).toBe(1.5)
    expect(out[0].labels).toEqual({ id: 'abc', cpu: '0' })
  })

  it('produces one sample per distinct metric family', () => {
    const input = [
      '# TYPE a counter',
      'a 1',
      '# TYPE b gauge',
      'b 2',
    ].join('\n')
    const out = parsePrometheusText(input)
    expect(out).toHaveLength(2)
    expect(out.map((s) => s.name).sort()).toEqual(['a', 'b'])
    expect(out.find((s) => s.name === 'a')?.type).toBe('counter')
    expect(out.find((s) => s.name === 'b')?.type).toBe('gauge')
  })

  it('skips NaN and Inf values', () => {
    const input = [
      'good 1',
      'bad_nan NaN',
      'bad_inf +Inf',
    ].join('\n')
    const out = parsePrometheusText(input)
    expect(out).toHaveLength(1)
    expect(out[0].name).toBe('good')
  })

  it('captures an optional trailing timestamp', () => {
    const out = parsePrometheusText('m 3 1700000000000')
    expect(out[0].value).toBe(3)
    expect(out[0].timestamp).toBe(1700000000000)
  })

  it('defaults type to "untyped" when no TYPE comment present', () => {
    const out = parsePrometheusText('lonely 7')
    expect(out[0].type).toBe('untyped')
    expect(out[0].help).toBe('')
  })
})
