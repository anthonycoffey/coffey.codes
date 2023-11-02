type Props = {
  label: string;
};
export default function Chip({ label }: Props) {
  return <div className="Chip">{label}</div>;
}
