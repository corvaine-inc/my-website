import { Building2, Users, Globe, Award } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "About",
  description: "Learn about CORVAINE, the makers of BLAZEHAZE premium hardwood charcoal trusted by restaurants and pitmasters.",
}

const stats = [
  { label: "Years in Business", value: "10+" },
  { label: "Customer Satisfaction", value: "100%" },
  { label: "Distributors", value: "200+" },
  { label: "Sustainably Sourced", value: "100%" },
]

const values = [
  {
    icon: Building2,
    title: "Quality First",
    description:
      "We maintain the highest standards in every product we offer.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description:
      "Your success is our priority. We build lasting partnerships.",
  },
  {
    icon: Globe,
    title: "Planet First",
    description:
      "We are committed to sourcing sustainable products and reducing environmental footprint in everything we do.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "Committed to continuous improvement and innovation.",
  },
]

export default function AboutPage() {
  return (
    <div className="container py-8 md:py-12">
      {/* Hero Section */}
      <section className="mb-16 md:mb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-balance">
            Building Trust Through Quality
          </h1>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            We are dedicated to providing exceptional products and services to our 
            network of distributors. Our commitment to quality and reliability has 
            made us a trusted partner for businesses worldwide.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-16 md:mb-24">
        <div className="flex flex-wrap justify-center gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center flex-1 min-w-[160px] max-w-[220px]">
              <CardContent className="pt-6 px-4">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground whitespace-nowrap">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="mb-16 md:mb-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Our Mission
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            To empower businesses with quality products and reliable supply chain 
            solutions, fostering growth and success for our partners around the world.
          </p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="mb-16 md:mb-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Our Vision
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            To deliver premium-quality products that powers businesses and protects 
            our planet for generations to come.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-16 md:mb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Our Values
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            The principles that guide everything we do
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <Card key={value.title}>
              <CardContent className="pt-6">
                <value.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg">{value.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>


    </div>
  )
}
