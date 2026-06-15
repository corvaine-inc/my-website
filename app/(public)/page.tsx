import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, Flame, Clock, Award, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VideoHero } from "@/components/home/video-hero"
import { BackToTop } from "@/components/shared/back-to-top"
import { siteConfig } from "@/config/site"

const features = [
  {
    icon: Flame,
    title: "Intense Heat",
    description: "Burns hotter and cleaner than conventional charcoal for superior searing",
  },
  {
    icon: Clock,
    title: "Long-Lasting Burn",
    description: "Up to 6 hours of consistent high heat from a single load",
  },
  {
    icon: Award,
    title: "Restaurant Grade",
    description: "Trusted by professional chefs and pitmasters worldwide",
  },
]

const benefits = [
  "Competitive wholesale pricing",
  "Dedicated account management",
  "Priority order fulfillment",
  "Exclusive distributor resources",
  "Marketing support materials",
  "Volume-based incentives",
]

const stats = [
  { value: "6+", label: "Hours Burn Time" },
  { value: "100%", label: "Natural Hardwood" },
  { value: "200+", label: "Distributor Partners" },
]

export default function HomePage() {
  return (
    <>
      {/* Video Hero Section */}
      <VideoHero />

      {/* Stats Section */}
      <section className="border-t border-border/50 bg-card">
        <div className="container py-12 md:py-16">
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-12 md:gap-24">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-background">
        <div className="container py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Why Choose <span className="text-primary">BLAZEHAZE</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Premium hardwood charcoal engineered for performance
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl">{feature.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Distributor CTA Section */}
      <section className="bg-secondary">
        <div className="container py-16 md:py-24">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-accent">Partner With Us</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-secondary-foreground">
                Become a BLAZEHAZE Distributor
              </h2>
              <p className="mt-4 text-secondary-foreground/80 leading-relaxed">
                Join our growing network of trusted distributors and unlock exclusive benefits 
                designed to help your business thrive.
              </p>
              <ul className="mt-8 space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-secondary-foreground">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-accent" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  asChild
                >
                  <Link href="/contact">Apply Now</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10"
                  asChild
                >
                  <Link href="/portal">Distributor Login</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="relative">
                <div className="w-72 h-72 rounded-full bg-accent/10 flex items-center justify-center">
                  <Image
                    src={siteConfig.images.corvaineLogoLight}
                    alt="CORVAINE"
                    width={200}
                    height={80}
                    className="opacity-80"
                  />
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-primary/20 animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-accent/30 animate-pulse delay-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <BackToTop />
    </>
  )
}
