import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import Header from "@/components/Header";

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-[#39536f] text-white py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6">
            Your Smart Hardware Shopping Companion
          </h1>
          <p className="text-lg sm:text-xl text-center max-w-3xl mx-auto text-gray-200">
            We help you find the best deals on computer hardware by tracking prices across multiple retailers and providing smart price predictions.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        {/* Mission Section */}
        <div className="bg-white rounded-xl p-6 sm:p-8 mb-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#39536f] mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 text-base sm:text-lg mb-4">
            At Hardware Price Tracker, we're dedicated to making computer hardware shopping smarter and more transparent. We believe that everyone should have access to the best deals and make informed purchasing decisions.
          </p>
          <p className="text-gray-600 text-base sm:text-lg">
            Our platform combines real-time price tracking with historical data analysis to help you find the perfect time to buy your desired hardware components.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Price Tracking */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-[#e6eef1] rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#39536f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#39536f] mb-2">Smart Price Tracking</h3>
            <p className="text-gray-600">
              Monitor prices across multiple retailers in real-time and get notified when prices drop to your target range.
            </p>
          </div>

          {/* Price History */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-[#e6eef1] rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-[#39536f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#39536f] mb-2">Price History Analysis</h3>
            <p className="text-gray-600">
              View detailed price history charts to understand market trends and make informed purchasing decisions.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white rounded-xl p-6 sm:p-8 mb-12 shadow-sm border border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#39536f] mb-6">
            Why Choose Hardware Price Tracker?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 mt-1">
                <svg className="w-6 h-6 text-[#39536f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="ml-3 text-gray-600">
                <span className="font-semibold text-[#39536f]">Comprehensive Coverage:</span> Track prices from multiple major retailers to ensure you never miss a deal.
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 mt-1">
                <svg className="w-6 h-6 text-[#39536f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="ml-3 text-gray-600">
                <span className="font-semibold text-[#39536f]">Smart Analytics:</span> Our price history charts help you understand market trends and make informed decisions.
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 mt-1">
                <svg className="w-6 h-6 text-[#39536f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="ml-3 text-gray-600">
                <span className="font-semibold text-[#39536f]">User-Friendly Interface:</span> Easy-to-use platform with intuitive features for both beginners and experienced users.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#39536f] mb-6">
            Ready to Start Saving?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of smart shoppers who are already saving money on their hardware purchases.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button className="bg-[#39536f] hover:bg-[#2d4055] text-white px-8 py-6 text-base">
                Start Shopping
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-[#39536f] text-[#39536f] hover:bg-[#e6eef1] px-8 py-6 text-base">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
