import { useSEO } from '@/hooks/useSEO'
import LegalLayout from '@/components/sections/LegalLayout'
import AbuseReportForm from '@/components/sections/AbuseReportForm'

const SITE_URL = 'https://moltbunker.com'
const EFFECTIVE_DATE = '13 June 2026'

const Dmca = () => {
  useSEO({
    title: 'DMCA & Takedown Policy',
    description:
      'MoltBunker DMCA & Takedown Policy: designated agent, notice and counter-notice requirements, repeat-infringer policy, and an abuse-report form.',
    canonical: `${SITE_URL}/legal/dmca`,
  })

  return (
    <LegalLayout title="DMCA &amp; Takedown Policy" effectiveDate={EFFECTIVE_DATE}>
      <p>
        Aus Dev Labs respects intellectual-property rights and responds to valid notices of claimed
        infringement under the U.S. Digital Millennium Copyright Act (DMCA) and comparable laws. We
        also act on other abuse via the form below.
      </p>

      <h2>1. Designated Agent</h2>
      <p>
        Send copyright complaints to our designated agent:
      </p>
      <ul>
        <li>
          Email: <a href="mailto:abuse@moltbunker.com">abuse@moltbunker.com</a> (subject:{' '}
          &ldquo;DMCA Notice&rdquo;)
        </li>
        <li>By post: DMCA Agent, Aus Dev Labs, New South Wales, Australia</li>
      </ul>

      <h2>2. DMCA Notice Requirements (§512(c)(3))</h2>
      <p>A valid notice must include all of the following:</p>
      <ol>
        <li>identification of the copyrighted work claimed to have been infringed;</li>
        <li>
          identification of the infringing material, including the full subdomain or URL at{' '}
          <code>*.moltbunker.dev</code> where it can be found, with enough detail for us to locate
          it;
        </li>
        <li>your name, address, telephone number, and email address;</li>
        <li>
          a statement that you have a good-faith belief that the use is not authorised by the
          copyright owner, its agent, or the law;
        </li>
        <li>
          a statement, made under penalty of perjury, that the information in the notice is accurate
          and that you are the owner or authorised to act on the owner&rsquo;s behalf;
        </li>
        <li>your physical or electronic signature.</li>
      </ol>

      <h2>3. Counter-Notice (§512(g))</h2>
      <p>
        If your material was removed and you believe this was a mistake or misidentification, you
        may submit a counter-notice to{' '}
        <a href="mailto:abuse@moltbunker.com">abuse@moltbunker.com</a> including: identification of
        the removed material and its prior location; a statement under penalty of perjury that you
        have a good-faith belief the removal was a mistake; your contact details and consent to the
        jurisdiction of the relevant courts; and your signature. We may restore the material in
        10&ndash;14 business days unless the complainant files a court action.
      </p>

      <h2>4. Repeat-Infringer Policy</h2>
      <p>
        We will, in appropriate circumstances, suspend or terminate the accounts, wallets, and
        provider nodes of users who are repeat infringers.
      </p>

      <h2>5. Non-Copyright Abuse</h2>
      <p>
        For abuse that is not a copyright matter — malware, phishing, CSAM, spam, attacks — see our{' '}
        <a href="/legal/aup">Acceptable Use Policy</a> and use the form below or email{' '}
        <a href="mailto:abuse@moltbunker.com">abuse@moltbunker.com</a>. CSAM and active attacks are
        treated as emergencies.
      </p>

      <h2>6. Processing Time</h2>
      <p>
        We aim to acknowledge reports within <strong>2 business days</strong> and to act on valid
        reports within <strong>5 business days</strong>. Confirmed CSAM and active attacks are acted
        on immediately, including blocking the subdomain at the edge.
      </p>

      <h2>7. Report Abuse</h2>
      <p>
        Use this form to submit a DMCA notice or other abuse report. Reports are recorded and
        triaged by our team. False or bad-faith reports may carry legal consequences.
      </p>
      <AbuseReportForm />
    </LegalLayout>
  )
}

export default Dmca
