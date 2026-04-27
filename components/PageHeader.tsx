import type { ComponentType, SVGProps } from 'react';

interface PageHeaderProps {
  /** The page title. */
  title: React.ReactNode;
  /** Short description rendered under the title. */
  description?: React.ReactNode;
  /** Heroicon (or any SVG component) rendered to the left of the title. */
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  /**
   * Extra content rendered inside the header below the description —
   * e.g. a "← Back to all articles" link on taxonomy pages.
   */
  children?: React.ReactNode;
}

/**
 * The canonical page title block.
 *
 * Owns: top padding, title typography, icon, description, and the bottom
 * border separator. Every titled page in the app should use this component
 * so that title styling changes happen in exactly one place.
 *
 * Pages that don't have a title (e.g. the article slug page, which uses
 * Breadcrumbs instead) intentionally do not use this component.
 */
export default function PageHeader({
  title,
  description,
  icon: Icon,
  children,
}: PageHeaderProps) {
  return (
    <header className="pt-6 sm:pt-8 pb-4 mb-6 border-b border-border">
      <h1 className="font-bold text-3xl lg:text-4xl mb-2 flex items-center text-c-heading">
        {Icon ? (
          <Icon className="w-8 h-8 inline mr-3 text-accent1-dark" />
        ) : null}
        {title}
      </h1>
      {description ? <p className="text-c-muted mb-4">{description}</p> : null}
      {children}
    </header>
  );
}
