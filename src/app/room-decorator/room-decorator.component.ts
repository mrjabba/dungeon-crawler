import { ChangeDetectorRef, Component, OnInit, WritableSignal, computed, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Coordinate, Direction, Room } from '../world';
import { WorldService } from '../world.service';
import { InventoryComponent } from '../inventory/inventory.component';

interface RoomMessage {
  text: string;
  type: 'exploration' | 'discovery' | 'atmosphere';
}

const BACKGROUND_IMAGES = [
  '../../assets/dungeonhallway1.png',
  '../../assets/dungeonhallway2.png',
  '../../assets/dungeonhallway3.png',
];

@Component({
  selector: 'room-decorator',
  imports: [
    MatButtonModule,
    InventoryComponent
    ],
  templateUrl: './room-decorator.component.html',
  styleUrls: ['./room-decorator.component.scss'],
  host: {
    '(window:keydown)': 'handleKeyboardEvent($event)'
  }
})
export class RoomDecoratorComponent implements OnInit {

  public startingRoomId = input.required<number>();
  public currentRoom!: Room;
  public direction = Direction;
  public moveDirection!: string;
  
  public isTransitioning = signal(false);
  public currentMessage = signal<RoomMessage | null>(null);
  public currentBackgroundIndex = signal(0);
  public currentBackground = computed(() => BACKGROUND_IMAGES[this.currentBackgroundIndex()]);
  
  private roomMessages: RoomMessage[] = [
    { text: 'You push forward into the unknown...', type: 'exploration' },
    { text: 'The air grows colder here.', type: 'atmosphere' },
    { text: 'Something glints in the darkness...', type: 'discovery' },
    { text: 'Your footsteps echo in the silence.', type: 'atmosphere' },
    { text: 'A draft whispers through the stones.', type: 'atmosphere' },
    { text: 'You sense you are not alone.', type: 'atmosphere' },
    { text: 'The path continues onward...', type: 'exploration' },
    { text: 'Shadows dance at the edge of sight.', type: 'atmosphere' },
    { text: 'A faint glow guides your way.', type: 'discovery' },
    { text: 'The dungeon breathes around you.', type: 'atmosphere' },
  ];

  constructor(public worldService: WorldService, private cdr: ChangeDetectorRef) {
   }

  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key.startsWith('Arrow')) event.preventDefault();
    if (this.isTransitioning()) return;
    
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
    this.currentRoom = this.worldService.getRoom(this.startingRoomId());
    this.showRandomMessage();
  }

  private showRandomMessage(): void {
    const randomIndex = Math.floor(Math.random() * this.roomMessages.length);
    this.currentMessage.set(this.roomMessages[randomIndex]);
  }

  public moveToExit(direction: Direction) {
    this.moveDirection = direction;
  }

  public hasExit(direction: Direction): boolean {
    let exit: Coordinate[] = this.currentRoom.exits.filter((exit: Coordinate) => {
      return exit.direction === direction;
    });
    return exit.length > 0;
  }

  public nav(direction: Direction): void {
    if (this.isTransitioning()) return;
    
    let exit: Coordinate[] = this.currentRoom.exits.filter((exit: Coordinate) => {
      return exit.direction === direction;
    });
    if (exit.length > 0) {
      this.moveToExit(direction);
      this.transitionToRoom(exit[0]);
    }
  }

  private transitionToRoom(coordinate: Coordinate): void {
    this.isTransitioning.set(true);
    this.currentMessage.set(null);
    
    setTimeout(() => {
      this.currentRoom = this.worldService.getRoom(coordinate.roomId);
      this.currentBackgroundIndex.set((this.currentBackgroundIndex() + 1) % BACKGROUND_IMAGES.length);
      this.cdr.markForCheck();
      this.showRandomMessage();
      
      setTimeout(() => {
        this.isTransitioning.set(false);
        this.cdr.markForCheck();
      }, 300);
    }, 200);
  }

  public startOver(): void {
    if (this.isTransitioning()) return;
    
    this.isTransitioning.set(true);
    setTimeout(() => {
      this.worldService.reset();
      this.currentRoom = this.worldService.goToStartingRoom();
      this.currentBackgroundIndex.set(0);
      this.cdr.markForCheck();
      this.showRandomMessage();
      
      setTimeout(() => {
        this.isTransitioning.set(false);
        this.cdr.markForCheck();
      }, 300);
    }, 200);
  }
}
