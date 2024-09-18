import { ReactElement } from "react";

type Props = {
  logos: string[];
};

export default function LogoGrid({ logos }: Props): ReactElement {
  return (
    <div className="grid-cols-3 lg:grid-cols-6 gap-10 lg:gap-20 logo-grid">
      {logos.map((logo: string) => (
        <img key={logo} src={`/logos/${logo}`} alt={logo.replace(".svg", "")} />
      ))}
    </div>
  );
}