export default function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="relative pl-7 text-[0.96rem] text-muted">
          <svg
            className="absolute left-0 top-1.5 h-4 w-4 text-cyan"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {item}
        </li>
      ))}
    </ul>
  );
}
