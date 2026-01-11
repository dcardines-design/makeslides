import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-y-auto h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-[#3B1FD1] hover:text-[#4B2DE1] text-sm mb-8 inline-block"
        >
          &larr; Back to App
        </Link>

        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-[#666] mb-12">Last updated: January 11, 2025</p>

        <div className="space-y-8 text-[#ccc] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              TikTok Slides Maker ("we", "our", or "the Service") respects your privacy and is
              committed to protecting your personal data. This Privacy Policy explains how we collect,
              use, and safeguard your information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Content prompts and text you enter for slide generation</li>
              <li>Images you upload or select for backgrounds</li>
              <li>Slide designs and customizations you create</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">2.2 TikTok Account Information</h3>
            <p>When you connect your TikTok account, we receive:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
              <li>Your TikTok user ID (open_id)</li>
              <li>Display name and username</li>
              <li>Profile picture URL</li>
              <li>Follower, following, and likes counts</li>
              <li>Video list and engagement metrics (views, likes, comments, shares)</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">2.3 Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Usage data and interaction with the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
              <li>Provide and maintain the Service</li>
              <li>Generate AI-powered slide content based on your prompts</li>
              <li>Enable posting to your TikTok account</li>
              <li>Display your TikTok profile and analytics within the app</li>
              <li>Save your generation history for convenience</li>
              <li>Improve and optimize the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard practices:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
              <li>TikTok access tokens are stored in HTTP-only cookies</li>
              <li>Generation history is stored in a secure database (Supabase)</li>
              <li>We use HTTPS encryption for all data transmission</li>
              <li>We do not store your TikTok password</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Third-Party Services</h2>
            <p>We integrate with the following third-party services:</p>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">TikTok</h3>
            <p>
              Used for account authentication, posting content, and retrieving analytics.
              Subject to <a href="https://www.tiktok.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#3B1FD1] hover:text-[#4B2DE1]">TikTok's Privacy Policy</a>.
            </p>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">OpenRouter (AI)</h3>
            <p>
              Used for generating slide content. Your prompts are sent to AI models for processing.
            </p>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">Unsplash</h3>
            <p>
              Used for sourcing background images. Subject to <a href="https://unsplash.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#3B1FD1] hover:text-[#4B2DE1]">Unsplash's Privacy Policy</a>.
            </p>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">Supabase</h3>
            <p>
              Used for storing your image collection and generation history.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Data Sharing</h2>
            <p>
              We do not sell your personal information. We only share data with:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
              <li>Third-party services necessary to provide the Service (as listed above)</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
              <li><strong>Disconnect TikTok:</strong> Remove your TikTok connection at any time through the app</li>
              <li><strong>Delete History:</strong> Remove your generation history from within the app</li>
              <li><strong>Access Data:</strong> Request a copy of your stored data</li>
              <li><strong>Delete Account:</strong> Request deletion of all your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Cookies</h2>
            <p>
              We use essential cookies to:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
              <li>Store TikTok authentication tokens securely</li>
              <li>Maintain your session state</li>
            </ul>
            <p className="mt-3">
              These cookies are necessary for the Service to function and cannot be disabled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Children's Privacy</h2>
            <p>
              The Service is not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or wish to exercise your data rights,
              please contact us through our support channels.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#2B2B2B]">
          <Link
            href="/terms"
            className="text-[#3B1FD1] hover:text-[#4B2DE1]"
          >
            View Terms of Service &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
