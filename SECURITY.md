# Security Policy

## Reporting a Vulnerability

Please report security vulnerabilities by email to **security@moltbunker.com**.

You can expect:

- An acknowledgement within **48 hours**.
- An initial assessment within **7 days**.
- A coordinated disclosure timeline agreed with you before any public details are shared.

Please do **not** open a public GitHub issue, social media post, or other public channel for security issues.

## Scope

This policy covers the Moltbunker web frontend (`moltbunker.com` / `app.moltbunker.dev`) and its Cloudflare Workers / Pages Functions code in this repository.

In-scope examples:

- Cross-site scripting (XSS), CSRF, or other browser-side injection attacks.
- Vulnerabilities in the encrypted exec terminal client or its crypto code.
- Mistakes in the wallet authentication flow that leak tokens or bypass the server-side check.
- Secrets unintentionally exposed in the client bundle.
- Server-side issues in the Cloudflare Workers / Pages Functions code.
- Insecure rate-limiting or input validation in any public-facing endpoint.

Out of scope:

- Daemon / smart contract bugs (report against the main `moltbunker` repository).
- Phishing of users by external third parties — we cannot fix the open web.
- Issues that require a compromised end-user machine to exploit.

## Supported Versions

Only the version currently deployed at `moltbunker.com` is supported.

## Safe Harbor

We will not pursue legal action against good-faith security research that follows this policy and does not:

- Access, modify, or exfiltrate data that is not yours.
- Cause service disruption beyond what is strictly necessary.
- Use social engineering or physical attacks.

## Recognition

Researchers who report valid in-scope issues will be credited in the security page on the public site, with their permission.
