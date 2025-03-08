import { ReactElement } from 'react';
import Image from 'next/image';
type Props = {
  logos: string[];
};

export default function LogoGrid({ logos }: Props): ReactElement {
  return (
    <div className="grid-cols-6 gap-10 logo-grid max-w-3xl mx-auto">
      {logos.map((logo: string) => (
        <Image
          key={logo}
          src={`/logos/${logo}`}
          alt={logo.replace('.svg', '')}
          width={200}
          height={200}
        />
      ))}
    </div>
  );
}
