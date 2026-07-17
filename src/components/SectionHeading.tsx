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
      <h2 className="max-w-[20ch] text-[clamp(1.9rem,3.4vw,3rem)]">{heading}</h2>
      {sub ? (
        <p className={`mt-4 max-w-[52ch] text-[1.05rem] text-muted ${center ? 'mx-auto' : ''}`}>
          {sub}
        </p>
      ) : null}
    </div>
  );
}
