import { useSEO } from '@/hooks/useSEO'
import LegalLayout from '@/components/sections/LegalLayout'

const SITE_URL = 'https://moltbunker.com'
const EFFECTIVE_DATE = '13 June 2026'

const TermsOfService = () => {
  useSEO({
    title: 'Terms of Service',
    description:
      'MoltBunker Terms of Service: eligibility, account responsibilities, prohibited uses, warranties, liability, and dispute resolution.',
    canonical: `${SITE_URL}/legal/terms`,
  })

  return (
    <LegalLayout title="Terms of Service" effectiveDate={EFFECTIVE_DATE}>
      <p>
        These Terms of Service (the &ldquo;Terms&rdquo;) govern your access to and use of MoltBunker
        (the &ldquo;Service&rdquo;), operated by <strong>Aus Dev Labs</strong> (&ldquo;we&rdquo;,
        &ldquo;us&rdquo;, &ldquo;our&rdquo;). By accessing the Service, deploying a container,
        operating a provider node, or connecting a wallet, you agree to these Terms. If you do not
        agree, do not use the Service.
      </p>

      <h2>1. The Service</h2>
      <p>
        MoltBunker is a permissionless, decentralised compute platform. It lets users deploy
        containerised workloads to independent provider nodes and expose them to the public internet
        via reverse tunnels under <code>*.moltbunker.dev</code> subdomains. Payment, staking, and
        accountability are coordinated by smart contracts on the Base network. The Service is
        offered on an evolving basis and may change, be suspended, or be discontinued at any time.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years old and legally capable of forming a binding contract. You may
        not use the Service if you are subject to sanctions, located in an embargoed jurisdiction,
        or barred from receiving services under applicable law.
      </p>

      <h2>3. Accounts &amp; Wallets</h2>
      <p>
        Authentication is performed by cryptographic wallet signature. You are solely responsible
        for the security of your private keys, API keys, and any workloads you deploy. We cannot
        recover lost keys. Activity originating from your wallet or API credentials is your
        responsibility.
      </p>

      <h2>4. Acceptable Use &amp; Prohibited Uses</h2>
      <p>
        Your use of the Service is also governed by our{' '}
        <a href="/legal/aup">Acceptable Use Policy</a>. Without limiting it, you must not use the
        Service to host, distribute, transmit, or facilitate:
      </p>
      <ul>
        <li>
          child sexual abuse material (CSAM) or any content that sexually exploits or endangers
          minors;
        </li>
        <li>malware, ransomware, exploit kits, botnet command-and-control, or phishing;</li>
        <li>spam, unsolicited bulk messaging, or large-scale unauthorised scraping;</li>
        <li>denial-of-service (DoS/DDoS) tooling or attacks against any system;</li>
        <li>unauthorised cryptocurrency mining or resource abuse;</li>
        <li>
          circumvention of platform controls, rate limits, the WAF, staking, or metering and
          billing;
        </li>
        <li>infringement of intellectual property or violation of any applicable law.</li>
      </ul>

      <h2>5. Provider Nodes</h2>
      <p>
        If you operate a provider node, you agree to honour the staking and slashing rules enforced
        by the smart contracts, to run unmodified or compatible daemon software, and not to tamper
        with tenant workloads, inspect tenant data beyond what is technically necessary to route
        traffic, or interfere with the encrypted runtime.
      </p>

      <h2>6. Fees &amp; Payments</h2>
      <p>
        Compute is metered and settled on-chain. You are responsible for all network (gas) fees and
        for maintaining sufficient escrow balances. On-chain transactions are irreversible.
      </p>

      <h2>7. No Warranties</h2>
      <p>
        THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES
        OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        AND NON-INFRINGEMENT. We do not warrant that the Service will be uninterrupted, secure, or
        error-free, that workloads will remain available, or that data will not be lost. The Service
        interacts with experimental blockchain and peer-to-peer technology that carries inherent
        risk.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, AUS DEV LABS AND ITS OPERATORS WILL NOT BE LIABLE FOR
        ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, OR FOR LOST PROFITS,
        DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE. Our aggregate liability for any
        claim will not exceed the greater of the fees you paid to use the Service in the three months
        preceding the claim, or AUD $100. Nothing in these Terms excludes liability that cannot be
        excluded under the Australian Consumer Law.
      </p>

      <h2>9. Indemnity</h2>
      <p>
        You agree to indemnify and hold harmless Aus Dev Labs and provider-node operators from any
        claim arising out of your workloads, your content, or your breach of these Terms.
      </p>

      <h2>10. Termination</h2>
      <p>
        We may suspend or terminate your access, block a subdomain at the edge, or remove a workload
        immediately and without notice if we reasonably believe you have violated these Terms, the{' '}
        <a href="/legal/aup">Acceptable Use Policy</a>, or applicable law, or to comply with a legal
        order. You may stop using the Service at any time.
      </p>

      <h2>11. Governing Law &amp; Disputes</h2>
      <p>
        These Terms are governed by the laws of New South Wales, Australia. You and Aus Dev Labs
        submit to the non-exclusive jurisdiction of the courts of New South Wales. The parties will
        first attempt to resolve any dispute in good faith by negotiation before commencing
        proceedings.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update these Terms from time to time. Material changes will be reflected by an updated
        effective date. Your continued use after changes take effect constitutes acceptance.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these Terms: <a href="mailto:legal@moltbunker.com">legal@moltbunker.com</a>.
        Abuse reports: <a href="mailto:abuse@moltbunker.com">abuse@moltbunker.com</a>.
      </p>
    </LegalLayout>
  )
}

export default TermsOfService
