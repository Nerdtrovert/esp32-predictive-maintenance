import * as React from 'react';

import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & {
    className?: string;
  }
>((props, ref) => {
  const { className, ...propsWithoutClassName } = props;
  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm ring-offset-background translucent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&>svg~*]:pl-4',
        className
      )}
      ref={ref}
      {...propsWithoutClassName}
    >
      <div className="p-6">{props.children}</div>
    </div>
  );
});
Card.displayName = 'Card';

const CardHeader = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  className?: string;
}) => (
  <div
    className={cn('flex flex-col space-between p-6', className)}
    {...props}
  >
    <div className="space-y-2">{props.children}</div>
  </div>
);
CardHeader.displayName = 'CardHeader';

const CardTitle = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'h2'> & {
  className?: string;
}) => (
  <h2
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
);
CardTitle.displayName = 'CardTitle';

const CardDescription = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'p'> & {
  className?: string;
}) => (
  <p
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
);
CardDescription.displayName = 'CardDescription';

const CardContent = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  className?: string;
}) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);
CardContent.displayName = 'CardContent';

const CardFooter = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  className?: string;
}) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription };
