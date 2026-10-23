import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TermsOfService from '@/pages/legal/TermsOfService'
import AcceptableUse from '@/pages/legal/AcceptableUse'
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy'
import Dmca from '@/pages/legal/Dmca'
import ReportAbuse from '@/pages/legal/ReportAbuse'

function renderAt(path: string, ui: React.ReactElement) {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>)
}

describe('legal pages render', () => {
  it('renders Terms of Service with its heading and sets the document title', () => {
    renderAt('/legal/terms', <TermsOfService />)
    expect(screen.getByRole('heading', { level: 1, name: /terms of service/i })).toBeInTheDocument()
    expect(document.title).toContain('Terms of Service')
  })

  it('renders the Acceptable Use Policy', () => {
    renderAt('/legal/aup', <AcceptableUse />)
    expect(screen.getByRole('heading', { level: 1, name: /acceptable use policy/i })).toBeInTheDocument()
  })

  it('renders the Privacy Policy and names the live GA property', () => {
    renderAt('/legal/privacy', <PrivacyPolicy />)
    expect(screen.getByRole('heading', { level: 1, name: /privacy policy/i })).toBeInTheDocument()
    // The launch-critical GDPR detail: the live GA4 property must be disclosed.
    expect(screen.getByText(/G-YP0G7EJNQJ/)).toBeInTheDocument()
  })

  it('renders the DMCA page with the embedded abuse-report form', () => {
    renderAt('/legal/dmca', <Dmca />)
    expect(screen.getByRole('heading', { level: 1, name: /dmca/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit report/i })).toBeInTheDocument()
  })

  it('renders the standalone Report Abuse page', () => {
    renderAt('/legal/report', <ReportAbuse />)
    expect(screen.getByRole('heading', { level: 1, name: /report abuse/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/report type/i)).toBeInTheDocument()
  })
})

describe('abuse-report form client validation', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows field errors and does not submit when the target is not moltbunker.dev', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    renderAt('/legal/report', <ReportAbuse />)

    const url = screen.getByLabelText(/reported address/i)
    fireEvent.change(url, { target: { value: 'evil.com' } })
    // description left empty
    fireEvent.click(screen.getByRole('button', { name: /submit report/i }))

    expect(screen.getByText(/must be a \*\.moltbunker\.dev hostname/i)).toBeInTheDocument()
    expect(screen.getByText(/describe the abuse/i)).toBeInTheDocument()
    // The validation guard must short-circuit before any network call. This
    // would catch a regression where validation fails yet fetch still fires.
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
