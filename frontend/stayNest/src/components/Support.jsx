import React, { useState } from "react";
import { Link } from "react-router-dom";

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // Email form state
  const [emailForm, setEmailForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });

  // Phone form state
  const [phoneForm, setPhoneForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredTime: "ASAP",
    issue: "",
  });

  const faqCategories = [
    { id: "all", name: "All Topics", icon: "📋" },
    { id: "booking", name: "Booking & Reservations", icon: "📅" },
    { id: "hosting", name: "Hosting", icon: "🏠" },
    { id: "payments", name: "Payments & Billing", icon: "💳" },
    { id: "safety", name: "Safety & Security", icon: "🛡️" },
    { id: "account", name: "Account Management", icon: "👤" },
    { id: "technical", name: "Technical Issues", icon: "⚙️" },
  ];

  const faqs = [
    {
      category: "booking",
      question: "How do I book a property on StayNest?",
      answer:
        'To book a property: 1) Search for your destination and dates, 2) Browse available properties, 3) Select your preferred property, 4) Click "Book Now", 5) Fill in guest details and payment information, 6) Confirm your booking. You\'ll receive a confirmation email immediately.',
    },
    {
      category: "booking",
      question: "Can I cancel my booking?",
      answer:
        "Yes, you can cancel your booking according to the property's cancellation policy. Most properties offer free cancellation up to 24-48 hours before check-in. Check your booking confirmation for specific cancellation terms.",
    },
    {
      category: "booking",
      question: "What happens if the host cancels my booking?",
      answer:
        "If a host cancels your confirmed booking, you'll receive a full refund within 3-5 business days. We'll also help you find alternative accommodation and may provide additional compensation for the inconvenience.",
    },
    {
      category: "hosting",
      question: "How do I become a host on StayNest?",
      answer:
        'To become a host: 1) Create an account and select "Host My Place", 2) Add your property details, photos, and amenities, 3) Set your pricing and availability, 4) Complete identity verification, 5) Publish your listing. Our team will review and approve your listing within 24 hours.',
    },
    {
      category: "hosting",
      question: "What percentage does StayNest take from bookings?",
      answer:
        "StayNest charges a 3% service fee from hosts for each completed booking. This covers payment processing, customer support, insurance coverage, and platform maintenance. There are no upfront costs or monthly fees.",
    },
    {
      category: "hosting",
      question: "How do I handle guest check-ins?",
      answer:
        "You can manage check-ins through: 1) In-person greeting, 2) Self-check-in with lockbox or smart lock, 3) Key exchange with a trusted neighbor. Provide clear check-in instructions in your listing and communicate with guests before arrival.",
    },
    {
      category: "payments",
      question: "When do I get paid as a host?",
      answer:
        "Hosts receive payment 24 hours after the guest's successful check-in. Payments are processed via bank transfer, PayPal, or other supported payment methods in your region. You can track all payments in your host dashboard.",
    },
    {
      category: "payments",
      question: "How does payment work?",
      answer:
        "Bookings are confirmed instantly, and payment is made directly to the host upon arrival. You'll see the exact amount to pay in your booking confirmation. We accept cash and card payments at the property.",
    },
    {
      category: "payments",
      question: "When do I need to pay?",
      answer:
        "Payment is due upon arrival at the property. No upfront payment is required to confirm your booking. Simply bring the total amount shown in your booking confirmation (cash or card accepted).",
    },
    {
      category: "safety",
      question: "How does StayNest ensure guest and host safety?",
      answer:
        "Safety measures include: 1) Identity verification for all users, 2) Secure messaging system, 3) 24/7 customer support, 4) Host and guest reviews, 5) $1M insurance coverage, 6) Emergency contact system, 7) Background checks for hosts in select regions.",
    },
    {
      category: "safety",
      question: "What should I do in case of an emergency?",
      answer:
        "For immediate emergencies, contact local emergency services (911, 112, etc.). For StayNest-related urgent issues, call our 24/7 emergency line at +91 8871900963. We have dedicated safety specialists available around the clock.",
    },
    {
      category: "account",
      question: "How do I verify my identity?",
      answer:
        "Identity verification requires: 1) Government-issued photo ID (passport, driver's license), 2) Phone number verification, 3) Email confirmation, 4) Optional: Social media account linking. This process typically takes 5-10 minutes and helps build trust in our community.",
    },
    {
      category: "technical",
      question: "I'm having trouble with the website/app. What should I do?",
      answer:
        "Try these steps: 1) Clear your browser cache and cookies, 2) Update your browser or app, 3) Check your internet connection, 4) Try using a different browser or device. If issues persist, contact our technical support team with details about your device and browser.",
    },
  ];

  // Handler functions
  const handleEmailFormChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneFormChange = (e) => {
    const { name, value } = e.target;
    setPhoneForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/support/query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailForm),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSubmitMessage(
          "✅ Your query has been submitted successfully! We'll get back to you within 2 hours."
        );
        setEmailForm({
          name: "",
          email: "",
          subject: "",
          category: "general",
          message: "",
        });
        setTimeout(() => setShowEmailModal(false), 3000);
      } else {
        setSubmitMessage(
          "❌ " + (data.message || "Failed to submit query. Please try again.")
        );
      }
    } catch (error) {
      setSubmitMessage(
        "❌ Network error. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/support/phone-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(phoneForm),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSubmitMessage(
          "✅ Phone support request submitted! We'll call you back within 30 minutes."
        );
        setPhoneForm({
          name: "",
          email: "",
          phone: "",
          preferredTime: "ASAP",
          issue: "",
        });
        setTimeout(() => setShowPhoneModal(false), 3000);
      } else {
        setSubmitMessage(
          "❌ " +
            (data.message || "Failed to submit request. Please try again.")
        );
      }
    } catch (error) {
      setSubmitMessage(
        "❌ Network error. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSupportAction = (actionType) => {
    switch (actionType) {
      case "Email Support":
        setShowEmailModal(true);
        break;
      case "Phone Support":
        setShowPhoneModal(true);
        break;
      case "Live Chat":
        // For now, redirect to contact page
        window.location.href = "/contact";
        break;
      case "Help Center":
        // Scroll to FAQ section
        document
          .getElementById("faq-section")
          ?.scrollIntoView({ behavior: "smooth" });
        break;
      default:
        break;
    }
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const supportOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: "💬",
      action: "Start Chat",
      available: "24/7",
      color: "bg-blue-500",
    },
    {
      title: "Phone Support",
      description: "Speak directly with a support specialist",
      icon: "📞",
      action: "Call Now",
      available: "24/7",
      color: "bg-green-500",
    },
    {
      title: "Email Support",
      description: "Send us a detailed message",
      icon: "✉️",
      action: "Send Email",
      available: "2hr response",
      color: "bg-purple-500",
    },
    {
      title: "Help Center",
      description: "Browse our comprehensive guides",
      icon: "📚",
      action: "Browse Guides",
      available: "Self-service",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Support Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions or get in touch with our support
            team
          </p>
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {supportOptions.map((option, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div
                className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center text-white text-2xl mb-4`}
              >
                {option.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {option.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{option.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {option.available}
                </span>
                <button
                  onClick={() => handleSupportAction(option.title)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline transition-all"
                >
                  {option.action} →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div id="faq-section" className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {faqCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <details
                  key={index}
                  className="group border border-gray-200 rounded-lg"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <svg
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No FAQs found matching your search criteria.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-blue-600 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Still need help?
          </h2>
          <p className="text-blue-100 mb-6">
            Can't find what you're looking for? Our support team is here to help
            you 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white text-blue-600 py-3 px-6 rounded-xl font-medium hover:bg-blue-50 transition-colors"
            >
              Contact Support
            </Link>
            <button className="bg-blue-700 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-800 transition-colors">
              Start Live Chat
            </button>
          </div>
        </div>

        {/* Email Support Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    📧 Email Support
                  </h3>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {submitMessage && (
                  <div
                    className={`mb-4 p-3 rounded-lg ${
                      submitMessage.includes("✅")
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={emailForm.name}
                        onChange={handleEmailFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={emailForm.email}
                        onChange={handleEmailFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        name="category"
                        value={emailForm.category}
                        onChange={handleEmailFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="booking">Booking Support</option>
                        <option value="hosting">Hosting Questions</option>
                        <option value="technical">Technical Issues</option>
                        <option value="billing">Billing & Payments</option>
                        <option value="safety">Safety & Security</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={emailForm.subject}
                        onChange={handleEmailFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={emailForm.message}
                      onChange={handleEmailFormChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Please describe your issue or question..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(false)}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? "Sending..." : "Send Email"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Phone Support Modal */}
        {showPhoneModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    📞 Phone Support
                  </h3>
                  <button
                    onClick={() => setShowPhoneModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {submitMessage && (
                  <div
                    className={`mb-4 p-3 rounded-lg ${
                      submitMessage.includes("✅")
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}

                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={phoneForm.name}
                        onChange={handlePhoneFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={phoneForm.phone}
                        onChange={handlePhoneFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={phoneForm.email}
                      onChange={handlePhoneFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Time
                      </label>
                      <select
                        name="preferredTime"
                        value={phoneForm.preferredTime}
                        onChange={handlePhoneFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="ASAP">ASAP</option>
                        <option value="Morning (9AM-12PM)">
                          Morning (9AM-12PM)
                        </option>
                        <option value="Afternoon (12PM-5PM)">
                          Afternoon (12PM-5PM)
                        </option>
                        <option value="Evening (5PM-8PM)">
                          Evening (5PM-8PM)
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issue Type
                      </label>
                      <input
                        type="text"
                        name="issue"
                        value={phoneForm.issue}
                        onChange={handlePhoneFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      📞 We'll call you back within 30 minutes during business
                      hours (9AM-6PM IST).
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPhoneModal(false)}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? "Requesting..." : "Request Callback"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;
