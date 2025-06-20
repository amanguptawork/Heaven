import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen">
        <img
          src="/images/hero-bg.jpg"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40">
          {/* Navigation Bar */}
          <div className="absolute top-0 w-full py-4 md:py-6 px-4">
            <div className="container mx-auto flex justify-between items-center">
              <img src="/hoe.png" alt="HOEC Logo" className="h-[73px]" />
              <div className="flex items-center space-x-4 md:space-x-8">
                <Link to="/login">
                  <button className="text-white text-sm md:text-base font-medium">
                    Sign In
                  </button>
                </Link>
                <Link to="/register">
                  <button className="bg-white text-[#100F0A] px-4 md:px-6 py-2 rounded-xl text-sm md:text-base font-medium">
                    Join Now
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="container mx-auto px-4 h-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center text-white max-w-4xl"
            >
              <h1 className="text-4xl md:text-6xl lg:text-[90px] font-black leading-tight mb-4 md:mb-6">
                <span>Cross pa</span>
                <span className="italic">t</span>
                <span>hs.</span>
                <br />
                <span>Da</span>
                <span className="italic">t</span>
                <span>e lo</span>
                <span className="italic">ca</span>
                <span>l.</span>
                <br />
                <span>Da</span>
                <span className="italic">t</span>
                <span>e Glo</span>
                <span className="italic">bal.</span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-2xl mb-8 md:mb-12"
              >
                For serious minded Christian singles only.
              </motion.p>

              {/* <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
                <motion.a
                  href="#"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <img
                    src="/images/appstore-dark.svg"
                    alt="Download on App Store"
                    className="h-14 md:h-16"
                  />
                </motion.a>

                <motion.a
                  href="#"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <img
                    src="/images/googleplay-dark.svg"
                    alt="Get it on Google Play"
                    className="h-14 md:h-16"
                  />
                </motion.a>
              </div> */}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Intentions Section */}
      <div className="bg-gradient-to-b from-[#F3EAFF] to-[#FBF8F1] py-16 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="relative h-[400px] md:h-[640px]"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <img
                  src="/images/dating-intentions.png"
                  alt="Dating Intentions"
                  className="object-cover rounded-[20px] md:rounded-[40px] shadow-2xl w-full h-full"
                />
              </motion.div>

              {/* Floating cards */}
              {[
                { text: "Here to date", icon: "🎯", background: "bg-white" },
                {
                  text: "Ready for a relationship",
                  icon: "💝",
                  background: "bg-white/80",
                },
                { text: "Open to chat", icon: "💭", background: "bg-white/60" },
              ].map((card, index) => (
                <motion.div
                  key={card.text}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.2,
                    duration: 0.8,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className={`
                    ${card.background} backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6
                    flex items-center space-x-3 md:space-x-6 shadow-xl
                    transform hover:scale-105 transition-transform duration-300
                    max-w-[240px] md:max-w-none absolute right-[-5%] md:right-[-10%]
                  `}
                  style={{ top: `${25 + index * 33}%` }}
                >
                  <span className="text-2xl md:text-3xl">{card.icon}</span>
                  <span className="text-[#100F0A] text-base md:text-xl font-medium">
                    {card.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center space-y-8 md:space-y-12"
            >
              <h2 className="text-[#100F0A] text-3xl md:text-5xl leading-tight font-bold">
                Meet people who want
                <span className="block">the same thing.</span>
              </h2>

              <div className="space-y-6 md:space-y-8 text-[#100F0A]">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <p className="text-xl md:text-2xl font-medium">
                    Get what you want out of dating.
                  </p>
                  <p className="text-xl md:text-2xl font-medium">
                    No need to apologise.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <p className="text-xl md:text-2xl font-medium">
                    Just want to chat? That's OK.
                  </p>
                  <p className="text-xl md:text-2xl font-medium">
                    Ready to settle down? Love that.
                  </p>
                  <p className="text-xl md:text-2xl font-medium">
                    And if you ever change your mind, you absolutely can.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dating Space Section */}
      <div className="bg-gradient-to-b from-[#3F3F94] to-[rgba(63,63,148,0.70)] py-16 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center order-2 md:order-1"
            >
              <h2 className="text-white text-3xl md:text-5xl leading-tight mb-8 md:mb-12 font-bold">
                A space just for Dating.
              </h2>

              <p className="text-white text-lg md:text-2xl leading-relaxed">
                Your Hone Dating profile and conversations won't be shared with
                anyone outside of Dating. And everything you need to start your
                separate Dating profile is already on the app you know.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[300px] md:h-[508px] order-1 md:order-2"
            >
              <img
                src="/images/dating-space.png"
                alt="Dating Space"
                className="w-full h-full object-contain"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Safety Section */}
      <div className="bg-[#F3EAFF] py-16 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative order-2 md:order-1"
            >
              <div className="bg-[#B492DE] rounded-[20px] md:rounded-[30px] overflow-hidden aspect-[517/368]">
                <img
                  src="/images/safety-first.png"
                  alt="Safety First"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center order-1 md:order-2"
            >
              <h2 className="text-[#121212] text-3xl md:text-4xl leading-tight mb-6 md:mb-8 font-bold">
                Safety first,
                <br />
                second, and always.
              </h2>

              <div className="space-y-4 md:space-y-6">
                <p className="text-[#121212] text-lg md:text-xl">
                  Your safety is our number one priority.
                </p>

                <p className="text-[#121212] text-lg md:text-xl leading-relaxed">
                  Our Safety Centre is a knowledge hub, containing all the
                  support you need to date with confidence.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#100F0A] text-white py-12">
        <div className="container mx-auto px-4">
          {/* App Store Buttons */}
          {/* <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6 mb-8">
            <a href="#">
              <img
                src="/images/appstore-dark.svg"
                alt="Download on App Store"
                className="h-12 md:h-14"
              />
            </a>

            <a href="#">
              <img
                src="/images/googleplay-dark.svg"
                alt="Get it on Google Play"
                className="h-12 md:h-14"
              />
            </a>
          </div> */}

          {/* Legal Links & Copyright */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-6">
              <Link
                to="/terms"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
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

export default LandingPage;
