import type { ReactNode } from 'react';

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {children}
    </svg>
  );
}

export const PlayIcon = () => (
  <Icon>
    <path d="M8 5.6v12.8a1 1 0 0 0 1.54.84l9.8-6.4a1 1 0 0 0 0-1.68l-9.8-6.4A1 1 0 0 0 8 5.6Z" />
  </Icon>
);

export const PauseIcon = () => (
  <Icon>
    <rect x="6" y="5" width="4.4" height="14" rx="1.2" />
    <rect x="13.6" y="5" width="4.4" height="14" rx="1.2" />
  </Icon>
);

export const StepBackIcon = () => (
  <Icon>
    <path d="M18 6.4v11.2a.9.9 0 0 1-1.4.74l-8-5.6a.9.9 0 0 1 0-1.48l8-5.6a.9.9 0 0 1 1.4.74Z" />
    <rect x="5" y="5.5" width="2.4" height="13" rx="1" />
  </Icon>
);

export const StepForwardIcon = () => (
  <Icon>
    <path d="M6 6.4v11.2a.9.9 0 0 0 1.4.74l8-5.6a.9.9 0 0 0 0-1.48l-8-5.6A.9.9 0 0 0 6 6.4Z" />
    <rect x="16.6" y="5.5" width="2.4" height="13" rx="1" />
  </Icon>
);

export const RewindIcon = () => (
  <Icon>
    <path d="M12 5a7 7 0 1 1-6.7 9 1 1 0 1 1 1.9-.58A5 5 0 1 0 8 8.4l1.6 1.6a.5.5 0 0 1-.35.85H4.5a.5.5 0 0 1-.5-.5V5.6a.5.5 0 0 1 .85-.35L6.4 6.9A6.98 6.98 0 0 1 12 5Z" />
  </Icon>
);
