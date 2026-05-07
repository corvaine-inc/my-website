"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useSpring } from "framer-motion"
import { ArrowUp, Cookie, Settings, BarChart3, Cog, Globe, ToggleLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const sections = [
  { id: "what-are-cookies", title: "What Are Cookies", icon: Cookie },
  { id: "cookie-types", title: "Cookie Types", icon: Settings },
  { id: "preferences", title: "Cookie Preferences", icon: ToggleLeft },
  { id: "managing", title: "Managing Consent", icon: Cog },
  { id: "third-party", title: "Third-Party Cookies", icon: Globe },
]

const cookieCategories = [
  {
    id: "essential",
    title: "Essential Cookies",
    description: "Required for the website to function properly. Cannot be disabled.",
    icon: Settings,
    required: true,
    cookies: [
      { name: "session_id", purpose: "Maintains your login session", duration: "Session" },
      { name: "csrf_token", purpose: "Security protection against cross-site attacks", duration: "Session" },
      { name: "cookie_consent", purpose: "Remembers your cookie preferences", duration: "1 year" },
    ]
  },
  {
    id: "analytics",
    title: "Analytics Cookies",
    description: "Help us understand how visitors interact with our website.",
    icon: BarChart3,
    required: false,
    cookies: [
      { name: "_ga", purpose: "Distinguishes unique users for analytics", duration: "2 years" },
      { name: "_gid", purpose: "Distinguishes unique users for analytics", duration: "24 hours" },
      { name: "page_views", purpose: "Tracks page views during session", duration: "Session" },
    ]
  },
  {
    id: "functional",
    title: "Functional Cookies",
    description: "Enable enhanced functionality and personalization.",
    icon: Cog,
    required: false,
    cookies: [
      { name: "language", purpose: "Remembers your language preference", duration: "1 year" },
      { name: "timezone", purpose: "Stores your timezone setting", duration: "1 year" },
      { name: "theme", purpose: "Remembers your display theme preference", duration: "1 year" },
    ]
  },
]

export default function CookiePolicyPage() {
  const [activeSection, setActiveSection] = useState("")
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    analytics: false,
    functional: true,
  })
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
      
      const sectionElements = sections.map(s => document.getElementById(s.id))
      const scrollPosition = window.scrollY + 200
      
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i]
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id)
          break
        }
      }
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handlePreferenceChange = (category: string, enabled: boolean) => {
    if (category === "essential") return // Cannot disable essential cookies
    setCookiePreferences(prev => ({ ...prev, [category]: enabled }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <motion.div
          className="absolute top-20 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 left-1/4 w-48 h-48 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
              <Cookie className="w-4 h-4" />
              <span className="text-sm font-medium">Transparency First</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium tracking-wide mb-6">
              Cookie Policy
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We use cookies to enhance your experience on our platform. This policy 
              explains what cookies are, how we use them, and how you can manage 
              your preferences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="grid lg:grid-cols-[280px_1fr] gap-12">
            {/* Sticky Navigation */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="sticky top-24">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Contents
                </h3>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
                        activeSection === section.id
                          ? "bg-accent/10 text-accent border-l-2 border-accent"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <section.icon className="w-4 h-4" />
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.aside>

            {/* Content */}
            <div className="space-y-16">
              {/* What Are Cookies */}
              <motion.div
                id="what-are-cookies"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Cookie className="w-5 h-5 text-accent" />
                      </div>
                      <h2 className="font-serif text-2xl font-medium">What Are Cookies?</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p className="leading-relaxed">
                        Cookies are small text files that are placed on your computer or mobile 
                        device when you visit a website. They are widely used to make websites 
                        work more efficiently and to provide information to website owners.
                      </p>
                      <p className="leading-relaxed">
                        Cookies help us recognize your device and remember your preferences, 
                        such as your login details or language settings. They also help us 
                        understand how you use our website so we can improve your experience.
                      </p>
                      <div className="p-4 rounded-lg bg-muted/50 border border-border/50 mt-4">
                        <p className="text-sm">
                          <strong className="text-foreground">Important:</strong> Cookies do not 
                          contain any personally identifiable information and cannot be used to 
                          identify you directly. They simply help our website remember your preferences.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Cookie Types */}
              <motion.div
                id="cookie-types"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Settings className="w-5 h-5 text-accent" />
                      </div>
                      <h2 className="font-serif text-2xl font-medium">Types of Cookies We Use</h2>
                    </div>
                    <div className="space-y-6">
                      {cookieCategories.map((category, index) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Accordion type="single" collapsible>
                            <AccordionItem value={category.id} className="border-border/50">
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-3">
                                  <div className="p-1.5 rounded bg-muted">
                                    <category.icon className="w-4 h-4 text-accent" />
                                  </div>
                                  <div className="text-left">
                                    <span className="font-medium text-foreground">{category.title}</span>
                                    {category.required && (
                                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="pl-10 space-y-4">
                                  <p className="text-muted-foreground">{category.description}</p>
                                  <div className="rounded-lg border border-border/50 overflow-hidden">
                                    <table className="w-full text-sm">
                                      <thead className="bg-muted/50">
                                        <tr>
                                          <th className="text-left p-3 font-medium text-foreground">Cookie</th>
                                          <th className="text-left p-3 font-medium text-foreground">Purpose</th>
                                          <th className="text-left p-3 font-medium text-foreground">Duration</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {category.cookies.map((cookie, i) => (
                                          <tr key={i} className="border-t border-border/50">
                                            <td className="p-3 text-muted-foreground font-mono text-xs">{cookie.name}</td>
                                            <td className="p-3 text-muted-foreground">{cookie.purpose}</td>
                                            <td className="p-3 text-muted-foreground">{cookie.duration}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Cookie Preferences Panel */}
              <motion.div
                id="preferences"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <ToggleLeft className="w-5 h-5 text-accent" />
                      </div>
                      <CardTitle className="font-serif text-2xl font-medium">Manage Cookie Preferences</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                      Customize your cookie settings below. Essential cookies cannot be disabled 
                      as they are necessary for the website to function.
                    </p>
                    
                    <div className="space-y-4">
                      {cookieCategories.map((category) => (
                        <motion.div
                          key={category.id}
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-card border border-border/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              <category.icon className="w-4 h-4 text-accent" />
                            </div>
                            <div>
                              <Label 
                                htmlFor={category.id} 
                                className="font-medium text-foreground cursor-pointer"
                              >
                                {category.title}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {category.description}
                              </p>
                            </div>
                          </div>
                          <Switch
                            id={category.id}
                            checked={cookiePreferences[category.id as keyof typeof cookiePreferences]}
                            onCheckedChange={(checked) => handlePreferenceChange(category.id, checked)}
                            disabled={category.required}
                          />
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={() => setCookiePreferences({ essential: true, analytics: true, functional: true })}
                        variant="outline"
                      >
                        Accept All
                      </Button>
                      <Button 
                        onClick={() => setCookiePreferences({ essential: true, analytics: false, functional: false })}
                        variant="outline"
                      >
                        Essential Only
                      </Button>
                      <Button>Save Preferences</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Managing Consent */}
              <motion.div
                id="managing"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Cog className="w-5 h-5 text-accent" />
                      </div>
                      <h2 className="font-serif text-2xl font-medium">Managing Your Consent</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p className="leading-relaxed">
                        You can manage your cookie preferences at any time using the panel above, 
                        or through your browser settings. Here are some ways to control cookies:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { 
                            title: "Browser Settings", 
                            desc: "Most browsers allow you to refuse cookies or delete existing ones through their settings menu." 
                          },
                          { 
                            title: "On This Website", 
                            desc: "Use the Cookie Preferences panel above to manage your consent for non-essential cookies." 
                          },
                          { 
                            title: "Clear Cookies", 
                            desc: "You can clear all cookies from your browser at any time through browser settings." 
                          },
                          { 
                            title: "Opt-Out Tools", 
                            desc: "Use industry opt-out tools like the Digital Advertising Alliance at youradchoices.com." 
                          },
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="p-4 rounded-lg bg-muted/50 border border-border/50"
                          >
                            <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                            <p className="text-sm">{item.desc}</p>
                          </motion.div>
                        ))}
                      </div>
                      <p className="leading-relaxed pt-2">
                        Please note that disabling certain cookies may affect the functionality 
                        of our website and your experience as a user.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Third-Party Cookies */}
              <motion.div
                id="third-party"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Globe className="w-5 h-5 text-accent" />
                      </div>
                      <h2 className="font-serif text-2xl font-medium">Third-Party Cookies</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p className="leading-relaxed break-words">
                        Some cookies on our website are placed by third-party services that 
                        appear on our pages. We do not control these cookies and recommend 
                        reviewing the privacy policies of these third parties:
                      </p>
                      <ul className="space-y-3">
                        {[
                          "Google Analytics - For website traffic analysis and insights",
                          "Payment processors - For secure transaction handling",
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-3 break-words">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                            <span className="break-words">{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-4">
                        <p className="leading-relaxed break-words">
                          For questions about our cookie practices, please{" "}
                          <Link href="/contact" className="text-primary hover:underline">
                            contact us
                          </Link>
                          .
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: showBackToTop ? 1 : 0, 
          scale: showBackToTop ? 1 : 0.8,
          pointerEvents: showBackToTop ? "auto" : "none"
        }}
        transition={{ duration: 0.2 }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 p-3 rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 transition-colors z-40"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </motion.button>
    </div>
  )
}
