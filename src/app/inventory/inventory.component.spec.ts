import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { WorldService } from '../world.service';
import { InventoryComponent } from './inventory.component';
import { InventoryComponentHarness } from './inventory.component.harness';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

describe('InventoryComponent', () => {
  let harness: InventoryComponentHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(InventoryComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      InventoryComponentHarness
    );
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(InventoryComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should show the room empty state only when the room has no items', async () => {
    const fixture = TestBed.createComponent(InventoryComponent);
    fixture.componentRef.setInput('roomContents', ['apple']);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).not.toContain('No items in this room');

    fixture.componentRef.setInput('roomContents', []);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('No items in this room');
  });

  it('should render inventory', async () => {
    expect(await harness.isPresent()).toBe(true);
  });
});

describe('InventoryComponent keyboard', () => {
  async function setup(room = ['apple', 'hammer', 'sword'], carried: string[] = []) {
    TestBed.inject(WorldService).getInventory().items.push(...carried);
    const fixture = TestBed.createComponent(InventoryComponent);
    fixture.componentRef.setInput('roomContents', room);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    const itemsIn = (index: number) =>
      Array.from(page.querySelectorAll('.inventory-list')[index].querySelectorAll('[role="option"]'))
        .map(option => option.textContent);
    return { page, roomItems: () => itemsIn(0), carriedItems: () => itemsIn(1) };
  }

  function press(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
    (document.activeElement ?? document.body).dispatchEvent(event);
    return event;
  }

  const focused = () => document.activeElement?.textContent;

  it('should focus the first room item when I is pressed', async () => {
    await setup();
    press('i');
    expect(focused()).toBe('apple');
  });

  it('should open the inventory when the room has no items', async () => {
    await setup([], ['book']);
    press('I');
    expect(focused()).toBe('book');
  });

  it('should leave focus alone when there are no items anywhere', async () => {
    await setup([]);
    press('i');
    expect(document.activeElement).toBe(document.body);
  });

  it('should ignore I pressed with a browser modifier', async () => {
    await setup();
    press('i', { metaKey: true });
    expect(document.activeElement).toBe(document.body);
  });

  [
    { key: 'ArrowDown', expected: 'hammer' },
    { key: 's', expected: 'hammer' },
    { key: 'S', expected: 'hammer' },
  ].forEach(({ key, expected }) => {
    it(`should move down the list with '${key}'`, async () => {
      await setup();
      press('i');
      press(key);
      expect(focused()).toBe(expected);
    });
  });

  [
    { key: 'ArrowUp', expected: 'apple' },
    { key: 'w', expected: 'apple' },
  ].forEach(({ key, expected }) => {
    it(`should move up the list with '${key}'`, async () => {
      await setup();
      press('i');
      press('s');
      press(key);
      expect(focused()).toBe(expected);
    });
  });

  it('should stop at the ends of the list', async () => {
    await setup(['apple', 'hammer']);
    press('i');
    press('ArrowUp');
    expect(focused()).toBe('apple');
    press('s');
    press('s');
    expect(focused()).toBe('hammer');
  });

  [
    { right: 'ArrowRight', left: 'ArrowLeft' },
    { right: 'd', left: 'a' },
  ].forEach(({ right, left }) => {
    it(`should switch lists with '${right}' and '${left}'`, async () => {
      await setup(['apple'], ['book']);
      press('i');
      press(right);
      expect(focused()).toBe('book');
      press(left);
      expect(focused()).toBe('apple');
    });
  });

  it('should stay put when the other list is empty', async () => {
    await setup(['apple']);
    press('i');
    press('ArrowRight');
    expect(focused()).toBe('apple');
  });

  [
    { key: 'Enter' },
    { key: ' ' },
  ].forEach(({ key }) => {
    it(`should take the focused item and focus the next one with '${key}'`, async () => {
      const { roomItems, carriedItems } = await setup();
      press('i');
      press('s');
      press(key);
      expect(roomItems()).toEqual(['apple', 'sword']);
      expect(carriedItems()).toEqual(['hammer']);
      expect(focused()).toBe('sword');
    });
  });

  it('should focus the new last item after taking the last one in the list', async () => {
    const { roomItems } = await setup(['apple', 'hammer']);
    press('i');
    press('s');
    press('Enter');
    expect(roomItems()).toEqual(['apple']);
    expect(focused()).toBe('apple');
  });

  it('should drop a carried item into the room', async () => {
    const { roomItems, carriedItems } = await setup(['apple'], ['book', 'sandwich']);
    press('i');
    press('d');
    press('Enter');
    expect(carriedItems()).toEqual(['sandwich']);
    expect(roomItems()).toEqual(['apple', 'book']);
    expect(focused()).toBe('sandwich');
  });

  it('should return to walking when the list empties', async () => {
    const button = document.body.appendChild(document.createElement('button'));
    const { roomItems, carriedItems } = await setup(['apple']);
    button.focus();
    press('i');
    press('Enter');
    expect(roomItems()).toEqual([]);
    expect(carriedItems()).toEqual(['apple']);
    expect(document.activeElement).toBe(button);
    button.remove();
  });

  it('should return focus to where it was on Escape', async () => {
    const button = document.body.appendChild(document.createElement('button'));
    await setup();
    button.focus();
    press('i');
    press('s');
    press('Escape');
    expect(document.activeElement).toBe(button);
    button.remove();
  });

  it('should release focus on Escape when it came from nowhere', async () => {
    await setup();
    press('i');
    press('Escape');
    expect(document.activeElement).toBe(document.body);
  });

  it('should keep item keys from reaching the rest of the page', async () => {
    await setup();
    const heard: string[] = [];
    const listener = (event: KeyboardEvent) => heard.push(event.key);
    window.addEventListener('keydown', listener);
    press('i');
    for (const key of ['s', 'w', 'ArrowDown', 'ArrowUp', 'a', 'd', 'Enter', 'Escape']) {
      press(key);
      press('i');
    }
    window.removeEventListener('keydown', listener);
    expect(heard.filter(key => key !== 'i')).toEqual([]);
  });

  it('should stop arrow keys and space scrolling the page', async () => {
    await setup();
    press('i');
    expect(press('ArrowDown').defaultPrevented).toBe(true);
    expect(press(' ').defaultPrevented).toBe(true);
  });

  it('should leave modified keys for the browser', async () => {
    const { roomItems } = await setup();
    press('i');
    const event = press('Enter', { ctrlKey: true });
    expect(event.defaultPrevented).toBe(false);
    expect(roomItems()).toEqual(['apple', 'hammer', 'sword']);
  });

  it('should announce what moved', async () => {
    const { page } = await setup();
    press('i');
    press('Enter');
    expect(page.querySelector('[aria-live="polite"]')?.textContent).toContain('Took apple');
    press('d');
    press('Enter');
    expect(page.querySelector('[aria-live="polite"]')?.textContent).toContain('Dropped apple');
  });

  it('should keep one tab stop per list', async () => {
    const { page } = await setup();
    const tabbable = page.querySelectorAll('.inventory-list [tabindex="0"]');
    expect(Array.from(tabbable).map(option => option.textContent)).toEqual(['apple']);
    expect(page.querySelectorAll('.inventory-list [tabindex="-1"]').length).toBe(2);
  });

  it('should only call a list a listbox while it has items', async () => {
    const { page } = await setup(['apple']);
    const lists = page.querySelectorAll('.inventory-list');
    expect(lists[0].getAttribute('role')).toBe('listbox');
    expect(lists[1].getAttribute('role')).toBe('group');
  });

  it('should not move focus to an item on mouse press, so WASD keeps walking', async () => {
    const { page } = await setup();
    const option = page.querySelector('[role="option"]')!;
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    option.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should render duplicate items correctly and without warnings', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { roomItems, carriedItems } = await setup(['apple', 'orange'], ['hammer', 'apple']);
    press('i');
    press('Enter');
    expect(carriedItems()).toEqual(['hammer', 'apple', 'apple']);
    press('d');
    press('Enter');
    expect(carriedItems()).toEqual(['apple', 'apple']);
    expect(roomItems()).toEqual(['orange', 'hammer']);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
