export default function SectionHeading({
  eyebrow,
  heading,
  sub,
  center = true,
}: {
  eyebrow?: string;
  heading: string;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? 'flex flex-col items-center text-center' : ''}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2 className="max-w-[20ch] text-28 md:text-40 lg:text-48">{heading}</h2>
      {sub ? (
        <p className={`mt-4 max-w-[52ch] text-21 text-muted ${center ? 'mx-auto' : ''}`}>
          {sub}
        </p>
      ) : null}
    </div>
  );
}
