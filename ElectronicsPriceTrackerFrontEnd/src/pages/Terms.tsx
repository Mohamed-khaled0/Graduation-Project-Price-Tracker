
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";

const Terms: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#39536f]">Terms & Conditions</h1>
          
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <div className="text-gray-500 mb-6">Effective date: May 3, 2025</div>
            
            <p className="mb-6">
              Welcome to Hardware Price Tracker (referred to as "we," "us," or "our"). 
              By accessing or using our website, you agree to these Terms & Conditions.
            </p>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">1. Use of Services</h2>
              <p className="mb-2">
                You are granted a non‑exclusive, non‑transferable license to use our site for personal and non‑commercial purposes in accordance with these terms.
              </p>
              <p className="mb-2">
                You must be at least 13 years old to use the service. If under 18, you need parental consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">2. Account Registration</h2>
              <p className="mb-2">
                Certain features (price alerts, guided PC builds) require you to create an account with a valid email address. You are responsible for maintaining the security of your account credentials.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">3. Content & Accuracy</h2>
              <p className="mb-2">
                We aggregate pricing and product data from eCommerce sites, brick‑and‑mortar stores, and user inputs. While we strive for accuracy, we do not guarantee all information is up‑to‑date or error‑free.
              </p>
              <p className="mb-2">
                All buying decisions are yours. We are not liable for any losses or damages from using our data or recommendations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">4. Intellectual Property</h2>
              <p className="mb-2">
                All content on this site—text, graphics, logos, software—is owned or licensed by us and protected by copyright, trademark, and other laws.
              </p>
              <p className="mb-2">
                You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">5. Prohibited Conduct</h2>
              <p className="mb-2">
                Do not use bots, scrapers, or automated tools to extract data from our site.
              </p>
              <p className="mb-2">
                Do not interfere with site functionality or security.
              </p>
              <p className="mb-2">
                Do not post or transmit illegal, abusive, or infringing content.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">6. Third‑Party Services</h2>
              <p className="mb-2">
                We may integrate or link to third‑party services (payment gateways, analytics, maps). Your use of those services is governed by their respective terms and privacy policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">7. Disclaimers & Limitation of Liability</h2>
              <p className="mb-2">
                Our service is provided "as is" and "as available." We disclaim all warranties, express or implied.
              </p>
              <p className="mb-2">
                To the fullest extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">8. Termination</h2>
              <p className="mb-2">
                We may suspend or terminate your access at any time for violation of these terms or for any lawful reason.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">9. Changes to Terms</h2>
              <p className="mb-2">
                We reserve the right to modify these Terms & Conditions. Changes take effect when posted, and your continued use constitutes acceptance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">10. Governing Law</h2>
              <p className="mb-2">
                These terms are governed by the laws of Egypt. Any disputes will be resolved in the competent courts of Cairo.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="text-xl font-semibold mb-3 text-[#39536f]">11. Contact</h2>
              <p className="mb-2">
                Questions or feedback? Reach out at <a href="mailto:support@hardwarepricetracker.com" className="text-blue-600 hover:underline">support@hardwarepricetracker.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
