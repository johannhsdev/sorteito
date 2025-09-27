type Props = { value: number };

export default function NumberBadge({ value }: Props) {
  return (
    <div
      className="rounded-full px-4 py-2 text-lg font-semibold bg-white/90 text-slate-800 shadow-sm ring-1 ring-slate-200
                 hover:shadow transition transform hover:-translate-y-0.5 select-none"
    >
      {value}
    </div>
  );
}
