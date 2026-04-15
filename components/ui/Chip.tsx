import Link from 'next/link';

interface ChipProps {
  label: string;
  href?: string;
  className?: string;
}

export default function Chip({ label, href, className = '' }: ChipProps) {
  const classes = `inline-block select-none whitespace-nowrap rounded-lg bg-accent2 text-c-heading py-1 px-3 text-xs font-bold uppercase leading-none m-1 ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {label}
      </Link>
    );
  }

  return <span className={classes}>{label}</span>;
}
