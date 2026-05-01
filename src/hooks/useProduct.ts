export function useProduct() {
  return {
    i18n: {
      hero: {
        description:
          "Practice real-life conversations in a safe, judgment-free environment. Get AI-powered feedback and build confidence before your next real interaction.",
        ctaButton: "Start Practicing",
      },
      categories: {
        badge: "Scenarios",
        title: "What do you want to practice?",
        subtitle: "Choose from hundreds of real-life scenarios across every situation expats face.",
        subtitleFallback: "Real-life scenarios for every situation expats face.",
      },
      loading: "Loading scenarios...",
      failedToLoadCategories: "Failed to load categories",
      tryAgain: "Try again",
      noConversationCategories: "No conversation categories available yet.",
      dataProtection: {
        badge: "Privacy",
        title: "Your data stays yours",
        subtitle: "We take privacy seriously. Your conversations are never shared.",
        encryption: {
          title: "End-to-end encrypted",
          description: "All your practice sessions are encrypted in transit and at rest.",
        },
        privacy: {
          title: "Never shared",
          description: "Your conversation data is never sold or shared with third parties.",
        },
        storage: {
          title: "You're in control",
          description: "Delete your data anytime. We hold only what you need us to.",
        },
        bottomMessage:
          "Your practice sessions are private — only you have access to it. We never use your conversations to train AI models.",
      },
      howItWorks: {
        badge: "How it works",
        title: "Three steps to fluency",
        subtitle: "A simple loop that builds real confidence, fast.",
        step1: { title: "Pick a scenario", description: "Choose a real-life situation you'll face as an expat." },
        step2: { title: "Practice with AI", description: "Have a realistic conversation with your AI partner." },
        step3: { title: "Get feedback", description: "See what you did well and where to improve." },
      },
      cta: {
        title: "Ready to sound like a local?",
        subtitle: "Join thousands of expats building real fluency through practice.",
        button: "Start your first conversation",
      },
      footer: {
        companyName: "Like an Expat",
        companyDescription:
          "AI-powered language practice for people living life in a foreign language.",
        resources: "Resources",
        faq: "FAQ",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
        subscriptionBilling: "Subscription & Billing",
        contact: "Contact",
        contactDescription: "Questions? Reach us on social media.",
        fundingAlt: "Funding partners",
        copyright: (year: number) => `© ${year} Like an Expat. All rights reserved.`,
        madeWith: "Made with ❤️ for expats everywhere",
      },
    },
  };
}
