"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ProductCardProps {
  id: string
  name: string
  weight: string
  tagline: string
  description: string
  badge: string
  image: string
  index?: number
}

export function ProductCard({
  id,
  name,
  weight,
  tagline,
  description,
  badge,
  image,
  index = 0,
}: ProductCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="group relative bg-card/50 border border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-colors duration-300 flex flex-col"
    >
      {/* Product Image - Strict identical container for pixel-level parity */}
      <div className="relative w-full aspect-[4/5] bg-transparent flex-shrink-0">
        {/* Product image - identical containment for both cards */}
        <motion.div
          className="absolute inset-0"
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        >
          <Image
            src={image}
            alt={`${name} ${weight}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </motion.div>
      </div>

      {/* Product Info - Fixed height content area */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
              {name}
              <span className="text-primary ml-2">{weight}</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground font-medium whitespace-nowrap">
              {tagline}
            </p>
          </div>
          <span className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
            {badge}
          </span>
        </div>
        
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-grow">
          {description}
        </p>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <Button size="sm" asChild className="group/btn flex-1">
            <Link href={`/products/${id}`}>
              View Details
              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild className="flex-1">
            <Link href="/contact">
              Request Quote
            </Link>
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
