import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnInit, WritableSignal, computed, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Coordinate, Direction, Room } from '../world';
import { WorldService } from '../world.service';
import { InventoryComponent } from '../inventory/inventory.component';

@Component({
  selector: 'room-decorator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    InventoryComponent
    ],
  templateUrl: './room-decorator.component.html',
  styleUrls: ['./room-decorator.component.scss']
})
export class RoomDecoratorComponent implements OnInit {

  // public startingRoom = input.required<Room>();
  public startingRoomId = input.required<number>();
  public currentRoom!: Room;

  public direction = Direction;
  public moveDirection!: string;

  constructor(public worldService: WorldService, private cdr: ChangeDetectorRef) {
   }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch(event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (this.hasExit(Direction.North)) this.nav(Direction.North);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (this.hasExit(Direction.South)) this.nav(Direction.South);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (this.hasExit(Direction.West)) this.nav(Direction.West);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (this.hasExit(Direction.East)) this.nav(Direction.East);
        break;
    }
  }

  ngOnInit(): void {
    console.log(`startingRoomId=${JSON.stringify(this.startingRoomId())}`);
    this.currentRoom = this.worldService.getRoom(this.startingRoomId());
  }

  public moveToExit(direction: Direction) {
    this.moveDirection = direction;
    console.log('The player is moving!');
  }

  public hasExit(direction: Direction): boolean {
    let exit: Coordinate[] = this.currentRoom.exits.filter((exit: Coordinate) => {
      // console.log(`exit=${JSON.stringify(exit)} direction=${JSON.stringify(direction)}`);
      return exit.direction === direction;
    });
    return exit.length > 0;
  }

  public nav(direction: Direction): void {
    // this.commandControl.setValue(direction);
    let exit: Coordinate[] = this.currentRoom.exits.filter((exit: Coordinate) => {
      // console.log(`exit=${JSON.stringify(exit)} direction=${JSON.stringify(direction)}`);
      return exit.direction === direction;
    });
    if (exit.length > 0) {
      this.moveToExit(direction);
      this.navigate(exit[0]);
    } else {
      console.log(`WARN: exit not valid for requested direction=${JSON.stringify(direction)}`);
    }
  }

  private navigate(coordinate: Coordinate): void {
    this.currentRoom = this.worldService.getRoom(coordinate.roomId);
    this.cdr.markForCheck();
    console.log(`navigating to=${JSON.stringify(coordinate)}`);
  }

  public startOver(): void {
    this.currentRoom = this.worldService.goToStartingRoom();
    this.cdr.markForCheck();
    console.log(`>>> startOver currentRoom=${JSON.stringify(this.currentRoom)}`);
  }
}
