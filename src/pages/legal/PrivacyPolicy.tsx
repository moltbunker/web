import { useSEO } from '@/hooks/useSEO'
import LegalLayout from '@/components/sections/LegalLayout'

const SITE_URL = 'https://moltbunker.com'
const EFFECTIVE_DATE = '13 June 2026'

const PrivacyPolicy = () => {
  useSEO({
    title: 'Privacy Policy',
    description:
      'MoltBunker Privacy Policy: what data we collect (including Google Analytics), legal basis, GDPR rights, tenant data handling, and how to request deletion.',
    canonical: `${SITE_URL}/legal/privacy`,
  })

  return (
    <LegalLayout title="Privacy Policy" effectiveDate={EFFECTIVE_DATE}>
      <p>
        This Privacy Policy explains how <strong>Aus Dev Labs</strong> (&ldquo;we&rdquo;) handles
        personal data in connection with MoltBunker. We aim for data minimisation: MoltBunker is a
        decentralised platform and we deliberately collect as little personal data as is practical.
      </p>

      <h2>1. Data We Collect</h2>
      <ul>
        <li>
          <strong>Analytics data (Google Analytics 4, property <code>G-YP0G7EJNQJ</code>):</strong>{' '}
          page views, sessions, approximate geolocation, device/browser, referrer, and a truncated
          IP address. GA4 sets cookies and may use this data for measurement. This analytics is{' '}
          <strong>live in production today</strong>.
        </li>
        <li>
          <strong>Wallet addresses:</strong> your public on-chain address when you connect a wallet
          or transact. On-chain activity is inherently public and permanent.
        </li>
        <li>
          <strong>Deployment metadata:</strong> container configuration, resource limits, subdomain
          assignments, and billing/metering records needed to operate and settle your workloads.
        </li>
        <li>
          <strong>Access logs:</strong> request metadata at the edge/ingress (timestamps,
          subdomains, IP addresses, status codes) used for security, abuse prevention, and
          debugging.
        </li>
      </ul>

      <h2>2. Legal Basis (GDPR)</h2>
      <p>For users in the EU/EEA and UK, we rely on:</p>
      <ul>
        <li>
          <strong>Legitimate interests (Art. 6(1)(f)):</strong> analytics, security, abuse
          prevention, and operating the network;
        </li>
        <li>
          <strong>Contract (Art. 6(1)(b)):</strong> processing necessary to provide the Service you
          request and to meter and bill compute;
        </li>
        <li>
          <strong>Legal obligation (Art. 6(1)(c)):</strong> responding to lawful requests and abuse
          reporting.
        </li>
      </ul>

      <h2>3. Google Analytics</h2>
      <p>
        We use Google Analytics 4 to understand site usage. You can opt out by installing the{' '}
        <a
          href="https://tools.google.com/dlpage/gaoptout"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Analytics Opt-out Browser Add-on
        </a>
        , by blocking analytics cookies in your browser, or via your browser&rsquo;s
        Do-Not-Track / tracker-blocking settings. We do not currently operate a cookie-consent
        banner that blocks analytics before consent; one is planned. Until then, EU/EEA users should
        use the opt-out controls above.
      </p>

      <h2>4. Cookies</h2>
      <p>The site may set the following cookies:</p>
      <ul>
        <li>
          <code>_ga</code>, <code>_ga_*</code> / <code>_gid</code> — Google Analytics measurement
          and session identification.
        </li>
        <li>
          Wallet-connection state cookies/local-storage set by OnchainKit / wagmi to remember your
          connected wallet. These are functional and contain no analytics identifiers.
        </li>
      </ul>

      <h2>5. Your GDPR Rights</h2>
      <p>
        Subject to applicable law you have the right to access, rectify, erase (Art. 17), restrict,
        and port your personal data, and to object to processing. To exercise these rights email{' '}
        <a href="mailto:privacy@moltbunker.com">privacy@moltbunker.com</a> from or referencing the
        relevant wallet address. We will respond within one month. Note that data written to the
        public blockchain cannot be erased by us.
      </p>

      <h2>6. Tenant Data, Snapshots &amp; Storage</h2>
      <p>
        Container images, runtime state, snapshots, and storage buckets for your workloads reside on
        independent provider nodes, not on our central servers. Where supported, this data is
        encrypted at rest. When a container stops, its working data and transient artefacts are
        garbage-collected after a time-to-live window (currently 24 hours) and snapshots are removed
        on the schedule you configure. We do not warrant that provider-side data is recoverable
        after deletion.
      </p>

      <h2>7. Data Deletion</h2>
      <p>To request a full purge of your data, email{' '}
        <a href="mailto:privacy@moltbunker.com">privacy@moltbunker.com</a> with the wallet address
        concerned. Upon verification we will, to the extent technically possible:
      </p>
      <ul>
        <li>delete operator-held records keyed to your wallet from our embedded datastore;</li>
        <li>revoke associated API keys and access credentials;</li>
        <li>remove snapshots and storage buckets held for your workloads on provider nodes;</li>
        <li>
          purge your event data from Google Analytics via a GA user-deletion request where an
          identifier is available.
        </li>
      </ul>
      <p>
        Public on-chain records (wallet addresses, transactions, staking/escrow events) are
        immutable and outside our control; we cannot delete them.
      </p>

      <h2>8. International Transfers</h2>
      <p>
        Provider nodes and our service providers may be located outside your country, including
        outside the EU/EEA. Where personal data is transferred internationally we rely on Standard
        Contractual Clauses (SCCs) or an equivalent lawful transfer mechanism.
      </p>

      <h2>9. Retention</h2>
      <p>
        We retain access logs and abuse reports for as long as necessary for security and legal
        purposes, typically up to 12 months, and billing/metering records as required for tax and
        accounting. Analytics retention follows the GA4 configured retention period.
      </p>

      <h2>10. Contact</h2>
      <p>
        Privacy questions and requests:{' '}
        <a href="mailto:privacy@moltbunker.com">privacy@moltbunker.com</a>. Data controller: Aus Dev
        Labs.
      </p>
    </LegalLayout>
  )
}

export default PrivacyPolicy
