import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Privacy Policy",
      content: "We collect personal information during registration, such as name, email, interests, occupation, and denominational affiliation, to enhance your experience."
    },
    {
      title: "Use of Information",
      content: [
        "Facilitate meaningful connections",
        "Improve app functionality",
        "Communicate with users about updates and promotions"
      ],
      isList: true
    },
    {
      title: "Data Sharing",
      content: "We do not sell or rent your personal information to third parties. Data may be shared with service providers assisting in app operations, under strict confidentiality agreements."
    },
    {
      title: "Security",
      content: "We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is entirely secure."
    },
    {
      title: "User Rights",
      content: "You may access, update, or delete your personal information at any time through your account settings."
    },
    {
      title: "Dating Tips",
      content: [
        {
          subtitle: "1. Be Authentic",
          text: "Present yourself genuinely. Authenticity fosters trust and attracts individuals who appreciate you for who you are."
        },
        {
          subtitle: "2. Prioritize Shared Faith",
          text: "Seek partners who share your Christian values and beliefs. A common faith foundation strengthens relationships."
        },
        {
          subtitle: "3. Communicate Openly",
          text: "Honest and open communication is vital. Discuss your expectations, boundaries, and aspirations early on."
        },
        {
          subtitle: "4. Take Your Time",
          text: "Allow the relationship to develop naturally. Patience ensures that the connection is genuine and enduring."
        },
        {
          subtitle: "5. Stay Safe",
          text: "Protect your personal information. Arrange initial meetings in public places and inform a trusted person of your plans."
        },
        {
          subtitle: "6. Pray for Guidance",
          text: "Seek God's guidance in your relationship journey. Prayers can provide clarity and discernment."
        }
      ],
      isTips: true
    },
    {
      title: "About Us",
      content: `Heaven on Earth Connections is a Christian faith-based dating platform designed to bridge the gap between Christian singles in Nigeria and the USA.

Our mission is to facilitate connections that honor Christian values and lead to fulfilling relationships and marriages.

Heaven on Earth on Connections was founded in March 2025, we recognized the need for a space where believers can meet, share, and grow in Christ together.

Our app offers:
• Christian Faith-Based Matching: Connect with individuals who share your beliefs and values.

We are committed to providing a safe and nurturing environment for Christians to find love and companionship.`
    },
    {
      title: "Contact Information",
      content: [
        "Email: Honeconnections@gmail.com",
        "Phone: +1 919-213-1913, +234-813-845-2601",
        "Address: Plot 13b, by Bella Residencia, opposite Cowrie Creek Estate, Palm Spring Road Ikate, Lekki Nigeria, West Africa.",
        "USA Address: 4804 Page Creek Ln, Durham NC 27703"
      ],
      isList: true
    }
  ];

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[40vh] bg-gradient-to-r from-purple-900 to-purple-600">
        <div className="absolute inset-0 bg-black/30">
          <div className="container mx-auto px-4 h-full flex flex-col justify-between">
            <div className="py-6">
              <Link to="/">
                <img src="/hoe.png" alt="HOEC Logo" className="h-[73px]" />
              </Link>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pb-12"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Privacy Policy</h1>
              <p className="text-xl text-white/90">Your privacy matters to us</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="space-y-4"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{section.title}</h2>
                
                {section.isList ? (
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    {section.content.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : section.isTips ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {section.content.map((tip, i) => (
                      <div key={i} className="bg-purple-50 p-6 rounded-xl">
                        <h3 className="font-semibold text-purple-900 mb-2">{tip.subtitle}</h3>
                        <p className="text-gray-700">{tip.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 whitespace-pre-line">{section.content}</p>
                )}
              </motion.section>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#100F0A] text-white py-12">
      <div className="container mx-auto px-4">
        {/* App Store Buttons */}
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6 mb-8">
          <button className="bg-black border border-white/20 rounded-xl p-4 flex items-center justify-center space-x-3 hover:bg-black/80 transition-all">
            <img
              src="/images/appstore-dark.svg"
              alt="App Store"
              className="w-6"
            />
            <span className="text-white text-base font-medium">
              Download on the App Store
            </span>
          </button>

          <button className="bg-black border border-white/20 rounded-xl p-4 flex items-center justify-center space-x-3 hover:bg-black/80 transition-all">
            <img
              src="/images/googleplay-dark.svg"
              alt="Google Play"
              className="w-6"
            />
            <span className="text-white text-base font-medium">
              Get it on Google Play
            </span>
          </button>
        </div>

        {/* Legal Links & Copyright */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-6">
            <Link to="/terms" className="text-white/60 hover:text-white text-sm transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-white/60 hover:text-white text-sm transition-colors">
              Privacy
            </Link>
          </div>
          <p className="text-white/60 text-sm">
            © 2025 Heaven on Earth Connections. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
    </div>
  );
};

export default PrivacyPolicy;
