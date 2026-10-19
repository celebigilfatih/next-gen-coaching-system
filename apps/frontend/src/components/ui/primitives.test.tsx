import { createRef, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Alert } from './alert';
import { Badge } from './badge';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Skeleton } from './skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from './sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

describe('tokenized primitives preserve their contracts', () => {
  it('keeps button variants, disabled behavior and asChild semantics', async () => {
    const user = userEvent.setup();
    const click = vi.fn();
    render(
      <>
        <Button disabled onClick={click} variant="amber">
          Save
        </Button>
        <Button variant="destructive">Delete</Button>
        <Button asChild>
          <a href="/app/week">Week</a>
        </Button>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(click).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(
      'bg-warning',
      'text-warning-foreground',
    );
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass(
      'text-destructive-foreground',
    );
    expect(screen.getByRole('link', { name: 'Week' })).toHaveAttribute(
      'href',
      '/app/week',
    );
  });

  it('forwards refs, native validation, controlled values and class overrides', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    function Fields() {
      const [name, setName] = useState('');
      const [notes, setNotes] = useState('');
      return (
        <>
          <Input
            ref={ref}
            aria-label="Name"
            name="name"
            required
            minLength={3}
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Textarea
            aria-label="Notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="bg-secondary"
          />
        </>
      );
    }
    render(<Fields />);
    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Name' }));
    expect(ref.current).toBeRequired();
    expect(ref.current).toHaveAttribute('minlength', '3');
    expect(ref.current).toHaveAttribute('autocomplete', 'name');
    expect(ref.current).toHaveClass('bg-input-surface');
    await user.type(ref.current!, 'Coach');
    await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'Session');
    expect(ref.current).toHaveValue('Coach');
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue(
      'Session',
    );
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveClass(
      'bg-secondary',
    );
    expect(screen.getByRole('textbox', { name: 'Notes' })).not.toHaveClass(
      'bg-input-surface',
    );
  });

  it('preserves status content and semantic surfaces', () => {
    render(
      <>
        <Alert>Failed</Alert>
        <Badge variant="amber">Match</Badge>
        <Skeleton data-testid="loading" aria-hidden="true" />
      </>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
    expect(screen.getByRole('alert')).toHaveClass('bg-card');
    expect(screen.getByText('Match')).toHaveClass(
      'bg-warning-soft',
      'text-warning-soft-foreground',
    );
    expect(screen.getByTestId('loading')).toHaveClass('bg-skeleton');
  });

  it.each(['dialog', 'sheet'] as const)(
    'preserves %s title, input focus, Escape and trigger focus return',
    async (kind) => {
      const user = userEvent.setup();
      const parts =
        kind === 'dialog'
          ? {
              Root: Dialog,
              Trigger: DialogTrigger,
              Content: DialogContent,
              Title: DialogTitle,
              Description: DialogDescription,
            }
          : {
              Root: Sheet,
              Trigger: SheetTrigger,
              Content: SheetContent,
              Title: SheetTitle,
              Description: SheetDescription,
            };
      render(
        <parts.Root>
          <parts.Trigger asChild>
            <Button>Open</Button>
          </parts.Trigger>
          <parts.Content>
            <parts.Title>Editor</parts.Title>
            <parts.Description>Draft only</parts.Description>
            <Input aria-label="Title" />
          </parts.Content>
        </parts.Root>,
      );
      const trigger = screen.getByRole('button', { name: 'Open' });
      await user.click(trigger);
      expect(screen.getByRole('dialog', { name: 'Editor' })).toHaveClass(
        'bg-popover',
      );
      expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
      await user.keyboard('{Escape}');
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(trigger).toHaveFocus();
    },
  );

  it('keeps keyboard tab activation and linked panels', async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="one">
        <TabsList aria-label="Editor tabs">
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First</TabsContent>
        <TabsContent value="two">Second</TabsContent>
      </Tabs>,
    );
    screen.getByRole('tab', { name: 'One' }).focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    );
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Second');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveClass(
      'data-[state=active]:bg-card',
    );
  });
});
