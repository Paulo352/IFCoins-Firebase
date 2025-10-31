import type { SVGProps } from 'react';

export function IFCoinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" className="fill-accent" />
      <path
        d="M12 6v12"
        className="stroke-accent-foreground"
        strokeWidth="3"
      />
      <path
        d="M16 6v12"
        className="stroke-accent-foreground"
        strokeWidth="3"
      />
      <path
        d="M8 12h1.5"
        className="stroke-accent-foreground"
        strokeWidth="2.5"
      />
    </svg>
  );
}

export function CoinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8" className="fill-amber-300 stroke-amber-500" />
      <path d="M12 18V6" className="stroke-amber-600" />
      <path d="M16 14h-4" className="stroke-amber-600" />
    </svg>
  )
}
