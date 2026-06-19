import type { Metadata } from "next"

import { PolicyPage } from "../_components/PolicyPage"

export const metadata: Metadata = {
  title: "Privacy Policy | PIGER",
  description: "Privacy Policy for PIGER.",
}

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      description="This policy explains what information PIGER collects, how we use it, and the choices you have."
      sections={[
        {
          title: "1. Information we collect",
          children: (
            <>
              <p>We collect information you provide directly, including your name, email address, account details, and plan selection.</p>
              <p>
                If you upload files or design assets, we process those files to provide conversion, cleanup, review, and
                related design workflow features.
              </p>
              <p>
                We also collect limited technical information such as device type, browser type, IP address, log data,
                session data, and usage events needed to operate and secure the service.
              </p>
            </>
          ),
        },
        {
          title: "2. How we use information",
          children: (
            <>
              <p>We use information to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Create and manage user accounts.</li>
                <li>Provide file conversion, design review, and workflow features.</li>
                <li>Process subscriptions, payments, invoices, and billing support.</li>
                <li>Protect the service from fraud, abuse, unauthorized access, and security incidents.</li>
                <li>Improve reliability, performance, and product quality.</li>
                <li>Communicate with you about service updates, support, and account notices.</li>
              </ul>
            </>
          ),
        },
        {
          title: "3. Payments",
          children: (
            <p>
              Payments are handled by our payment provider, such as Paddle. Payment providers may collect billing
              details, tax information, and payment method information according to their own privacy policies. We do not
              store full card numbers on our servers.
            </p>
          ),
        },
        {
          title: "4. Cookies and similar technologies",
          children: (
            <p>
              We may use cookies or similar technologies to keep you signed in, remember preferences, measure product
              performance, and protect the service. You can control cookies through your browser settings, but some
              features may not work correctly without them.
            </p>
          ),
        },
        {
          title: "5. Sharing information",
          children: (
            <>
              <p>
                We do not sell your personal information. We share information only with service providers who help us
                operate PIGER, such as hosting, authentication, analytics, customer support, and payment processing
                providers.
              </p>
              <p>
                We may also disclose information if required by law, to enforce our terms, to protect users, or as part
                of a business transfer such as a merger, acquisition, or asset sale.
              </p>
            </>
          ),
        },
        {
          title: "6. Data retention",
          children: (
            <p>
              We keep personal information for as long as needed to provide the service, comply with legal obligations,
              resolve disputes, enforce agreements, and maintain business records. Uploaded files may be deleted or
              retained according to the product workflow and operational needs.
            </p>
          ),
        },
        {
          title: "7. Security",
          children: (
            <p>
              We use reasonable technical and organizational safeguards to protect information. No online service is
              completely secure, so we cannot guarantee absolute security.
            </p>
          ),
        },
        {
          title: "8. Your rights",
          children: (
            <p>
              Depending on where you live, you may have rights to access, correct, delete, restrict, or export your
              personal information. You may also have the right to object to certain processing. To make a request,
              contact us at min.ai.labs@gmail.com.
            </p>
          ),
        },
        {
          title: "9. Contact",
          children: <p>Questions about this Privacy Policy can be sent to min.ai.labs@gmail.com.</p>,
        },
      ]}
    />
  )
}
