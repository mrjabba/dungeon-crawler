import { Component } from '@angular/core';
import { WorldService } from './world.service';
import { RoomDecoratorComponent } from './room-decorator/room-decorator.component';

@Component({
  selector: 'app-root',
  imports: [RoomDecoratorComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public startingRoomId!: number;

  constructor(public worldService: WorldService) {
    this.startingRoomId = this.worldService.goToStartingRoom().id;
  }
}
