type Props = {
  label: string;
};
export default function Chip({ label }: Props) {
  return (
    <div className="center relative inline-block select-none whitespace-nowrap rounded-lg bg-green-500 py-2 px-3.5 align-baseline font-sans text-xs font-bold uppercase leading-none text-white">
      {label}
    </div>
  );
}
