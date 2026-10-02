type BrandIconProps = {
  className?: string;
};

export function GithubIcon({ className }: BrandIconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
      <path d="M12 .7a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.4.7-4.1-1.6-4.1-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6a4.7 4.7 0 0 1 1.2-3.2c-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C16.4 6.2 17.4 6.5 17.4 6.5c.6 1.6.2 2.9.1 3.2a4.7 4.7 0 0 1 1.2 3.2c0 4.7-2.8 5.7-5.5 6 .4.3.8 1 .8 2v2.9c0 .3.2.7.8.6A12 12 0 0 0 12 .7Z" />
    </svg>
  );
}

export function LinkedInIcon({ className }: BrandIconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
      <path d="M20.5 3.5h-17a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h17a1 1 0 0 0 1-1v-15a1 1 0 0 0-1-1ZM8.1 18.7H5.5v-8.1h2.6v8.1ZM6.8 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm11.9 9.2h-2.6v-3.9c0-.9 0-2.1-1.3-2.1s-1.5 1-1.5 2v4h-2.6v-8.1h2.5v1.1h.1c.3-.6 1.1-1.3 2.4-1.3 2.6 0 3 1.7 3 3.9v4.4Z" />
    </svg>
  );
}