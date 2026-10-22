'use client';

import type { HeardAboutCopy } from '@/types/content';

/**
 * Optional "How did you hear about us?" select, on the two longer forms only
 * (contact and the full audit form). The detected first-touch source cannot see
 * word of mouth, so when the visitor answers, the nightly sweep uses their answer.
 * Copy lives in content/site.json under forms.heardAbout.
 */
export default function HeardAboutSelect({
  id,
  copy,
  value,
  onChange,
  className,
}: {
  id: string;
  copy: HeardAboutCopy;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {copy.label}
      </label>
      <select id={id} name="heardAbout" value={value} onChange={onChange} className={`${className} ${value ? '' : 'text-muted'}`}>
        <option value="">{copy.label}</option>
        {copy.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
