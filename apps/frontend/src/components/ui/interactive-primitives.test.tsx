import { createRef, useState } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
import { ScrollArea } from './scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Avatar, AvatarFallback } from './avatar';
import { Separator } from './separator';
import { Tabs, TabsList, TabsTrigger } from './tabs';
import { Dialog, DialogContent, DialogTitle } from './dialog';

// jsdom does not implement scrolling. This shim only lets Radix focus an item;
// it is not evidence that an overflowing viewport scrolls in a real browser.
const originalScroll = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'scrollIntoView',
);
const originalCapture = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'hasPointerCapture',
);
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
  // Pointer-capture support is also absent in jsdom; no pointer is captured here.
  Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
    configurable: true,
    value: () => false,
  });
});
afterAll(() => {
  if (originalScroll)
    Object.defineProperty(
      HTMLElement.prototype,
      'scrollIntoView',
      originalScroll,
    );
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
  if (originalCapture)
    Object.defineProperty(
      HTMLElement.prototype,
      'hasPointerCapture',
      originalCapture,
    );
  else Reflect.deleteProperty(HTMLElement.prototype, 'hasPointerCapture');
});

function CategorySelect({
  disabled = false,
  onChange = () => {},
}: {
  disabled?: boolean;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState('warmup');
  return (
    <form aria-label="Exercise">
      <Select
        name="category"
        value={value}
        disabled={disabled}
        onValueChange={(next) => {
          setValue(next);
          onChange(next);
        }}
      >
        <SelectTrigger aria-label="Category">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="warmup">Warmup</SelectItem>
          <SelectItem value="locked" disabled>
            Locked
          </SelectItem>
          <SelectItem value="main">Main</SelectItem>
        </SelectContent>
      </Select>
    </form>
  );
}

describe('Select', () => {
  it('selects by keyboard, skips disabled items, serializes and returns focus', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    render(<CategorySelect onChange={changed} />);
    const trigger = screen.getByRole('combobox', { name: 'Category' });
    expect(trigger).toHaveClass(
      'cursor-pointer',
      'disabled:cursor-not-allowed',
    );
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('listbox')).toHaveClass('bg-popover');
    expect(screen.getByRole('option', { name: 'Locked' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('option', { name: 'Locked' })).toHaveClass(
      'cursor-pointer',
      'data-[disabled]:cursor-not-allowed',
    );
    await user.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(trigger).toHaveTextContent('Main'));
    expect(changed).toHaveBeenCalledExactlyOnceWith('main');
    expect(
      new FormData(
        screen.getByRole('form', { name: 'Exercise' }) as HTMLFormElement,
      ).get('category'),
    ).toBe('main');
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('Escape cancels focused but uncommitted selection', async () => {
    const user = userEvent.setup();
    const changed = vi.fn();
    render(<CategorySelect onChange={changed} />);
    const trigger = screen.getByRole('combobox', { name: 'Category' });
    trigger.focus();
    await user.keyboard('{Enter}{ArrowDown}{Escape}');
    expect(trigger).toHaveTextContent('Warmup');
    expect(trigger).toHaveFocus();
    expect(changed).not.toHaveBeenCalled();
  });

  it('does not open a disabled select and forwards its trigger ref', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLButtonElement>();
    render(
      <Select disabled>
        <SelectTrigger ref={ref} aria-label="Unavailable">
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="one">One</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(ref.current).toBeDisabled();
    expect(ref.current).toHaveClass('disabled:cursor-not-allowed');
    await user.click(screen.getByRole('combobox', { name: 'Unavailable' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

describe('DropdownMenu', () => {
  const Menu = ({ choose }: { choose: () => void }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem disabled>Unavailable</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={choose}>Settings</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  it('opens with the keyboard, skips disabled commands and activates exactly once', async () => {
    const user = userEvent.setup();
    const choose = vi.fn();
    render(<Menu choose={choose} />);
    const trigger = screen.getByRole('button', { name: 'Account' });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menu')).toHaveClass('bg-popover');
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveClass(
      'cursor-pointer',
    );
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(choose).toHaveBeenCalledOnce();
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('Escape closes without invoking an action', async () => {
    const user = userEvent.setup();
    const choose = vi.fn();
    render(<Menu choose={choose} />);
    const trigger = screen.getByRole('button', { name: 'Account' });
    trigger.focus();
    await user.keyboard('{Enter}{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(choose).not.toHaveBeenCalled();
  });
});

describe('interactive cursors', () => {
  it('uses pointer cursors for active controls and not-allowed for disabled controls', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Cursor dialog</DialogTitle>
          <Button>Active</Button>
          <Button disabled>Disabled</Button>
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Active tab</TabsTrigger>
              <TabsTrigger value="disabled" disabled>
                Disabled tab
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole('button', { name: 'Active' })).toHaveClass(
      'cursor-pointer',
    );
    expect(screen.getByRole('button', { name: 'Disabled' })).toHaveClass(
      'disabled:cursor-not-allowed',
    );
    expect(screen.getByRole('tab', { name: 'Active tab' })).toHaveClass(
      'cursor-pointer',
    );
    expect(screen.getByRole('tab', { name: 'Disabled tab' })).toHaveClass(
      'disabled:cursor-not-allowed',
    );
    expect(screen.getByRole('button', { name: 'Kapat' })).toHaveClass(
      'cursor-pointer',
      'disabled:cursor-not-allowed',
    );
  });
});

describe('Tooltip and ScrollArea', () => {
  it('exposes keyboard tooltip description and dismisses with Escape', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Help</Button>
          </TooltipTrigger>
          <TooltipContent>Choose a formation</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Choose a formation',
    );
    expect(
      screen.getByRole('button', { name: 'Help' }),
    ).toHaveAccessibleDescription('Choose a formation');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Help' })).toHaveFocus();
  });

  it('opens a tooltip on pointer hover and closes on leave', async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Tool</Button>
          </TooltipTrigger>
          <TooltipContent>Move element</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    await user.hover(screen.getByRole('button', { name: 'Tool' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Move element',
    );
    await user.unhover(screen.getByRole('button', { name: 'Tool' }));
    // Exit Radix's hoverable-content grace polygon, not merely the trigger.
    await user.pointer({
      target: document.body,
      coords: { clientX: 100, clientY: 100 },
    });
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
  });

  it('keeps scroll-area child controls keyboard reachable and forwards the root ref', async () => {
    const user = userEvent.setup();
    const selected = vi.fn();
    const ref = createRef<HTMLDivElement>();
    render(
      <>
        <Button>Before</Button>
        <ScrollArea
          ref={ref}
          aria-label="Layers"
          role="region"
          className="h-24"
        >
          <Button onClick={selected}>Layer one</Button>
          <Button disabled>Locked layer</Button>
          <Button>Layer two</Button>
        </ScrollArea>
        <Button>After</Button>
      </>,
    );
    expect(ref.current).toBe(screen.getByRole('region', { name: 'Layers' }));
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Layer one' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(selected).toHaveBeenCalledOnce();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Layer two' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });
});

describe('retained display primitives', () => {
  it('preserves card density classes and semantic heading/content', () => {
    render(
      <Card role="region" aria-label="Summary">
        <CardHeader>
          <CardTitle>Training</CardTitle>
        </CardHeader>
        <CardContent>75 minutes</CardContent>
      </Card>,
    );
    const card = screen.getByRole('region', { name: 'Summary' });
    expect(card).toHaveClass('bg-card', 'rounded-xl', 'shadow-sm');
    expect(
      within(card).getByRole('heading', { name: 'Training', level: 3 }),
    ).toHaveClass('text-xl', 'font-semibold');
    expect(within(card).getByText('75 minutes')).toHaveClass('p-5', 'pt-0');
  });

  it('keeps avatar fallback and decorative/semantic separator behavior', () => {
    render(
      <>
        <Avatar aria-label="Coach">
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
        <Separator data-testid="decorative" />
        <Separator decorative={false} orientation="vertical" />
      </>,
    );
    expect(screen.getByText('AB')).toHaveClass('bg-secondary', 'size-full');
    expect(screen.getByTestId('decorative')).not.toHaveAttribute(
      'role',
      'separator',
    );
    expect(screen.getByRole('separator')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
  });
});
