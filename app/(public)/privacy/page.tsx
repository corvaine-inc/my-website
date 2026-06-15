"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useSpring } from "framer-motion"
import { ArrowUp, Shield, Database, Lock, UserCheck, Globe, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const sections = [
  { id: "information", title: "Information We Collect", icon: Database },
  { id: "usage", title: "How We Use Data", icon: Shield },
  { id: "protection", title: "Data Protection", icon: Lock },
  { id: "rights", title: "Your Rights", icon: UserCheck },
  { id: "third-party", title: "Third-Party Services", icon: Globe },
  { id: "contact", title: "Contact Us", icon: Mail },
]

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("")
  const [showBackToTop, setShowBackToTop] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
      
      // Update active section based on scroll position
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

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <motion.div
          className="absolute top-20 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl"
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Your Privacy Matters</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium tracking-wide mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At CORVAINE, we are committed to protecting your privacy and ensuring 
              transparency in how we handle your personal information. This policy 
              outlines our practices and your rights.
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
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
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
              {/* Information We Collect */}
              <motion.div
                id="information"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Database className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="font-serif text-2xl font-medium">Information We Collect</h2>
                    </div>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        We collect information to provide better services to our distributors 
                        and business partners. The types of information we collect include:
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="business">
                          <AccordionTrigger className="text-foreground hover:text-primary">
                            Business Information
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            When you register as a distributor, we collect your business name, 
                            registration number, business address, contact details, and tax 
                            identification information. This enables us to establish and maintain 
                            our business relationship.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="contact">
                          <AccordionTrigger className="text-foreground hover:text-primary">
                            Contact Information
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            We collect names, email addresses, phone numbers, and mailing addresses 
                            of business representatives. This information is used for order processing, 
                            delivery coordination, and business communications.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="technical">
                          <AccordionTrigger className="text-foreground hover:text-primary">
                            Technical Data
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            When you access our platform, we automatically collect certain technical 
                            information including IP address, browser type, device information, and 
                            usage patterns. This helps us improve our services and maintain security.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* How We Use Data */}
              <motion.div
                id="usage"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="font-serif text-2xl font-medium">How We Use Your Data</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p className="leading-relaxed">
                        We use the information we collect for legitimate business purposes, including:
                      </p>
                      <ul className="space-y-3">
                        {[
                          "Processing and fulfilling distributor orders",
                          "Managing business accounts and relationships",
                          "Communicating about products, orders, and services",
                          "Providing customer support and responding to inquiries",
                          "Improving our products and platform experience",
                          "Ensuring compliance with legal and regulatory requirements",
                          "Protecting against fraud and unauthorized access",
                        ].map((item, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="flex items-start gap-3"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Data Protection */}
              <motion.div
                id="protection"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Lock className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="font-serif text-2xl font-medium">Data Protection</h2>
                    </div>
                    <div className="space-y-6 text-muted-foreground">
                      <p className="leading-relaxed">
                        We implement robust security measures to protect your information:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { title: "Encryption", desc: "All data transmitted is encrypted using industry-standard TLS protocols" },
                          { title: "Access Controls", desc: "Strict access controls limit who can view sensitive information" },
                          { title: "Regular Audits", desc: "We conduct regular security audits and vulnerability assessments" },
                          { title: "Data Backup", desc: "Secure backups ensure business continuity and data recovery" },
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
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Your Rights */}
              <motion.div
                id="rights"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <UserCheck className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="font-serif text-2xl font-medium">Your Rights</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p className="leading-relaxed">
                        You have the following rights regarding your personal data:
                      </p>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="access">
                          <AccordionTrigger className="text-foreground hover:text-primary">
                            Right to Access
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            You can request a copy of the personal data we hold about you or your 
                            business. We will provide this information within 30 days of your request.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="rectification">
                          <AccordionTrigger className="text-foreground hover:text-primary">
                            Right to Rectification
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            If any information we hold is inaccurate or incomplete, you have the 
                            right to request corrections. You can update most information directly 
                            through your distributor portal.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="erasure">
                          <AccordionTrigger className="text-foreground hover:text-primary">
                            Right to Erasure
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            You may request deletion of your personal data, subject to legal 
                            retention requirements. Note that we may need to retain certain 
                            information for compliance and record-keeping purposes.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="portability">
                          <AccordionTrigger className="text-foreground hover:text-primary">
                            Right to Data Portability
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            You can request your data in a structured, commonly used format 
                            for transfer to another service provider where technically feasible.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Third-Party Services */}
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
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="font-serif text-2xl font-medium">Third-Party Services</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p className="leading-relaxed">
                        We work with trusted third-party service providers to operate our business:
                      </p>
                      <ul className="space-y-3">
                        {[
                          "Payment processors for secure transaction handling",
                          "Shipping and logistics partners for order fulfillment",
                          "Cloud infrastructure providers for hosting and data storage",
                          "Analytics services to improve our platform",
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="leading-relaxed pt-2">
                        All third-party providers are contractually bound to protect your data 
                        and use it only for the purposes we specify.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Us */}
              <motion.div
                id="contact"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="font-serif text-2xl font-medium">Contact Us</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p className="leading-relaxed">
                        If you have questions about this Privacy Policy or wish to exercise 
                        your data rights, please contact our privacy team:
                      </p>
                      <div className="space-y-2">
                        <p>
                          <strong className="text-foreground">Email:</strong>{" "}
                          <a href="mailto:info@corvaine.ca" className="text-primary hover:underline">
                            info@corvaine.ca
                          </a>
                        </p>
                        <p>
                          <strong className="text-foreground">Response Time:</strong> We aim to 
                          respond to all privacy inquiries within 5 business days.
                        </p>
                      </div>
                      <div className="pt-4">
                        <Button asChild>
                          <Link href="/contact">Contact Our Team</Link>
                        </Button>
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
        className="fixed bottom-8 right-8 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors z-40"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </motion.button>
    </div>
  )
}
