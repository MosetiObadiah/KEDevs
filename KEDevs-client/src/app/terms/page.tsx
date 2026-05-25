import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | KEDevs',
  description: 'Terms and Conditions for using the KEDevs platform',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using KEDevs ("the Platform"), you agree to be bound by these Terms and Conditions. 
            If you do not agree to all of these terms, do not use the Platform. These terms are governed by the laws 
            of the Republic of Kenya.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Eligibility:</strong> You must be at least 18 years old to create an account.</li>
            <li><strong>Accuracy:</strong> You must provide accurate, current, and complete information during registration and keep it updated.</li>
            <li><strong>Security:</strong> You are responsible for safeguarding your password and any activities or actions under your account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Obligations</h2>
          <h3 className="text-xl font-medium mt-4 mb-2">3.1 Developers</h3>
          <p>
            As a developer on KEDevs, you agree to honestly represent your skills, experience, and qualifications. 
            Creating fraudulent profiles or falsely claiming credentials may result in immediate suspension or termination of your account.
          </p>
          <h3 className="text-xl font-medium mt-4 mb-2">3.2 Employers</h3>
          <p>
            Employers must post legitimate job opportunities. You agree not to post discriminatory, offensive, or misleading job descriptions. 
            You must respect candidate privacy and use developer data solely for recruitment purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Peer-Sourced Jobs</h2>
          <p>
            KEDevs allows users to share ("peer-source") publicly available job roles. KEDevs does not guarantee the accuracy, 
            validity, or availability of these third-party roles. Users interact with peer-sourced jobs at their own discretion.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Payments and Fees</h2>
          <p>
            Certain features, such as Verified Badges, Spotlight (Dev of the Day/Week), and Pinned Jobs, require payment. 
            All payments are processed via Safaricom M-Pesa. By initiating a transaction, you agree to the stated fees.
          </p>
          <p className="mt-2 font-medium">
            <strong>Refund Policy:</strong> Payments for Verified Badges (review fees), Spotlight features, and Pinned Jobs are non-refundable once the service has been activated or the review process has begun, except where mandated by Kenyan consumer protection laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
          <p>
            The KEDevs brand, logo, and original content are the intellectual property of KEDevs. By posting content 
            (such as profile details or job listings), you grant KEDevs a non-exclusive, worldwide, royalty-free license to display, 
            reproduce, and distribute your content on the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Termination</h2>
          <p>
            KEDevs reserves the right, at its sole discretion, to suspend or terminate your account and access to the Platform 
            without notice for any violation of these Terms, including but not limited to fraudulent activity or abusive behavior.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by Kenyan law, KEDevs shall not be liable for any indirect, incidental, special, 
            consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
            resulting from your use of the Platform or interactions with other users.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the Republic of Kenya. 
            Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction 
            of the Kenyan courts.
          </p>
        </section>
      </div>
    </div>
  );
}
