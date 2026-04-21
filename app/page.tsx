import type { Metadata } from 'next'
import ScrollContainer from '@/components/ScrollContainer'

export const metadata: Metadata = {
  title: {
    absolute: 'Anthony Coffey — Musician, Engineer, Maker in Austin',
  },
  description:
    'Anthony Coffey is a musician, director, and software engineer in Austin, TX. Creativity is at the core of everything I build, design, and ship.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Anthony Coffey — Musician, Engineer, Maker in Austin',
    description:
      'Anthony Coffey is a musician, director, and software engineer in Austin, TX. Creativity is at the core of everything I build, design, and ship.',
    url: '/',
    type: 'website',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anthony Coffey — Musician, Engineer, Maker in Austin',
    description:
      'Anthony Coffey is a musician, director, and software engineer in Austin, TX. Creativity is at the core of everything I build, design, and ship.',
    images: ['/og-image.jpg'],
  },
}

export default function Page() {
  return <ScrollContainer />
}
