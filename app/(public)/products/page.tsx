"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/products/product-card"

const products = [
  {
    id: "blazehaze-8kg",
    name: "BLAZEHAZE Premium",
    weight: "8kg",
    tagline: "Restaurant & Commercial Grade",
    description: "Engineered for professional kitchens and serious BBQ enthusiasts.",
    badge: "Best Seller",
    image: "/images/products/blazehaze-8kg.jpg",
  },
  {
    id: "blazehaze-3kg",
    name: "BLAZEHAZE Premium",
    weight: "3.5kg",
    tagline: "Home & Outdoor Grade",
    description: "Premium quality in a convenient size for backyard grilling.",
    badge: "Popular Choice",
    image: "/images/products/blazehaze-3kg.jpg",
  },
]

// Ember particle component
function EmberParticles() {
  const [embers, setEmbers] = useState<Array<{ id: number; x: number; delay: number; duration: number; size: number }>>([])

  useEffect(() => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 4,
      size: 2 + Math.random() * 4,
    }))
    setEmbers(particles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {embers.map((ember) => (
        <motion.div
          key={ember.id}
          className="absolute rounded-full"
          style={{
            left: `${ember.x}%`,
            bottom: "-10px",
            width: ember.size,
            height: ember.size,
            background: `radial-gradient(circle, #ff6a00 0%, #ee4500 50%, transparent 100%)`,
            boxShadow: "0 0 6px #ff6a00, 0 0 12px #ee4500",
          }}
          animate={{
            y: [0, -200, -400],
            x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30],
            opacity: [0, 1, 0.8, 0],
            scale: [1, 1.2, 0.5],
          }}
          transition={{
            duration: ember.duration,
            delay: ember.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative py-16 md:py-24 overflow-hidden" style={{ backgroundColor: "#111010" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Section label - smaller, subdued */}
            <span className="text-primary/80 text-xs font-medium tracking-widest uppercase">
              Our Products
            </span>
            
            {/* Secondary headline - reduced prominence */}
            <p className="mt-4 text-lg md:text-xl text-white font-medium tracking-wide">
              Premium Hardwood Charcoal
            </p>
            
            {/* MAIN SLOGAN - Primary visual focal point with fire effect */}
            <div className="relative mt-6 py-8">
              <EmberParticles />
              <h1 
                className="relative z-10 font-semibold tracking-wide leading-tight whitespace-nowrap"
                style={{
                  color: "#ff6a00",
                  textShadow: "0 0 8px #ff6a00, 0 0 20px #ee4500, 0 0 40px #c23000",
                  animation: "flicker 3.2s ease-in-out infinite, glowPulse 2.4s ease-in-out infinite",
                  fontSize: "clamp(1.25rem, 5.5vw, 4.5rem)",
                }}
              >
                Born in fire, Made for meat
              </h1>
            </div>
            
            {/* Supporting text */}
            <p className="mt-2 text-muted-foreground/60 leading-relaxed text-sm font-bold">
              Restaurant-quality charcoal crafted from sustainably sourced hardwood
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products Grid - Side by Side with identical geometry */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-stretch">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                {...product}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 border-t border-border/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto text-center"
          >
            <h2 className="text-xl md:text-2xl font-serif font-bold">
              Need a Custom Order?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Contact us for bulk orders, distributor pricing, and custom packaging solutions.
            </p>
            <Button size="default" className="mt-5" asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CSS Keyframe Animations */}
      <style jsx global>{`
        @keyframes flicker {
          0%, 100% {
            opacity: 1;
            transform: translateY(0);
          }
          25% {
            opacity: 0.85;
            transform: translateY(-1px);
          }
          50% {
            opacity: 0.95;
            transform: translateY(1px);
          }
          75% {
            opacity: 0.7;
            transform: translateY(-2px);
          }
        }
        
        @keyframes glowPulse {
          0%, 100% {
            text-shadow: 0 0 8px #ff6a00, 0 0 20px #ee4500, 0 0 40px #c23000;
          }
          50% {
            text-shadow: 0 0 14px #ff8800, 0 0 30px #ff4500, 0 0 60px #cc2200;
          }
        }
      `}</style>
    </div>
  )
}
