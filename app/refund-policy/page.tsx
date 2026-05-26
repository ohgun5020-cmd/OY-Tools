import type { Metadata } from "next"

import { PolicyPage } from "../_components/PolicyPage"

export const metadata: Metadata = {
  title: "Refund Policy | PIGMA",
  description: "Refund Policy for PIGMA.",
}

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      title="Refund Policy"
      description="This policy explains how refunds and cancellations work for PIGMA subscriptions and digital services."
      sections={[
        {
          title: "1. Subscription cancellations",
          children: (
            <p>
              You may cancel a paid subscription at any time. After cancellation, your paid access remains available
              until the end of the current billing period unless otherwise stated at checkout or by the payment provider.
            </p>
          ),
        },
        {
          title: "2. Refund eligibility",
          children: (
            <>
              <p>
                Because PIGMA is a digital SaaS product, completed billing periods are generally non-refundable once the
                service has been made available. We may consider refunds in the following cases:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>A duplicate charge was made by mistake.</li>
                <li>A technical issue prevented access to paid features and we could not resolve it in a reasonable time.</li>
                <li>A first-time purchase refund is requested within 14 days and the account has not had substantial usage.</li>
                <li>A renewal refund is requested within 7 days of renewal and the renewed period has not had substantial usage.</li>
              </ul>
            </>
          ),
        },
        {
          title: "3. Non-refundable cases",
          children: (
            <>
              <p>Refunds are generally not available for:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Change of mind after substantial use of the service.</li>
                <li>Failure to cancel before a renewal date.</li>
                <li>Unused time remaining in a billing period after cancellation.</li>
                <li>Accounts suspended or terminated for violating our Terms of Service.</li>
              </ul>
            </>
          ),
        },
        {
          title: "4. How to request a refund",
          children: (
            <p>
              To request a refund, contact min.ai.labs@gmail.com with the email address used for purchase, the order or
              invoice number if available, and a short explanation of the issue. We may ask for additional details to
              verify the request.
            </p>
          ),
        },
        {
          title: "5. Processing time",
          children: (
            <p>
              Approved refunds are returned to the original payment method through the payment provider. Processing times
              depend on the provider, card network, and bank, and may take several business days.
            </p>
          ),
        },
        {
          title: "6. Contact",
          children: <p>Questions about refunds or cancellations can be sent to min.ai.labs@gmail.com.</p>,
        },
      ]}
    />
  )
}
