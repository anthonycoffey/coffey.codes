import type { Metadata } from 'next'
import ScrollContainer from '@/components/ScrollContainer'

const HOME_TITLE = 'Anthony Coffey — Austin Software Engineer & AI Consultant'
const HOME_DESCRIPTION =
  'Austin-based software engineer and AI consultant building web apps, mobile apps, and practical AI solutions. Creativity at the core of everything I ship.'

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: '/',
    type: 'website',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ['/og-image.jpg'],
  },
}

export default function Page() {
  return <ScrollContainer />
}
