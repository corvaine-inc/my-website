"use client"

export const runtime = 'edge'
import Link from "next/link"
import Image from "next/image"
import { notFound, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Check, Package, Clock, ThermometerSun, Flame, ArrowRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { products } from './products-data'

function getIcon(iconName: string) {
  switch (iconName) {
    case "package": return Package
    case "clock": return Clock
    case "heat": return ThermometerSun
    case "spark": return Sparkles
    default: return Flame
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const id = params.id as string
  const product = products[id]

  if (!product) {
    notFound()
  }

  const relatedProducts = Object.values(products).filter((p) => p.id !== product.id)

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="container pt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link 
            href="/products" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Products
          </Link>
        </motion.div>
      </div>

      {/* Hero Product Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        {/* Background ambient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="container relative">
          <div className="grid gap-12 lg:gap-20 lg:grid-cols-2 items-center">
            {/* Product Image - Premium Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative group">
                {/* Spotlight effect */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-colors duration-700" />
                
                {/* Product stage */}
                <div className="relative aspect-[3/4] flex items-end justify-center">
                  {/* Ground shadow */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-6 bg-black/30 blur-2xl rounded-full" />
                  
                  {/* Main product */}
                  <motion.div
                    className="relative w-full h-full"
                    whileHover={{ 
                      y: -12,
                      transition: { duration: 0.5, ease: "easeOut" }
                    }}
                  >
                    <Image
                      src={product.image}
                      alt={`${product.name} ${product.weight}`}
                      fill
                      className="object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </motion.div>
                  
                  {/* Reflection */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-32 overflow-hidden opacity-15 pointer-events-none">
                    <div className="relative w-full h-64 -scale-y-100">
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        className="object-contain object-top blur-sm"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                {product.badge}
              </span>
              
              <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight">
                {product.name}
                <span className="block text-primary">{product.weight}</span>
              </h1>
              
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                {product.longDescription}
              </p>

              {/* Features */}
              <div className="mt-10">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                  Key Features
                </h2>
                <ul className="grid gap-3">
                  {product.features.slice(0, 4).map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-10"
              >
                <Button size="lg" asChild className="group">
                  <Link href="/contact">
                    Request Quote
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="py-16 border-t border-border/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8">
              Specifications
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.specifications.map((spec, index) => {
                const IconComponent = getIcon(spec.icon)
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-colors">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{spec.label}</p>
                          <p className="font-semibold mt-0.5">{spec.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* All Features */}
      <section className="py-16 bg-muted/20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8">
              All Features
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-border/30"
                >
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 border-t border-border/50">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8">
                Other Products
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1">
                {relatedProducts.map((relatedProduct) => (
                  <Card key={relatedProduct.id} className="overflow-hidden bg-card/50 border-border/50 group">
                    <CardContent className="p-0">
                      <div className="grid lg:grid-cols-[200px_1fr] gap-6 p-6">
                        {/* Mini product image */}
                        <div className="relative aspect-square lg:aspect-auto bg-muted/20 rounded-lg overflow-hidden">
                          <motion.div
                            className="relative w-full h-full"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Image
                              src={relatedProduct.image}
                              alt={relatedProduct.name}
                              fill
                              className="object-contain p-4"
                            />
                          </motion.div>
                        </div>
                        
                        {/* Info */}
                        <div className="flex flex-col justify-center">
                          <span className="text-xs font-medium text-primary">
                            {relatedProduct.badge}
                          </span>
                          <h3 className="mt-2 text-xl font-semibold">
                            {relatedProduct.name} {relatedProduct.weight}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {relatedProduct.description}
                          </p>
                          <Button variant="outline" className="mt-4 w-fit group/btn" asChild>
                            <Link href={`/products/${relatedProduct.id}`}>
                              View Details
                              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  )
}
