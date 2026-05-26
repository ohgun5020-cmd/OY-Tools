import type { Metadata } from "next"

import { PolicyPage } from "../_components/PolicyPage"

export const metadata: Metadata = {
  title: "Terms of Service | PIGMA",
  description: "Terms of Service for PIGMA.",
}

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms of Service"
      description="These terms explain how you may use PIGMA, our PSD to Figma-ready conversion and design workflow service."
      sections={[
        {
          title: "1. Agreement to these terms",
          children: (
            <>
              <p>
                By creating an account, purchasing a plan, or using PIGMA, you agree to these Terms of Service. If you
                do not agree, you must not use the service.
              </p>
              <p>
                PIGMA provides software tools for converting, organizing, reviewing, and preparing design-related files
                for editable design workflows.
              </p>
            </>
          ),
        },
        {
          title: "2. Accounts and eligibility",
          children: (
            <>
              <p>
                You are responsible for keeping your account information accurate and for protecting your login
                credentials. You must notify us if you believe your account has been accessed without permission.
              </p>
              <p>
                You may use PIGMA only if you have the legal authority to enter into this agreement and comply with
                applicable laws.
              </p>
            </>
          ),
        },
        {
          title: "3. Subscriptions and billing",
          children: (
            <>
              <p>
                Paid plans are billed according to the price and billing period shown at checkout. Prices are listed in
                USD unless otherwise stated. Taxes may be added where required.
              </p>
              <p>
                Payments are processed by our payment provider, such as Paddle. We do not store full payment card
                details on our servers. Your subscription may renew automatically until you cancel it.
              </p>
            </>
          ),
        },
        {
          title: "4. Acceptable use",
          children: (
            <>
              <p>You agree not to use PIGMA to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Violate any law, regulation, intellectual property right, privacy right, or contract.</li>
                <li>Upload files that contain malware, harmful code, or content you do not have the right to use.</li>
                <li>Attempt to disrupt, reverse engineer, overload, or gain unauthorized access to the service.</li>
                <li>Use automated scraping, resale, or abuse patterns that harm the service or other users.</li>
              </ul>
            </>
          ),
        },
        {
          title: "5. Your content",
          children: (
            <>
              <p>
                You keep ownership of files, designs, text, images, and other content you upload to PIGMA. You grant us
                permission to process that content only as needed to provide, secure, troubleshoot, and improve the
                service.
              </p>
              <p>
                You are responsible for ensuring that you have the rights and permissions needed to upload and process
                your content through PIGMA.
              </p>
            </>
          ),
        },
        {
          title: "6. Service changes and availability",
          children: (
            <p>
              We may change, suspend, or discontinue parts of the service as we improve PIGMA. We try to keep the
              service available, but we do not guarantee uninterrupted or error-free operation.
            </p>
          ),
        },
        {
          title: "7. Disclaimers and limitation of liability",
          children: (
            <>
              <p>
                PIGMA is provided on an "as is" and "as available" basis. To the maximum extent permitted by law, we
                disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>
              <p>
                To the maximum extent permitted by law, PIGMA will not be liable for indirect, incidental, special,
                consequential, or punitive damages, or for loss of profits, data, or business opportunities.
              </p>
            </>
          ),
        },
        {
          title: "8. Contact",
          children: <p>Questions about these terms can be sent to min.ai.labs@gmail.com.</p>,
        },
      ]}
    />
  )
}
