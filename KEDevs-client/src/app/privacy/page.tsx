import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | KEDevs',
  description: 'Privacy Policy outlining how KEDevs handles your personal data.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <p>
          At KEDevs, we take your privacy seriously. This Privacy Policy outlines how we collect, use, 
          disclose, and safeguard your personal information when you use our platform. This policy is designed 
          to comply with the Kenya Data Protection Act, 2019 (DPA).
        </p>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Data Controller</h2>
          <p>
            KEDevs acts as the Data Controller for the personal data collected through the Platform. 
            For any privacy-related inquiries, please contact our support team.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Personal Data We Collect</h2>
          <p>We may collect the following types of personal data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Identity Data:</strong> Full name, professional titles.</li>
            <li><strong>Contact Data:</strong> Email address, phone number (required for M-Pesa payments).</li>
            <li><strong>Professional Data:</strong> Resume/CV, bio, skills, GitHub URLs, LinkedIn URLs, tech stack.</li>
            <li><strong>Verification Data:</strong> For employers, we collect KRA PINs and Certificates of Incorporation to verify business legitimacy.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, and usage metrics.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Data</h2>
          <p>We process your personal data under the following lawful bases: Consent, Contract Performance, and Legitimate Interest.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Matchmaking:</strong> To connect developers with relevant job opportunities and employers.</li>
            <li><strong>Payments:</strong> To process payments for premium features (Spotlight, Pinned Jobs, Verifications) securely via Safaricom M-Pesa.</li>
            <li><strong>Platform Operations:</strong> To send account notifications, security alerts, and system updates.</li>
            <li><strong>Fraud Prevention:</strong> To verify employer legitimacy and prevent fraudulent developer profiles.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Sharing and Disclosure</h2>
          <p>We do not sell your personal data. We may share your data with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Employers:</strong> If you are a developer, your public profile and job application data are visible to employers.</li>
            <li><strong>Payment Processors:</strong> Safaricom (M-Pesa) for processing transactions.</li>
            <li><strong>Service Providers:</strong> Cloud hosting providers (e.g., AWS/GCP) necessary for platform operation.</li>
            <li><strong>Legal Authorities:</strong> When required by Kenyan law or to protect our legal rights.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Subject Rights</h2>
          <p>Under the Kenya Data Protection Act, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Right to be Informed:</strong> To know how your data is being used.</li>
            <li><strong>Right of Access:</strong> To request a copy of the personal data we hold about you.</li>
            <li><strong>Right to Rectification:</strong> To correct inaccurate or incomplete data.</li>
            <li><strong>Right to Erasure (Right to be Forgotten):</strong> To request deletion of your personal data.</li>
            <li><strong>Right to Data Portability:</strong> To receive your data in a structured, machine-readable format.</li>
            <li><strong>Right to Object:</strong> To object to processing based on legitimate interests or for direct marketing.</li>
          </ul>
          <p className="mt-2">To exercise any of these rights, please contact our support team.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Retention</h2>
          <p>
            We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy. 
            Account data is retained while your account is active. Transaction records (e.g., M-Pesa payment logs) may be 
            retained for up to seven (7) years to comply with Kenyan tax and accounting laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Security Measures</h2>
          <p>
            We implement robust technical and organizational measures to protect your data, including JWT-based authentication, 
            encryption of sensitive data in transit (HTTPS), and restricted access controls. While we strive to protect your data, 
            no system is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to this Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the 
            new policy on the Platform and updating the "Last Updated" date.
          </p>
        </section>
      </div>
    </div>
  );
}
