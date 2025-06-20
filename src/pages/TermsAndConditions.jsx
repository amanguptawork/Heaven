import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaTiktok } from 'react-icons/fa';

const TermsAndConditions = () => {
  return (
    <div className="relative h-[40vh] bg-gradient-to-r from-purple-900 to-purple-600">
      {/* Hero Section */}
      <div className="relative h-[40vh]">
         <img
          src="/images/terms-bg.jpg"
          alt="Terms Background"
          className="absolute inset-0 w-full h-full object-cover"
        /> 
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40">
          {/* Navigation Bar */}
          <div className="absolute top-0 w-full py-4 md:py-6 px-4">
            <div className="container mx-auto flex justify-between items-center">
              <Link to="/">
                <img src="/hoe.png" alt="HOEC Logo" className="h-[73px]" />
              </Link>
            </div>
          </div>

          {/* Hero Content */}
          <div className="container mx-auto px-4 h-full flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white max-w-4xl"
            ><br></br><br></br>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Terms and Conditions
              </h1>
              <p className="text-xl md:text-2xl opacity-90">
                Please read these terms carefully before using our services
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Terms Content */}
      <div className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-12"
          >
            {/* Acceptance Section */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using the "Heaven on Earth Connections" app, you agree to comply with and be bound by these Terms and Conditions. If you disagree, please refrain from using our services.
              </p>
            </section>

            {/* Eligibility Section */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Eligibility
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Users must be at least 18 years of age and identify as a Christian to register. By creating an account, you confirm that you meet these criteria.
              </p>
            </section>

            {/* Account Section */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Account Responsibility
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.
              </p>
            </section>

            {/* User Conduct Section */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                User Conduct
              </h2>
              <div className="space-y-2">
                <p className="text-gray-700">Users agree to:</p>
                <ul className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>Provide accurate and truthful pieces of information.</li>
                  <li>Use the app solely for personal, non-commercial purposes.</li>
                  <li>Refrain from posting offensive, harmful, or inappropriate content.</li>
                  <li>Soliciting money or seeking to take advantage of anyone on the platform.</li>
                  <li>Engaging in any other activities that put anyone else in danger or undermine the purpose of the platform.</li>
                </ul>
              </div>
            </section>

            {/* Termination Section */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Termination
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these terms or engage in inappropriate behavior.
              </p>
            </section>

            {/* Liability Section */}
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                "Heaven on Earth Connections" is not liable for any indirect, incidental, or consequential damages arising from the use of our services.
              </p>
            </section>
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

export default TermsAndConditions;
