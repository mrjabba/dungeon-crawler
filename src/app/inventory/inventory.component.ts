import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { Inventory } from '../world';
import { WorldService } from '../world.service';

const OPTION = '[role="option"]';

@Component({
  selector: 'inventory',
  imports: [
    DragDropModule
    ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  host: {
    '(window:keydown)': 'openItems($event)'
  }
})
export class InventoryComponent {
  public roomContents = input<string[]>([]);
  public inventory: Inventory;
  public announcement = signal('');

  private cdr = inject(ChangeDetectorRef);
  private roomList = viewChild.required('roomContentsList', { read: ElementRef<HTMLElement> });
  private inventoryList = viewChild.required('inventoryList', { read: ElementRef<HTMLElement> });
  private returnFocus: HTMLElement | null = null;

  constructor(public worldService: WorldService) {
    this.inventory = this.worldService.getInventory();
  }

  public drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  public openItems(event: KeyboardEvent): void {
    if (this.hasBrowserModifier(event) || event.key.toLowerCase() !== 'i') return;
    if (document.activeElement?.closest(OPTION)) return;

    const first = this.optionsIn(this.roomList().nativeElement)[0]
      ?? this.optionsIn(this.inventoryList().nativeElement)[0];
    if (first) {
      this.returnFocus = document.activeElement as HTMLElement;
      first.focus();
    }
  }

  public onItemKeydown(event: KeyboardEvent): void {
    const item = (event.target as HTMLElement).closest<HTMLElement>(OPTION);
    if (!item || this.hasBrowserModifier(event)) return;

    const list = event.currentTarget as HTMLElement;
    const items = this.optionsIn(list);
    const index = items.indexOf(item);

    switch (event.key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        items[index - 1]?.focus();
        break;
      case 'arrowdown':
      case 's':
        items[index + 1]?.focus();
        break;
      case 'arrowleft':
      case 'a':
        this.optionsIn(this.roomList().nativeElement)[0]?.focus();
        break;
      case 'arrowright':
      case 'd':
        this.optionsIn(this.inventoryList().nativeElement)[0]?.focus();
        break;
      case 'enter':
      case ' ':
        this.moveItem(list, index);
        break;
      case 'escape':
        this.leaveItems(item);
        break;
      default:
        return;
    }
    // Stops the walking handler on window from also acting on these keys.
    event.preventDefault();
    event.stopPropagation();
  }

  private moveItem(list: HTMLElement, index: number): void {
    const taking = list === this.roomList().nativeElement;
    const [from, to] = taking
      ? [this.roomContents(), this.inventory.items]
      : [this.inventory.items, this.roomContents()];
    this.announcement.set(`${taking ? 'Took' : 'Dropped'} ${from[index]}`);
    transferArrayItem(from, to, index, to.length);
    this.cdr.detectChanges();

    const remaining = this.optionsIn(list);
    if (remaining.length) {
      remaining[Math.min(index, remaining.length - 1)].focus();
    } else {
      this.leaveItems(document.activeElement as HTMLElement);
    }
  }

  private leaveItems(item: HTMLElement): void {
    item.blur();
    this.returnFocus?.focus();
    this.returnFocus = null;
  }

  private optionsIn(list: HTMLElement): HTMLElement[] {
    return Array.from(list.querySelectorAll<HTMLElement>(OPTION));
  }

  private hasBrowserModifier(event: KeyboardEvent): boolean {
    return event.ctrlKey || event.metaKey || event.altKey;
  }
}
