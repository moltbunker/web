import { useSEO } from '@/hooks/useSEO'
import LegalLayout from '@/components/sections/LegalLayout'

const SITE_URL = 'https://moltbunker.com'
const EFFECTIVE_DATE = '13 June 2026'

const AcceptableUse = () => {
  useSEO({
    title: 'Acceptable Use Policy',
    description:
      'MoltBunker Acceptable Use Policy: permitted uses, prohibited activities, network abuse rules, enforcement, and reporting.',
    canonical: `${SITE_URL}/legal/aup`,
  })

  return (
    <LegalLayout title="Acceptable Use Policy" effectiveDate={EFFECTIVE_DATE}>
      <p>
        This Acceptable Use Policy (&ldquo;AUP&rdquo;) applies to everyone who uses MoltBunker —
        users who deploy workloads and operators who run provider nodes. It supplements our{' '}
        <a href="/legal/terms">Terms of Service</a>. Because MoltBunker lets people expose
        containers directly to the public internet, abuse harms real third parties; we enforce this
        policy strictly.
      </p>

      <h2>1. Permitted Uses</h2>
      <p>
        You may use MoltBunker to deploy and expose lawful applications, APIs, websites, agents, and
        compute workloads that you own or are authorised to run, in compliance with these policies
        and applicable law.
      </p>

      <h2>2. Prohibited Activities</h2>
      <p>You must not use the Service to create, host, store, transmit, or facilitate:</p>
      <ul>
        <li>
          <strong>Child exploitation:</strong> child sexual abuse material (CSAM) or any content
          that sexually exploits, endangers, or grooms minors. Such content is reported to the
          relevant authorities (including NCMEC and the Australian Centre to Counter Child
          Exploitation) without notice.
        </li>
        <li>
          <strong>Malicious software:</strong> malware, ransomware, rootkits, worms, exploit kits,
          credential stealers, or botnet command-and-control infrastructure.
        </li>
        <li>
          <strong>Phishing &amp; fraud:</strong> phishing pages, fake login portals, deceptive
          impersonation, or financial fraud.
        </li>
        <li>
          <strong>Attacks:</strong> denial-of-service (DoS/DDoS), port scanning, intrusion,
          brute-forcing, or any attempt to gain unauthorised access to systems.
        </li>
        <li>
          <strong>Spam:</strong> unsolicited bulk email or messaging, and the infrastructure that
          supports it.
        </li>
        <li>
          <strong>Resource abuse:</strong> unauthorised cryptocurrency mining and other workloads
          designed to consume provider resources disproportionately or evade metering.
        </li>
        <li>
          <strong>Intellectual property infringement:</strong> distribution of copyrighted works,
          counterfeit goods, or trade-secret misappropriation. See our{' '}
          <a href="/legal/dmca">DMCA &amp; Takedown Policy</a>.
        </li>
        <li>
          <strong>Export-controlled &amp; sanctioned content:</strong> material whose distribution
          violates export-control laws, or any use that facilitates sanctions evasion.
        </li>
      </ul>

      <h2>3. Network &amp; Protocol Abuse</h2>
      <p>
        The Service relies on a peer-to-peer network and reverse tunnels. You must not:
      </p>
      <ul>
        <li>abuse tunnel or bandwidth allocations, or relay traffic to evade limits;</li>
        <li>
          mount Sybil, eclipse, or peer-scoring manipulation attacks against the P2P mesh, or
          attempt to deanonymise or overwhelm provider nodes;
        </li>
        <li>
          circumvent rate limits, the L7 WAF, staking requirements, or any platform abuse control.
        </li>
      </ul>

      <h2>4. Enforcement</h2>
      <p>
        When we identify a violation we may, at our discretion and without prior notice:
      </p>
      <ul>
        <li>suspend or terminate the responsible account, wallet, or provider node;</li>
        <li>
          block the offending subdomain or hostname at the edge (returning HTTP 451 to inbound
          requests);
        </li>
        <li>remove or disable the offending workload;</li>
        <li>issue or honour DMCA takedowns;</li>
        <li>
          preserve evidence and report unlawful activity to law-enforcement and other authorities.
        </li>
      </ul>
      <p>
        Provider-node operators who knowingly host prohibited content may also be subject to
        on-chain slashing under the staking rules.
      </p>

      <h2>5. Reporting Abuse</h2>
      <p>
        To report a violation, use our{' '}
        <a href="/legal/dmca">abuse / takedown form</a> or email{' '}
        <a href="mailto:abuse@moltbunker.com">abuse@moltbunker.com</a>. For copyright complaints see
        the <a href="/legal/dmca">DMCA &amp; Takedown Policy</a>. Please include the full{' '}
        <code>*.moltbunker.dev</code> address and a description of the issue.
      </p>
    </LegalLayout>
  )
}

export default AcceptableUse
