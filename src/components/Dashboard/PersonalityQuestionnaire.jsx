import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiArrowRightLine, RiArrowLeftLine, RiCloseLine } from "react-icons/ri";
import { logEvent } from "../../utils/analytics";
import axiosInstance from "../../api/axios";
import { checkAuthStatus } from "../../api/auth";
import { fetchUserProfile } from "../../api/profile";
import useUserProfileStore from "../../store/user";

const PersonalityQuestionnaire = ({ onComplete, onClose }) => {
  const setUserProfile = useUserProfileStore((s) => s.setUserProfile);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const loggedInUser = await checkAuthStatus();
        if (!loggedInUser) {
          // If no user is found, just set user to null (don't reload or navigate)
          setUser(null);
        } else {
          setUser(loggedInUser);
          console.log(
            "Current user on PersonalityQuestionnaire page:",
            loggedInUser
          );
        }
      } catch (error) {
        console.error(
          "Error fetching user in PersonalityQuestionnaire page:",
          error
        );
        // If there's an error, also just set user to null
        setUser(null);
      }
    })();
  }, []);

  const questions = [
    // Faith Fundamentals section
    {
      id: "FF_1",
      category: "faithFundamentals",
      text: "Do you consider yourself a born-again Christian?",
      options: [
        { value: "A", text: "Yes" },
        { value: "B", text: "Not sure" },
        { value: "C", text: "No" },
      ],
      weight: 10,
      matchingLogic: "critical",
    },
    {
      id: "FF_2",
      category: "faithFundamentals",
      text: "Have you been water baptized?",
      options: [
        { value: "A", text: "Yes" },
        { value: "B", text: "Not sure" },
        { value: "C", text: "No" },
      ],
      weight: 9,
      matchingLogic: "exact",
    },
    {
      id: "FF_3",
      category: "faithFundamentals",
      text: "Have you been baptized in the Holy Spirit and do you speak in other tongues?",
      options: [
        { value: "A", text: "Yes" },
        { value: "B", text: "Not sure" },
        { value: "C", text: "No" },
      ],
      weight: 9,
      matchingLogic: "exact",
    },
    {
      id: "FF_4",
      category: "faithFundamentals",
      text: "Are you actively part of a local Christian assembly/church?",
      options: [
        { value: "A", text: "Yes" },
        { value: "B", text: "Not sure" },
        { value: "C", text: "No" },
      ],
      weight: 9,
      matchingLogic: "exact",
    }, // Spiritual Practices section
    {
      id: "SP_1",
      category: "spiritualPractices",
      text: "How often do you read the Bible?",
      options: [
        { value: "A", text: "Daily" },
        { value: "B", text: "Occasionally" },
        { value: "C", text: "Rarely" },
      ],
      weight: 8,
      matchingLogic: "flexible-range",
    },
    {
      id: "SP_2",
      category: "spiritualPractices",
      text: "How do you prefer to grow spiritually?",
      options: [
        { value: "A", text: "Personal Bible study and prayer" },
        {
          value: "B",
          text: "Church attendance, sermons and group discussions",
        },
        { value: "C", text: "Listening to Christian podcasts and music" },
      ],
      weight: 7,
      matchingLogic: "preference",
    },
    {
      id: "SP_3",
      category: "spiritualPractices",
      text: "What type of church do you prefer?",
      options: [
        {
          value: "A",
          text: "Traditional (e.g., Catholic, Anglican, Orthodox)",
        },
        { value: "B", text: "Contemporary (e.g., Pentecostal, Charismatic)" },
        { value: "C", text: "Non-denominational" },
      ],
      weight: 8,
      matchingLogic: "preference",
    },
    {
      id: "SP_4",
      category: "spiritualPractices",
      text: "How often do you attend church services?",
      options: [
        { value: "A", text: "Every week" },
        { value: "B", text: "Once or twice a month" },
        { value: "C", text: "Only on special occasions" },
      ],
      weight: 8,
      matchingLogic: "flexible-range",
    },
    {
      id: "SP_5",
      category: "spiritualPractices",
      text: "What is your view on speaking in tongues?",
      options: [
        { value: "A", text: "I believe it's essential for spiritual growth" },
        { value: "B", text: "I believe it happens, but it isn't necessary" },
        {
          value: "C",
          text: "I don't know much about it or I'm skeptical about it",
        },
      ],
      weight: 7,
      matchingLogic: "exact",
    },
    {
      id: "SP_6",
      category: "spiritualPractices",
      text: "How important is fasting to you?",
      options: [
        { value: "A", text: "Very important – I fast regularly" },
        { value: "B", text: "Occasionally, when necessary" },
        { value: "C", text: "I don't practice fasting" },
      ],
      weight: 6,
      matchingLogic: "flexible-range",
    },
    {
      id: "SP_7",
      category: "spiritualPractices",
      text: "How do you prefer to worship?",
      options: [
        { value: "A", text: "Lively praise and worship with music" },
        { value: "B", text: "Quiet meditation and hymns" },
        { value: "C", text: "A mix of both" },
      ],
      weight: 6,
      matchingLogic: "preference",
    },
    {
      id: "SP_8",
      category: "spiritualPractices",
      text: "What role does prayer play in your life?",
      options: [
        { value: "A", text: "Central – I pray multiple times daily" },
        { value: "B", text: "Important – I pray when I feel led" },
        { value: "C", text: "I struggle with prayer" },
      ],
      weight: 8,
      matchingLogic: "flexible-range",
    },
    {
      id: "SP_9",
      category: "spiritualPractices",
      text: "What is your view on tithing?",
      options: [
        {
          value: "A",
          text: "It's a biblical principle and I tithe faithfully",
        },
        { value: "B", text: "I give offerings, but not necessarily 10%" },
        { value: "C", text: "I don't believe tithing is required" },
      ],
      weight: 7,
      matchingLogic: "exact",
    }, // Religious Views (Questions 14-19)
    // Religious Views section
    {
      id: "RV_1",
      category: "religiousViews",
      text: "Would you be open to a relationship with someone of a different Christian denomination?",
      options: [
        { value: "A", text: "Yes, as long as we share core beliefs" },
        { value: "B", text: "Maybe, but we must discuss differences" },
        { value: "C", text: "No, I prefer someone from my denomination" },
      ],
      weight: 8,
      matchingLogic: "exact",
    },
    {
      id: "RV_2",
      category: "religiousViews",
      text: "What is your stance on premarital sex?",
      options: [
        { value: "A", text: "I believe in waiting until marriage" },
        { value: "B", text: "It depends on the relationship and commitment" },
        { value: "C", text: "I don't think it's necessary to wait" },
      ],
      weight: 10,
      matchingLogic: "exact",
    },
    {
      id: "RV_3",
      category: "religiousViews",
      text: "How do you feel about cohabitation before marriage?",
      options: [
        { value: "A", text: "It's not biblical and I won't do it" },
        { value: "B", text: "I would consider it under certain circumstances" },
        { value: "C", text: "I don't see anything wrong with it" },
      ],
      weight: 9,
      matchingLogic: "exact",
    },
    {
      id: "RV_4",
      category: "religiousViews",
      text: "What is your view on divorce and remarriage?",
      options: [
        { value: "A", text: "Only acceptable in cases of adultery or abuse" },
        {
          value: "B",
          text: "Divorce happens, but remarriage should be carefully considered",
        },
        { value: "C", text: "People should be free to remarry anytime" },
      ],
      weight: 8,
      matchingLogic: "exact",
    },
    {
      id: "RV_5",
      category: "religiousViews",
      text: "Do you believe in gender roles in a Christian marriage?",
      options: [
        { value: "A", text: "Yes, the husband leads, and the wife submits" },
        {
          value: "B",
          text: "Some traditional roles apply, but flexibility is needed",
        },
        { value: "C", text: "No, marriage should be fully equal and shared" },
      ],
      weight: 9,
      matchingLogic: "exact",
    },
    {
      id: "RV_6",
      category: "religiousViews",
      text: "How do you view money management in marriage?",
      options: [
        { value: "A", text: "The husband should take full responsibility" },
        { value: "B", text: "It should be a shared effort" },
        { value: "C", text: "Each person should manage their own finances" },
      ],
      weight: 8,
      matchingLogic: "exact",
    },
    // Family & Marriage Values section
    {
      id: "FMV_1",
      category: "familyMarriageValues",
      text: "Would you be willing to move for your future spouse?",
      options: [
        { value: "A", text: "Yes, I'm open to relocating" },
        { value: "B", text: "Maybe, but it depends on the situation" },
        { value: "C", text: "No, I prefer to stay where I am" },
      ],
      weight: 8,
      matchingLogic: "flexible",
    },
    {
      id: "FMV_2",
      category: "familyMarriageValues",
      text: "How important is family approval in your relationship decisions?",
      options: [
        { value: "A", text: "Very important – I won't go against my family" },
        {
          value: "B",
          text: "Somewhat important – I will consider their views",
        },
        { value: "C", text: "Not important – My relationship is my decision" },
      ],
      weight: 7,
      matchingLogic: "flexible-range",
    },
    {
      id: "FMV_3",
      category: "familyMarriageValues",
      text: "What is your stance on children in marriage?",
      options: [
        { value: "A", text: "I definitely want children" },
        { value: "B", text: "I'm open to children but not sure" },
        { value: "C", text: "I don't want children" },
      ],
      weight: 10,
      matchingLogic: "exact",
    },
    {
      id: "FMV_4",
      category: "familyMarriageValues",
      text: "What is your stance on adopting children?",
      options: [
        { value: "A", text: "I am open to it" },
        { value: "B", text: "I am not sure about it" },
        { value: "C", text: "I don't believe in adopting children" },
      ],
      weight: 6,
      matchingLogic: "flexible",
    },
    {
      id: "FMV_5",
      category: "familyMarriageValues",
      text: "How should conflicts be handled in a Christian relationship?",
      options: [
        { value: "A", text: "Through prayer and biblical counsel" },
        { value: "B", text: "Through honest conversations and compromise" },
        { value: "C", text: "Each person should do what feels right" },
      ],
      weight: 9,
      matchingLogic: "flexible-range",
    },
    {
      id: "FMV_6",
      category: "familyMarriageValues",
      text: "What is your ideal wedding size?",
      options: [
        { value: "A", text: "Big and elaborate" },
        { value: "B", text: "Small and intimate" },
        { value: "C", text: "Just a simple court wedding" },
      ],
      weight: 4,
      matchingLogic: "preference",
    },
    // Lifestyle & Personality Questions
    {
      id: "LP_1",
      category: "lifestylePersonality",
      text: "Are you more introverted or extroverted?",
      options: [
        { value: "A", text: "Introverted – I prefer quiet time" },
        { value: "B", text: "Extroverted – I love social gatherings" },
        { value: "C", text: "A mix of both" },
      ],
      weight: 8,
      matchingLogic: "complementary",
    },
    {
      id: "LP_2",
      category: "lifestylePersonality",
      text: "How do you prefer to spend your weekends?",
      options: [
        { value: "A", text: "At church or Christian events" },
        { value: "B", text: "Outdoors, traveling, or socializing" },
        { value: "C", text: "Relaxing at home with books or movies" },
      ],
      weight: 7,
      matchingLogic: "preference",
    },
    {
      id: "LP_3",
      category: "lifestylePersonality",
      text: "What's your approach to health and fitness?",
      options: [
        { value: "A", text: "I exercise regularly and eat healthily" },
        { value: "B", text: "I try to stay fit but not consistently" },
        { value: "C", text: "I don't focus much on fitness" },
      ],
      weight: 6,
      matchingLogic: "flexible-range",
    },
    {
      id: "LP_4",
      category: "lifestylePersonality",
      text: "Do you drink alcohol?",
      options: [
        {
          value: "A",
          text: "No, I believe Christians shouldn't drink alcohol",
        },
        { value: "B", text: "Occasionally, but in moderation" },
        { value: "C", text: "Yes, I don't see it as a problem" },
      ],
      weight: 9,
      matchingLogic: "exact",
    },
    {
      id: "LP_5",
      category: "lifestylePersonality",
      text: "Do you listen to secular music?",
      options: [
        { value: "A", text: "Only Christian music" },
        { value: "B", text: "Mostly Christian, but some secular" },
        { value: "C", text: "I listen to all kinds of music" },
      ],
      weight: 5,
      matchingLogic: "flexible-range",
    },
    {
      id: "LP_6",
      category: "lifestylePersonality",
      text: "How important is physical attraction in a relationship?",
      options: [
        { value: "A", text: "Very important" },
        { value: "B", text: "Somewhat important" },
        { value: "C", text: "Not very important" },
      ],
      weight: 7,
      matchingLogic: "preference",
    },
    {
      id: "LP_7",
      category: "lifestylePersonality",
      text: "How important is the height of your partner?",
      options: [
        { value: "A", text: "Very important" },
        { value: "B", text: "Somewhat important" },
        { value: "C", text: "Not very important" },
      ],
      weight: 4,
      matchingLogic: "preference",
    },
    {
      id: "LP_8",
      category: "lifestylePersonality",
      text: "Would you date someone who is not financially stable?",
      options: [
        { value: "A", text: "Yes, if they have potential and are hardworking" },
        { value: "B", text: "Maybe, but it depends on their ambition" },
        { value: "C", text: "No, financial stability is a must" },
      ],
      weight: 8,
      matchingLogic: "flexible",
    },
    {
      id: "LP_9",
      category: "lifestylePersonality",
      text: "How do you feel about long-distance relationships?",
      options: [
        { value: "A", text: "I'm open to them" },
        { value: "B", text: "Only for a short time" },
        { value: "C", text: "I prefer someone nearby" },
      ],
      weight: 6,
      matchingLogic: "preference",
    },
    {
      id: "LP_10",
      category: "lifestylePersonality",
      text: "Do you enjoy traveling?",
      options: [
        { value: "A", text: "Yes, I love exploring new places" },
        { value: "B", text: "Sometimes, but I prefer home" },
        { value: "C", text: "Not really, I like staying in one place" },
      ],
      weight: 5,
      matchingLogic: "preference",
    },
    {
      id: "LP_11",
      category: "lifestylePersonality",
      text: "What is your preferred way to spend quality time with a partner?",
      options: [
        { value: "A", text: "Deep conversations and Bible study" },
        { value: "B", text: "Fun activities and traveling together" },
        { value: "C", text: "Relaxing at home watching movies" },
      ],
      weight: 8,
      matchingLogic: "preference",
    },
    // Relationship Expectations Questions (37-40)
    {
      id: "RE_1",
      category: "relationshipExpectations",
      text: "How soon would you want to get married?",
      options: [
        { value: "A", text: "Within a year" },
        { value: "B", text: "Within 2-3 years" },
        {
          value: "C",
          text: "I'm in no rush right now. I am waiting for the right time",
        },
      ],
      weight: 9, // High weight due to timeline compatibility importance
      matchingLogic: "flexible-range", // Allow matching within adjacent options
    },
    {
      id: "RE_2",
      category: "relationshipExpectations",
      text: "Do you believe men should always initiate relationships?",
      options: [
        { value: "A", text: "Yes, the Bible supports it" },
        { value: "B", text: "Either partner can initiate" },
        { value: "C", text: "It doesn't matter at all" },
      ],
      weight: 7, // Moderate-high weight for theological/practical alignment
      matchingLogic: "exact", // Strict matching for theological views
    },
    {
      id: "RE_3",
      category: "relationshipExpectations",
      text: "What is your love language?",
      options: [
        { value: "A", text: "Words of affirmation or gifts" },
        { value: "B", text: "Quality time or acts of service" },
        { value: "C", text: "Physical touch or a mix" },
      ],
      weight: 8, // High weight for relationship dynamics
      matchingLogic: "complementary", // Allow for complementary love languages
    },
    {
      id: "RE_4",
      category: "relationshipExpectations",
      text: "What kind of Christian upbringing did you have?",
      options: [
        { value: "A", text: "Raised in a strong Christian home" },
        { value: "B", text: "Christian values were present but not strict" },
        { value: "C", text: "I became a Christian later in life" },
      ],
      weight: 6, // Moderate weight for background understanding
      matchingLogic: "flexible", // Allow diverse backgrounds to match
    }, // Background & History Questions (41-50)
    {
      id: "BH_1",
      category: "backgroundHistory",
      text: "How involved were your parents in your spiritual growth?",
      options: [
        { value: "A", text: "Very involved – they taught me everything" },
        {
          value: "B",
          text: "Somewhat involved – they encouraged church but not strictly",
        },
        { value: "C", text: "Not involved – my faith journey was personal" },
      ],
      weight: 7,
      matchingLogic: "understanding",
      impactScore: "high",
    },
    {
      id: "BH_2",
      category: "backgroundHistory",
      text: "How do you feel about your childhood experience?",
      options: [
        { value: "A", text: "I had a happy and supportive upbringing" },
        {
          value: "B",
          text: "My childhood had some struggles, but it shaped me",
        },
        { value: "C", text: "I faced many challenges, but I overcame them" },
      ],
      weight: 8,
      matchingLogic: "empathy",
      traumaAware: true,
    },
    {
      id: "BH_3",
      category: "backgroundHistory",
      text: "How many siblings do you have?",
      options: [
        { value: "A", text: "Many – I come from a big family" },
        { value: "B", text: "A few – I have one or two siblings" },
        { value: "C", text: "None – I'm an only child" },
      ],
      weight: 5,
      matchingLogic: "informative",
      familyDynamics: true,
    },
    {
      id: "BH_4",
      category: "backgroundHistory",
      text: "Were you actively involved in church as a child?",
      options: [
        { value: "A", text: "Yes, I was very involved" },
        { value: "B", text: "Somewhat – I attended but wasn't too involved" },
        {
          value: "C",
          text: "No, I wasn't actively engaged in church activities",
        },
      ],
      weight: 6,
      matchingLogic: "spiritual-background",
      faithJourney: true,
    },
    {
      id: "BH_5",
      category: "backgroundHistory",
      text: "What was your experience with dating in the past?",
      options: [
        {
          value: "A",
          text: "I have had serious relationships but never married",
        },
        { value: "B", text: "I have limited dating experience" },
        { value: "C", text: "I've never been in a serious relationship" },
      ],
      weight: 8,
      matchingLogic: "experience-sensitive",
      relationshipHistory: true,
    },
    {
      id: "BH_6",
      category: "backgroundHistory",
      text: "Have you ever been engaged or married before?",
      options: [
        { value: "A", text: "No, I've never been married or engaged" },
        {
          value: "B",
          text: "Yes, I was engaged/married but it didn't work out",
        },
        { value: "C", text: "I am a widower/widow" },
      ],
      weight: 9,
      matchingLogic: "critical-info",
      dealBreaker: true,
    },
    {
      id: "BH_7",
      category: "backgroundHistory",
      text: "Do you have children from a previous relationship?",
      options: [
        { value: "A", text: "No, I don't have children" },
        { value: "B", text: "Yes, I have one or more children" },
        {
          value: "C",
          text: "No, but I'm open to dating someone with children",
        },
      ],
      weight: 9,
      matchingLogic: "family-status",
      dealBreaker: true,
    },
    {
      id: "BH_8",
      category: "backgroundHistory",
      text: "How important is it that your partner comes from a similar background?",
      options: [
        { value: "A", text: "Very important – shared background is key" },
        {
          value: "B",
          text: "Somewhat important – it helps but isn't necessary",
        },
        { value: "C", text: "Not important – love and faith matter more" },
      ],
      weight: 7,
      matchingLogic: "preference-based",
      culturalValues: true,
    },
    {
      id: "BH_9",
      category: "backgroundHistory",
      text: "How has your past shaped your views on love and relationships?",
      options: [
        { value: "A", text: "It made me more cautious but hopeful" },
        { value: "B", text: "It taught me valuable lessons" },
        {
          value: "C",
          text: "I don't let the past define my future relationships",
        },
      ],
      weight: 8,
      matchingLogic: "emotional-maturity",
      personalGrowth: true,
    },
    {
      id: "BH_10",
      category: "backgroundHistory",
      text: "How important is cultural compatibility in a relationship?",
      options: [
        {
          value: "A",
          text: "Very important – I prefer someone from my culture",
        },
        { value: "B", text: "Somewhat important – I can adjust" },
        { value: "C", text: "Not important – I'm open to any culture" },
      ],
      weight: 7,
      matchingLogic: "cultural-flexibility",
      culturalOpenness: true,
    }, // Cultural & Communication Questions (51-55)
    {
      id: "CC_1",
      category: "culturalCommunication",
      text: "What is your preferred language for daily communication?",
      options: [
        { value: "A", text: "English" },
        { value: "B", text: "My native language" },
        { value: "C", text: "A mix of both" },
      ],
      weight: 8,
      matchingLogic: "communication-compatibility",
      languagePreference: true,
      matchingPriority: "high",
    },
    {
      id: "CC_2",
      category: "culturalCommunication",
      text: "Would you be willing to learn your partner's language if different from yours?",
      options: [
        { value: "A", text: "Yes, I'd love to" },
        { value: "B", text: "Maybe, if necessary" },
        { value: "C", text: "No, I prefer to stick with my language" },
      ],
      weight: 7,
      matchingLogic: "adaptability",
      culturalFlexibility: true,
      relationshipGrowth: true,
    },
    {
      id: "CC_3",
      category: "culturalCommunication",
      text: "Do you believe in traditional gender roles within cultural expectations?",
      options: [
        { value: "A", text: "Yes, I think they are important" },
        { value: "B", text: "Somewhat – there should be a balance" },
        { value: "C", text: "No, I believe in equality" },
      ],
      weight: 9,
      matchingLogic: "values-alignment",
      coreValues: true,
      potentialDealBreaker: true,
    },
    {
      id: "CC_4",
      category: "culturalCommunication",
      text: "How do you feel about interracial relationships?",
      options: [
        { value: "A", text: "I'm open to them" },
        { value: "B", text: "I prefer to stay within my race/culture" },
        { value: "C", text: "It depends on the individual" },
      ],
      weight: 9,
      matchingLogic: "cultural-openness",
      diversityAcceptance: true,
      matchingCritical: true,
    },
    {
      id: "CC_5",
      category: "culturalCommunication",
      text: "Would you be open to living in another country if necessary?",
      options: [
        { value: "A", text: "Yes, I'd be willing to relocate" },
        { value: "B", text: "Maybe, but only for the right reasons" },
        { value: "C", text: "No, I prefer to stay in my home country" },
      ],
      weight: 8,
      matchingLogic: "lifestyle-flexibility",
      mobilityFactor: true,
      futurePlanning: true,
    }, // Personal Preferences Questions (56-61)
    {
      id: "PP_1",
      category: "personalPreferences",
      text: "What do you feel about having pets?",
      options: [
        { value: "A", text: "I love having pets" },
        { value: "B", text: "I am indifferent about having pets" },
        { value: "C", text: "I don't like having pets" },
      ],
      weight: 6,
      matchingLogic: "lifestyle-compatibility",
      lifestyleFactors: ["pets", "home-environment"],
      compatibilityScore: "medium",
    },
    {
      id: "PP_2",
      category: "personalPreferences",
      text: "How much do you engage on social media?",
      options: [
        { value: "A", text: "I am very active on social media" },
        { value: "B", text: "I am not too active on social media" },
        { value: "C", text: "I am not a social media person" },
      ],
      weight: 7,
      matchingLogic: "digital-lifestyle",
      modernLifeFactors: true,
      privacyConsiderations: true,
    },
    {
      id: "PP_3",
      category: "personalPreferences",
      text: "How important is punctuality to you?",
      options: [
        { value: "A", text: "Very important" },
        { value: "B", text: "Somewhat important" },
        { value: "C", text: "Not very important" },
      ],
      weight: 8,
      matchingLogic: "personality-traits",
      responsibilityIndicator: true,
      valueAlignment: "time-management",
    },
    {
      id: "PP_4",
      category: "personalPreferences",
      text: "How do you feel about trying new things?",
      options: [
        { value: "A", text: "Very adventurous" },
        { value: "B", text: "Somewhat adventurous" },
        { value: "C", text: "Not very adventurous" },
      ],
      weight: 7,
      matchingLogic: "adventure-compatibility",
      personalityTraits: ["openness", "flexibility"],
      lifestyleMatch: true,
    },
    {
      id: "PP_5",
      category: "personalPreferences",
      text: "What is your preferred way of handling change?",
      options: [
        { value: "A", text: "I adapt easily" },
        { value: "B", text: "I adapt with some difficulty" },
        { value: "C", text: "I struggle to adapt" },
      ],
      weight: 8,
      matchingLogic: "adaptability-assessment",
      personalityIndicators: ["flexibility", "resilience"],
      relationshipReadiness: true,
    },
    {
      id: "PP_6",
      category: "personalPreferences",
      text: "What type of movies or TV shows do you enjoy watching?",
      options: [
        { value: "A", text: "Christian or faith-based content" },
        { value: "B", text: "Secular movies or TV shows" },
        { value: "C", text: "Documentaries or educational content" },
      ],
      weight: 6,
      matchingLogic: "entertainment-preferences",
      valueIndicators: ["media-consumption", "leisure-time"],
      spiritualAlignment: true,
    }, // Ministry & Purpose Questions (62-65)
    {
      id: "MP_1",
      category: "ministryPurpose",
      text: "How do you feel about evangelism and sharing your faith with others?",
      options: [
        { value: "A", text: "Very comfortable" },
        { value: "B", text: "Somewhat comfortable" },
        { value: "C", text: "Not comfortable" },
      ],
      weight: 9,
      matchingLogic: "spiritual-mission",
      faithExpression: true,
      missionAlignment: "evangelism",
      criticalFactor: true,
    },
    {
      id: "MP_2",
      category: "ministryPurpose",
      text: "What is your view on the importance of spiritual mentors?",
      options: [
        { value: "A", text: "Very important" },
        { value: "B", text: "Somewhat important" },
        { value: "C", text: "Not important" },
      ],
      weight: 8,
      matchingLogic: "spiritual-growth",
      growthMindset: true,
      discipleshipValue: "mentorship",
      spiritualMaturity: true,
    },
    {
      id: "MP_3",
      category: "ministryPurpose",
      text: "How do you feel about participating in mission trips?",
      options: [
        { value: "A", text: "Very interested" },
        { value: "B", text: "Somewhat interested" },
        { value: "C", text: "Not interested" },
      ],
      weight: 8,
      matchingLogic: "ministry-involvement",
      missionMindedness: true,
      serviceOrientation: "global",
      purposeAlignment: true,
    },
    {
      id: "MP_4",
      category: "ministryPurpose",
      text: "What's your ultimate goal in life?",
      options: [
        { value: "A", text: "To glorify God" },
        { value: "B", text: "To find love and happiness" },
        { value: "C", text: "To achieve my dreams and find personal success" },
      ],
      weight: 10,
      matchingLogic: "life-purpose",
      coreValues: ["faith-centricity", "life-mission"],
      fundamentalAlignment: true,
      dealBreaker: true,
    },
  ];

  const handleAnswer = (value) => {
    setAnswers((prev) => {
      const updatedAnswers = {
        ...prev,
        [questions[currentQuestion].id]: value,
      };
      return updatedAnswers;
    });
  };

  useEffect(() => {
    if (
      answers[questions[currentQuestion]?.id] &&
      currentQuestion < questions.length - 1
    ) {
      setCurrentQuestion((prev) => prev + 1);
    }
  }, [answers]);

  const handleSubmit = async () => {
    try {
      // Validation check
      if (Object.keys(answers).length !== questions.length) {
        throw new Error("Please answer all questions before submitting");
      }

      setIsSubmitting(true);

      // Calculate category scores
      const scores = {
        faithFundamentals: 0,
        spiritualPractices: 0,
        religiousViews: 0,
        familyMarriageValues: 0,
        lifestylePersonality: 0,
        backgroundHistory: 0,
        culturalCommunication: 0,
        personalPreferences: 0,
        ministryPurpose: 0,
      };

      // Score calculation
      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = questions.find((q) => q.id === questionId);
        if (question) {
          const category = question.category;
          const weight = question.weight;
          const answerValue = answer === "A" ? 100 : answer === "B" ? 50 : 0;
          const weightedScore = (answerValue * weight) / 10;
          scores[category] += weightedScore;
        }
      });

      // Score normalization - CORRECTED
      Object.keys(scores).forEach((category) => {
        const categoryQuestions = questions.filter(
          (q) => q.category === category
        );
        const totalWeight = categoryQuestions.reduce(
          (sum, q) => sum + q.weight,
          0
        );

        // Calculate the maximum possible score for this category
        const maxPossibleScore = totalWeight * 10; // since max answerValue is 100 and we divide by 10

        // Normalize to 0-100 scale without multiplying by 100 again
        scores[category] = Math.round(
          (scores[category] / maxPossibleScore) * 100
        );
      });

      logEvent("score_calculation_complete", { scores });

      // Prepare test data
      const testData = {
        personalityScores: scores,
        answers,
        completedAt: new Date().toISOString(),
        questionCount: questions.length,
        testVersion: "1.0",
        faithValues: {
          spiritualMaturity: calculateSpiritualMaturity(scores),
          ministryInvolvement: calculateMinistryInvolvement(scores),
          biblicalKnowledge: calculateBiblicalKnowledge(scores),
        },
      };

      // Submit to server
      const response = await axiosInstance.post("/personality/test", testData);

      if (response.data.testId) {
        logEvent("personality_test_submit_success", {
          scores,
          questionCount: questions.length,
          testId: response.data.testId,
        });
        await axiosInstance.patch("/personality-test-status");

        const fresh = await fetchUserProfile();
        setUserProfile(fresh);

        // Handle successful submission
        await onComplete({
          ...testData,
          testId: response.data.testId,
        });

        // Show success message or redirect
        if (typeof window !== "undefined") {
          window.scrollTo(0, 0);
        }
      }
    } catch (error) {
      logEvent("personality_test_submit_error", {
        error: error.message,
      });
      // Handle error appropriately
      console.error("Test submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions for faith values calculation
  const calculateSpiritualMaturity = (scores) => {
    return Math.round(
      (scores.faithFundamentals + scores.spiritualPractices) / 2
    );
  };

  const calculateMinistryInvolvement = (scores) => {
    return Math.round((scores.ministryPurpose + scores.religiousViews) / 2);
  };

  const calculateBiblicalKnowledge = (scores) => {
    return Math.round((scores.faithFundamentals + scores.religiousViews) / 2);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full relative"
      >
        <h2 className="font-fraunces sm:text-xl font-semibold text-gray-800 mb-6 text-center">
          Heaven On Earth Connections Is Meant Only For Serious Minded Christian
          Singles Who Are Willing To Complete Our 65 Personality Test
          Questionnaire. Complete The Personality Test Questionnaire And See All
          The Exciting People That Match And Are Compatible With You.
        </h2>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <RiCloseLine className="w-6 h-6" />
        </button>

        <div className="mb-8">
          <div className="h-2 bg-purple-100 rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-purple-500 rounded-full"
            />
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="space-y-6"
          >
            <h3 className="sm:text-2xl font-semibold text-gray-800">
              {questions[currentQuestion].text}
            </h3>

            <div className="space-y-4">
              {questions[currentQuestion].options.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all
                    ${
                      answers[questions[currentQuestion].id] === option.value
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-200"
                    }`}
                >
                  {option.text}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          {currentQuestion !== 0 ? (
            <button
              onClick={() =>
                setCurrentQuestion((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <RiArrowLeftLine /> Previous
            </button>
          ) : null}

          {currentQuestion === questions.length - 1 &&
            Object.keys(answers).length === questions.length && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-purple-500 text-white px-6 py-2 rounded-full hover:bg-purple-600
               disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  "Processing..."
                ) : (
                  <>
                    Complete Test
                    <RiArrowRightLine />
                  </>
                )}
              </motion.button>
            )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PersonalityQuestionnaire;
