import React from "react"
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'

import './globals.css'

const _geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CraveFit - Eat What You Crave, Know What You Eat',
  description: 'Discover food based on your cravings with health-aware recommendations',
  generator: 'v0.app',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_geist.className} antialiased overflow-x-hidden`}>{children}</body>
    </html>
  )
}
