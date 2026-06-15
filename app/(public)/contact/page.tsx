"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        form.reset()
      } else {
        setError("Something went wrong. Please try again.")
      }
    } catch {
      setError("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Message Sent!
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Thank you for reaching out. We&apos;ll get back to you as soon as possible.
          </p>
          <Button 
            className="mt-8" 
            onClick={() => setIsSuccess(false)}
          >
            Send Another Message
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12">
      {/* Page Header */}
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Have questions? We&apos;d love to hear from you. Send us a message and 
          we&apos;ll respond as soon as possible.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Web3Forms Access Key */}
              <input type="hidden" name="access_key" value="d1cf4810-e84b-4a9b-8d06-52012a4e1b15" />
              
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      required
                    />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      required
                    />
                  </Field>
                </FieldGroup>
              </div>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                  />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="company">Company (Optional)</FieldLabel>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Your Company"
                  />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="subject">Subject</FieldLabel>
                  <Select name="subject" required>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="distributor">Become a Distributor</SelectItem>
                      <SelectItem value="support">Product Support</SelectItem>
                      <SelectItem value="orders">Order Inquiry</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="message">Message</FieldLabel>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="How can we help you?"
                    rows={5}
                    required
                  />
                </Field>
              </FieldGroup>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button 
                type="submit" 
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
