import React from "react";

const PrivacyPolicy = () => {
  const lastUpdated = "January 15, 2024";

  const sections = [
    {
      title: "Information We Collect",
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide directly to us, such as when you create an account, make a booking, list a property, or contact us. This includes your name, email address, phone number, postal address, payment information, and government-issued ID for verification purposes.",
        },
        {
          subtitle: "Property Information",
          text: "When you list a property, we collect details about your property including location, amenities, photos, pricing, and availability. This information is used to create your listing and help guests find suitable accommodations.",
        },
        {
          subtitle: "Usage Information",
          text: "We automatically collect information about how you use our platform, including your IP address, browser type, device information, pages visited, search queries, and interaction patterns. This helps us improve our services and provide personalized experiences.",
        },
        {
          subtitle: "Location Information",
          text: "With your permission, we may collect precise location information from your device to help you find nearby properties, provide location-based services, and improve our recommendations.",
        },
      ],
    },
    {
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Service Provision",
          text: "We use your information to provide, maintain, and improve our platform, process bookings and payments, facilitate communication between hosts and guests, and provide customer support.",
        },
        {
          subtitle: "Safety and Security",
          text: "We use your information to verify identities, prevent fraud, ensure platform safety, investigate violations of our terms, and protect the rights and safety of our users and the public.",
        },
        {
          subtitle: "Communication",
          text: "We may use your information to send you booking confirmations, important updates about our services, promotional materials (with your consent), and respond to your inquiries and requests.",
        },
        {
          subtitle: "Personalization",
          text: "We use your information to personalize your experience, provide relevant search results and recommendations, and display targeted advertisements that may be of interest to you.",
        },
      ],
    },
    {
      title: "Information Sharing",
      content: [
        {
          subtitle: "With Other Users",
          text: "When you make a booking or list a property, we share relevant information with the other party to facilitate the transaction. This includes contact information, booking details, and public profile information.",
        },
        {
          subtitle: "With Service Providers",
          text: "We share information with third-party service providers who help us operate our platform, including payment processors, cloud storage providers, analytics services, and customer support tools.",
        },
        {
          subtitle: "For Legal Compliance",
          text: "We may disclose your information when required by law, to respond to legal requests, protect our rights and property, ensure user safety, or investigate potential violations of our terms of service.",
        },
        {
          subtitle: "Business Transfers",
          text: "In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity, subject to the same privacy protections outlined in this policy.",
        },
      ],
    },
    {
      title: "Data Security",
      content: [
        {
          subtitle: "Security Measures",
          text: "We implement industry-standard security measures to protect your information, including encryption, secure servers, regular security audits, and access controls. However, no method of transmission over the internet is 100% secure.",
        },
        {
          subtitle: "Data Retention",
          text: "We retain your information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. You can request deletion of your account and associated data at any time.",
        },
      ],
    },
    {
      title: "Your Rights and Choices",
      content: [
        {
          subtitle: "Access and Control",
          text: "You can access, update, or delete your personal information through your account settings. You also have the right to request a copy of your data or ask us to delete your account entirely.",
        },
        {
          subtitle: "Communication Preferences",
          text: "You can opt out of promotional emails by clicking the unsubscribe link in any email or updating your communication preferences in your account settings. You cannot opt out of essential service communications.",
        },
        {
          subtitle: "Cookie Management",
          text: "You can control cookies through your browser settings. However, disabling certain cookies may affect the functionality of our platform.",
        },
      ],
    },
    {
      title: "International Data Transfers",
      content: [
        {
          subtitle: "Global Operations",
          text: "StayNest operates globally, and your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.",
        },
      ],
    },
    {
      title: "Children's Privacy",
      content: [
        {
          subtitle: "Age Restrictions",
          text: "Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will take steps to delete it promptly.",
        },
      ],
    },
    {
      title: "Changes to This Policy",
      content: [
        {
          subtitle: "Policy Updates",
          text: "We may update this privacy policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on our platform and updating the 'Last Updated' date.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            At StayNest, we are committed to protecting your privacy and
            ensuring the security of your personal information.
          </p>
          <p className="text-sm text-gray-500">
            <strong>Last Updated:</strong> {lastUpdated}
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sections.map((section, index) => (
              <a
                key={index}
                href={`#section-${index}`}
                className="text-blue-600 hover:text-blue-700 hover:underline py-1"
              >
                {index + 1}. {section.title}
              </a>
            ))}
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-8">
          {sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              id={`section-${sectionIndex}`}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {sectionIndex + 1}. {section.title}
              </h2>
              <div className="space-y-6">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      {item.subtitle}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="bg-blue-600 rounded-2xl p-8 mt-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Questions About Our Privacy Policy?
          </h2>
          <p className="text-blue-100 mb-6">
            If you have any questions about this privacy policy or our data
            practices, please contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Email Us</h3>
              <p className="text-blue-100">mandalrajeev3@gmail.com</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Call Us</h3>
              <p className="text-blue-100">+91 8871900963</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Mail Us</h3>
              <p className="text-blue-100">
                Hiranandani Business Park, Powai
                <br />
                Hiranandani Gardens, Powai
                <br />
                Mumbai, Maharashtra 400076
                <br />
                Near IIT Bombay
              </p>
            </div>
          </div>
        </div>

        {/* Back to Top */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ↑ Back to Top
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
