// Minimal Prometheus text-exposition-format parser.
//
// The daemon's `/v1/metrics` endpoint emits the standard Prometheus text
// format (see internal/metrics/prometheus.go). Rather than pull in a heavy
// Node-only client library, we parse the handful of line shapes we care about
// with two regexes. The format is line-oriented:
//
//   # HELP metric_name human readable help
//   # TYPE metric_name gauge|counter|histogram|summary
//   metric_name{label="value",...} 1.5 [optional_timestamp]
//
// Anything that doesn't match the value-line regex (blank lines, unrecognised
// comments, NaN/Inf values) is skipped rather than throwing.

export interface MetricSample {
  name: string
  help: string
  type: string
  value: number
  labels: Record<string, string>
  timestamp?: number
}

// metric{labels} value [timestamp]
const VALUE_LINE = /^([a-zA-Z_:][a-zA-Z0-9_:]*)(\{[^}]*\})?\s+([0-9eE.+-]+|NaN|[+-]?Inf)(?:\s+([0-9]+))?$/
// label="value" pairs inside the {...} block
const LABEL_PAIR = /([a-zA-Z_][a-zA-Z0-9_]*)="((?:[^"\\]|\\.)*)"/g

function parseLabels(block: string | undefined): Record<string, string> {
  const labels: Record<string, string> = {}
  if (!block) return labels
  // strip the surrounding braces
  const inner = block.slice(1, -1)
  let m: RegExpExecArray | null
  LABEL_PAIR.lastIndex = 0
  while ((m = LABEL_PAIR.exec(inner)) !== null) {
    // unescape \\ \" \n per the Prometheus text format spec
    labels[m[1]] = m[2].replace(/\\(["\\])/g, '$1').replace(/\\n/g, '\n')
  }
  return labels
}

export function parsePrometheusText(text: string): MetricSample[] {
  const samples: MetricSample[] = []
  const helpByName: Record<string, string> = {}
  const typeByName: Record<string, string> = {}

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (line === '') continue

    if (line.startsWith('#')) {
      // # HELP name text   |   # TYPE name type
      const help = line.match(/^#\s*HELP\s+(\S+)\s+(.*)$/)
      if (help) {
        helpByName[help[1]] = help[2]
        continue
      }
      const type = line.match(/^#\s*TYPE\s+(\S+)\s+(\S+)/)
      if (type) {
        typeByName[type[1]] = type[2]
        continue
      }
      // unrecognised comment — ignore
      continue
    }

    const m = line.match(VALUE_LINE)
    if (!m) continue

    const name = m[1]
    const value = Number(m[3])
    if (!Number.isFinite(value)) continue // skip NaN / Inf

    samples.push({
      name,
      help: helpByName[name] ?? '',
      type: typeByName[name] ?? 'untyped',
      value,
      labels: parseLabels(m[2]),
      timestamp: m[4] ? Number(m[4]) : undefined,
    })
  }

  return samples
}
