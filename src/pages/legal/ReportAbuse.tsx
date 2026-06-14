import { useSEO } from '@/hooks/useSEO'
import LegalLayout from '@/components/sections/LegalLayout'
import AbuseReportForm from '@/components/sections/AbuseReportForm'

const SITE_URL = 'https://moltbunker.com'
const EFFECTIVE_DATE = '13 June 2026'

const ReportAbuse = () => {
  useSEO({
    title: 'Report Abuse',
    description:
      'Report abusive content or behaviour on a *.moltbunker.dev address — DMCA, CSAM, malware, phishing, spam, and other violations.',
    canonical: `${SITE_URL}/legal/report`,
  })

  return (
    <LegalLayout title="Report Abuse" effectiveDate={EFFECTIVE_DATE}>
      <p>
        Use this form to report content or behaviour on a <code>*.moltbunker.dev</code> address that
        violates our <a href="/legal/aup">Acceptable Use Policy</a>. For copyright complaints, see
        the <a href="/legal/dmca">DMCA &amp; Takedown Policy</a> (the same form is embedded there).
      </p>
      <p>
        We acknowledge reports within <strong>2 business days</strong> and act on valid reports
        within <strong>5 business days</strong>. Confirmed CSAM and active attacks are treated as
        emergencies and actioned immediately. For urgent matters you can also email{' '}
        <a href="mailto:abuse@moltbunker.com">abuse@moltbunker.com</a> directly.
      </p>
      <AbuseReportForm />
    </LegalLayout>
  )
}

export default ReportAbuse
