import * as React from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
export { Button } from './ui/button';
export { cn } from '../lib/utils';
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('dialog-content', wide && 'dialog-wide')}>
        <DialogTitle className="dialog-title">{title}</DialogTitle>
        <DialogDescription className="dialog-description">
          {description || 'Ma’lumotlarni kiriting va o‘zgarishlarni saqlang.'}
        </DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}
export function ErrorBox({ message }: { message: string }) {
  return message ? (
    <div className="error-box" role="alert">
      {message}
    </div>
  ) : null;
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={22} />
      Yuklanmoqda…
    </div>
  );
}
export function Empty({ text = 'Hozircha ma’lumot yo‘q.' }: { text?: string }) {
  return <div className="empty-state">{text}</div>;
}
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
