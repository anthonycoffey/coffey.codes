import React from 'react';

type Align = 'left' | 'center' | 'right';

// Full literal class strings so Tailwind's JIT scanner picks them up.
const alignClass: Record<Align, string> = {
  left: '!justify-start',
  center: '!justify-center',
  right: '!justify-end',
};

export default function SocialIcons({
  align = 'right',
}: {
  align?: Align;
}) {
  return (
    <div className={`social-icons ${alignClass[align]}`}>
      <a
        href="https://linktr.ee/coffeycodes"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Linktree"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
          className="icon"
        >
          <path d="m13.736 5.853l4.005-4.117l2.325 2.38l-4.2 4.005h5.908v3.305h-5.937l4.229 4.108l-2.325 2.334l-5.74-5.769l-5.741 5.769l-2.325-2.325l4.229-4.108H2.226V8.121h5.909l-4.2-4.004l2.324-2.381l4.005 4.117V0h3.472zm-3.472 10.306h3.472V24h-3.472z" />
        </svg>
      </a>
      <a
        href="https://www.linkedin.com/in/coffeyanthony/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
      >
        <svg
          className="icon"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19 0h-14c-2.8 0-5 2.2-5 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5v-14c0-2.8-2.2-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.3c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8zm13.5 12.3h-3v-5.6c0-3.4-4-3.1-4 0v5.6h-3v-11h3v1.5c1.4-2.6 7-2.8 7 2.5v7z" />
        </svg>
      </a>
      <a
        href="https://github.com/anthonycoffey"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
      >
        <svg
          className="icon"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 0c-6.6 0-12 5.4-12 12 0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1.7 2.8 3.3 2 .3-.6.5-1.3.6-1.6-2.7-.3-5.5-1.4-5.5-6 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.3 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.6 3.3-1.3 3.3-1.3.6 1.7.2 2.9.1 3.2.8.9 1.2 2 1.2 3.3 0 4.6-2.8 5.7-5.5 6 .3.3.6.9.6 1.9v2.8c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4 0-6.6-5.4-12-12-12z" />
        </svg>
      </a>
      <a
        href="https://x.com/coffeywebdev"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X (formerly Twitter)"
      >
        <svg
          className="icon"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href="https://www.youtube.com/@coffeycodes"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
      >
        <svg
          className="icon"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z" />
        </svg>
      </a>
      <a
        href="https://www.behance.net/anthonycoffey"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Behance"
      >
        <svg
          className="icon"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
        </svg>
      </a>
    </div>
  );
}
