import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import * as React from 'react';
import { cn } from '../../lib/utils';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: 'right' | 'left';
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/45" />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-y-0 z-50 w-[min(88vw,390px)] bg-white p-6 shadow-2xl',
          side === 'right' ? 'right-0' : 'left-0',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-md p-1 hover:bg-secondary"
          aria-label="Kapat"
        >
          <X />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
const SheetHeader = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div className={cn('mb-5 grid gap-1', className)} {...props} />
);
const SheetTitle = DialogPrimitive.Title;
const SheetDescription = DialogPrimitive.Description;
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
