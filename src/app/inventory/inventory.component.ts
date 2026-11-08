import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, input } from '@angular/core';
import { Inventory } from '../world';
import { WorldService } from '../world.service';

@Component({
  selector: 'inventory',
  imports: [
    DragDropModule
    ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent {
  public roomContents = input<string[]>([]);
  public inventory: Inventory;

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
}
