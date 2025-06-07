import React from "react";

const TermsOfService = () => {
  const lastUpdated = "January 15, 2024";

  const sections = [
    {
      title: "Acceptance of Terms",
      content: [
        {
          subtitle: "Agreement to Terms",
          text: "By accessing or using StayNest's platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services.",
        },
        {
          subtitle: "Eligibility",
          text: "You must be at least 18 years old to use our services. By using StayNest, you represent and warrant that you have the legal capacity to enter into these terms and comply with all applicable laws.",
        },
      ],
    },
    {
      title: "Platform Description",
      content: [
        {
          subtitle: "Service Overview",
          text: 'StayNest is an online platform that connects travelers ("Guests") with property owners and managers ("Hosts") who offer accommodations for short-term rental. We facilitate bookings but are not a party to the rental agreements between Hosts and Guests.',
        },
        {
          subtitle: "Platform Role",
          text: "StayNest acts as an intermediary platform. We do not own, operate, manage, or control any properties listed on our platform. Hosts are responsible for their listings, and Guests are responsible for their bookings and conduct.",
        },
      ],
    },
    {
      title: "User Accounts and Registration",
      content: [
        {
          subtitle: "Account Creation",
          text: "To use certain features of our platform, you must create an account and provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials.",
        },
        {
          subtitle: "Account Verification",
          text: "We may require identity verification, including government-issued ID, phone number verification, and other documentation to ensure platform safety and comply with legal requirements.",
        },
        {
          subtitle: "Account Suspension",
          text: "We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or pose a risk to our community.",
        },
      ],
    },
    {
      title: "Host Responsibilities",
      content: [
        {
          subtitle: "Listing Accuracy",
          text: "Hosts must provide accurate, complete, and up-to-date information about their properties, including descriptions, photos, amenities, pricing, and availability. Misleading information is prohibited.",
        },
        {
          subtitle: "Legal Compliance",
          text: "Hosts are responsible for complying with all applicable laws, regulations, tax obligations, and local ordinances related to their rental activities, including obtaining necessary permits and licenses.",
        },
        {
          subtitle: "Guest Safety",
          text: "Hosts must ensure their properties meet basic safety standards, provide accurate safety information, and promptly address any safety concerns raised by guests.",
        },
        {
          subtitle: "Non-Discrimination",
          text: "Hosts must not discriminate against guests based on race, religion, national origin, ethnicity, disability, sex, gender identity, sexual orientation, or age, except as required by applicable law.",
        },
      ],
    },
    {
      title: "Guest Responsibilities",
      content: [
        {
          subtitle: "Booking Accuracy",
          text: "Guests must provide accurate information when making bookings, including the number of guests, purpose of stay, and any special requirements. Misrepresentation may result in booking cancellation.",
        },
        {
          subtitle: "Property Respect",
          text: "Guests must treat Host properties with respect, follow house rules, and leave properties in the same condition as found. Guests are liable for any damage caused during their stay.",
        },
        {
          subtitle: "Compliance with Rules",
          text: "Guests must comply with all house rules, local laws, and community standards. Disruptive behavior, illegal activities, or violations of house rules may result in immediate removal.",
        },
      ],
    },
    {
      title: "Booking and Payment Terms",
      content: [
        {
          subtitle: "Booking Process",
          text: "Bookings are confirmed when payment is successfully processed and both Host and Guest receive confirmation. All bookings are subject to Host acceptance and availability.",
        },
        {
          subtitle: "Payment Processing",
          text: "StayNest processes payments on behalf of Hosts. We charge a service fee for our platform services. Payment methods include credit cards, debit cards, and other approved payment systems.",
        },
        {
          subtitle: "Cancellation Policies",
          text: "Each listing has a specific cancellation policy set by the Host. Cancellation terms vary and may include penalties. Guests should review cancellation policies before booking.",
        },
        {
          subtitle: "Refunds",
          text: "Refunds are processed according to the applicable cancellation policy. In cases of Host cancellation or significant property issues, guests may be eligible for full refunds and additional compensation.",
        },
      ],
    },
    {
      title: "Prohibited Activities",
      content: [
        {
          subtitle: "Platform Misuse",
          text: "Users may not use our platform for illegal activities, fraud, spam, harassment, or any activity that violates these terms or applicable laws.",
        },
        {
          subtitle: "Content Violations",
          text: "Users may not post false, misleading, defamatory, or inappropriate content. All content must comply with our community standards and applicable laws.",
        },
        {
          subtitle: "Circumvention",
          text: "Users may not attempt to circumvent our platform to avoid fees, contact other users outside our messaging system for bookings, or engage in off-platform transactions.",
        },
      ],
    },
    {
      title: "Intellectual Property",
      content: [
        {
          subtitle: "Platform Content",
          text: "StayNest owns or licenses all content on our platform, including text, graphics, logos, and software. Users may not copy, modify, or distribute our content without permission.",
        },
        {
          subtitle: "User Content",
          text: "Users retain ownership of content they post but grant StayNest a license to use, display, and distribute such content for platform operations and marketing purposes.",
        },
      ],
    },
    {
      title: "Limitation of Liability",
      content: [
        {
          subtitle: "Platform Disclaimer",
          text: 'StayNest provides the platform "as is" without warranties. We are not liable for the actions of Hosts or Guests, property conditions, or issues arising from rental agreements.',
        },
        {
          subtitle: "Damage Limitation",
          text: "Our liability is limited to the amount of fees paid to StayNest for the specific booking in question. We are not liable for indirect, incidental, or consequential damages.",
        },
      ],
    },
    {
      title: "Dispute Resolution",
      content: [
        {
          subtitle: "Resolution Process",
          text: "We encourage users to resolve disputes directly. If needed, StayNest may mediate disputes and make determinations regarding refunds, cancellations, or other issues.",
        },
        {
          subtitle: "Arbitration",
          text: "Any disputes that cannot be resolved through our platform will be subject to binding arbitration in accordance with the rules of the American Arbitration Association.",
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
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            These Terms of Service govern your use of the StayNest platform and
            services.
          </p>
          <p className="text-sm text-gray-500">
            <strong>Last Updated:</strong> {lastUpdated}
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-yellow-600 mt-1 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Important Notice
              </h3>
              <p className="text-yellow-700">
                Please read these terms carefully before using our platform. By
                using StayNest, you agree to be bound by these terms. If you do
                not agree to these terms, please do not use our services.
              </p>
            </div>
          </div>
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

        {/* Terms Sections */}
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

        {/* Contact and Updates */}
        <div className="bg-blue-600 rounded-2xl p-8 mt-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              Questions or Concerns?
            </h2>
            <p className="text-blue-100">
              If you have any questions about these Terms of Service, please
              contact our legal team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <h3 className="text-white font-semibold mb-2">
                Legal Department
              </h3>
              <p className="text-blue-100 text-sm">mandalrajeev3@gmail.com</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <h3 className="text-white font-semibold mb-2">General Support</h3>
              <p className="text-blue-100 text-sm">mandalrajeev3@gmail.com</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
              <h3 className="text-white font-semibold mb-2">Phone Support</h3>
              <p className="text-blue-100 text-sm">+91 8871900963</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Updates to Terms</h3>
            <p className="text-blue-100 text-sm">
              We may update these Terms of Service from time to time. We will
              notify users of any material changes by posting the updated terms
              on our platform and updating the "Last Updated" date. Continued
              use of our platform after changes constitutes acceptance of the
              new terms.
            </p>
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

export default TermsOfService;
