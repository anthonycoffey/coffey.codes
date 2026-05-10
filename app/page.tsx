import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import ScrollContainer from '@/components/ScrollContainer';

const HOME_TITLE =
  'Anthony Coffey, AI Consultant and Software Engineer in Austin, TX';
const HOME_DESCRIPTION =
  'Anthony Coffey is an AI consultant and software engineer in Austin, TX, building web apps, mobile apps, and practical AI solutions with creativity at the core.';

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
};

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <ScrollContainer />
      </main>
    </>
  );
}
