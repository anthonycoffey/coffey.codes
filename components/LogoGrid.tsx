import { ReactElement } from 'react';

type Props = {
  logos: string[];
};

export default function LogoGrid({ logos }: Props): ReactElement {
  return (
    <div className="grid-cols-6 gap-10 logo-grid max-w-3xl mx-auto">
      {logos.map((logo: string) => (
        <img key={logo} src={`/logos/${logo}`} alt={logo.replace('.svg', '')} />
      ))}
    </div>
  );
}
