import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#39536f]">Privacy Policy</h1>

          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="text-gray-500 mb-6">Last updated: May 3, 2025</div>

            <p className="mb-6">
              Welcome to Hardware Price Tracker. Your privacy is important to us. 
              This Privacy Policy explains how we collect, use, share, and protect your 
              personal information when you use our website and services.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">1. Information We Collect</h2>
              <p className="mb-2"><strong>Account Information:</strong> When you register, we collect your name and email address.</p>
              <p className="mb-2"><strong>Usage Data:</strong> We automatically collect information about your interaction with the site, including pages visited, search queries, filters used, and click events.</p>
              <p className="mb-2"><strong>Third‑Party Analytics:</strong> We use Google Analytics and similar services to gather anonymized usage statistics (bounce rate, session length, etc.). These services may collect cookies and device identifiers under their own privacy policies.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">2. How We Use Your Information</h2>
              <p className="mb-2"><strong>Personalization:</strong> Tailor search results and nearest‑store suggestions based on location and preferences.</p>
              <p className="mb-2"><strong>Communication:</strong> Send you email alerts when an item's price falls below your chosen threshold, as well as periodic newsletters about new features.</p>
              <p className="mb-2"><strong>Service Improvement:</strong> Analyze usage patterns to enhance and optimize our platform.</p>
              <p className="mb-2"><strong>Security & Fraud Prevention:</strong> Monitor for suspicious activity to protect you and our infrastructure.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">3. Cookies and Tracking</h2>
              <p className="mb-2">
                We currently do not use cookies for personalization. Analytics cookies may be set by third‑party services (e.g., Google Analytics) to gather aggregate metrics. You can opt out via browser settings or Google's opt‑out tools.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">4. Data Sharing and Disclosure</h2>
              <p className="mb-2"><strong>No Sale of Personal Data:</strong> We will never sell or rent your personal information to third parties.</p>
              <p className="mb-2"><strong>Service Providers:</strong> We may share data with trusted vendors who support our operations (e.g., email delivery, analytics), under strict confidentiality agreements.</p>
              <p className="mb-2"><strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or to protect rights, property, or safety.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">5. Data Security</h2>
              <p className="mb-2">
                We implement administrative, technical, and physical safeguards to protect your data. However, no method of transmission over the Internet or electronic storage is completely secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">6. Your Choices</h2>
              <p className="mb-2"><strong>Access & Correction:</strong> You may review and update your account details in your profile settings.</p>
              <p className="mb-2"><strong>Email Opt‑Out:</strong> You can unsubscribe from promotional emails at any time via the link in the email footer.</p>
              <p className="mb-2"><strong>Cookie Control:</strong> Adjust your browser preferences to block or delete cookies (note: some site features may be affected).</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">7. Changes to This Policy</h2>
              <p className="mb-2">
                We may update this Privacy Policy at any time. The "Last updated" date above will reflect material changes. Continued use of our services constitutes acceptance of those changes.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">8. Contact Us</h2>
              <p className="mb-2">
                If you have questions or concerns about this policy, email us at <a href="mailto:privacy@hardwarepricetracker.com" className="text-blue-600 hover:underline">privacy@hardwarepricetracker.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
