import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-y-auto h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-[#3B1FD1] hover:text-[#4B2DE1] text-sm mb-8 inline-block"
        >
          &larr; Back to App
        </Link>

        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-[#666] mb-12">Last updated: January 11, 2025</p>

        <div className="space-y-8 text-[#ccc] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using TikTok Slides Maker ("the Service"), you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p>
              TikTok Slides Maker is a web application that allows users to create visual slide content
              for social media platforms. The Service includes:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
              <li>AI-powered content generation for slide text</li>
              <li>Image selection and background customization</li>
              <li>Export functionality for created slides</li>
              <li>Optional integration with TikTok for direct posting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. User Responsibilities</h2>
            <p>When using the Service, you agree to:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 ml-4">
              <li>Provide accurate information when connecting third-party accounts</li>
              <li>Not use the Service for any illegal or unauthorized purpose</li>
              <li>Not create content that infringes on others' intellectual property rights</li>
              <li>Not create content that is harmful, offensive, or violates platform guidelines</li>
              <li>Comply with TikTok's Terms of Service when using the TikTok integration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Content Ownership</h2>
            <p>
              You retain ownership of any original content you create using the Service. However, you
              grant us a limited license to process and display your content as necessary to provide
              the Service.
            </p>
            <p className="mt-3">
              Images sourced from third-party services (Unsplash, Pinterest) are subject to their
              respective licensing terms. You are responsible for ensuring your use complies with
              those terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Third-Party Integrations</h2>
            <p>
              The Service integrates with third-party platforms including TikTok, Unsplash, and
              Pinterest. Your use of these integrations is subject to the respective terms and
              privacy policies of those platforms.
            </p>
            <p className="mt-3">
              We are not responsible for any changes, outages, or issues with third-party services
              that may affect the functionality of our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. AI-Generated Content</h2>
            <p>
              The Service uses AI to generate text content. While we strive for quality, AI-generated
              content may occasionally be inaccurate, inappropriate, or not suitable for your needs.
              You are responsible for reviewing and editing all content before publishing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. We shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages resulting from
              your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Modifications to Service</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue the Service at any time without
              notice. We may also update these Terms of Service from time to time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. Termination</h2>
            <p>
              We may terminate or suspend your access to the Service at any time, without prior notice,
              for conduct that we believe violates these Terms or is harmful to other users or the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Contact</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us through our
              support channels.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#2B2B2B]">
          <Link
            href="/privacy"
            className="text-[#3B1FD1] hover:text-[#4B2DE1]"
          >
            View Privacy Policy &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
