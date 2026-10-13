import Button from '@/components/Button';

export default function NotFound() {
  return (
    <section className="container-wide section-y text-center">
      <h1 className="text-36 lg:text-48">This page took a wrong turn.</h1>
      <p className="mx-auto mt-4 max-w-[44ch] text-muted">
        The page you&apos;re after doesn&apos;t exist or has moved. Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Button href="/">Back to home</Button>
        <Button href="/work" variant="outline">See our work</Button>
      </div>
    </section>
  );
}
