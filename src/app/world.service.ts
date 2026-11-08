import { Injectable } from '@angular/core';
import { Direction, Inventory, Room } from './world';

@Injectable({
  providedIn: 'root'
})
export class WorldService {
  public static readonly STARTING_LOCATION: number = 100;
  private rooms: Room[] = [];
  private inventory: Inventory;

  constructor() {
    this.loadRooms();
    this.inventory = {
      items: []
    }
  }

  public reset(): void {
    this.loadRooms();
    this.inventory.items = [];
  }

  public getInventory(): Inventory {
    return this.inventory;
  }

  public goToStartingRoom(): Room {
    return this.getRoom(WorldService.STARTING_LOCATION);
  }

  public getRoom(id: number): Room {
    const room = this.rooms.find((room: Room) => room.id === id);
    if (!room) {
      throw new Error(`Unknown room ${id}`);
    }
    return room;
  }

  private loadRooms(): void {
    this.rooms =
        [
          { id: 100,
            desc: "You have materialized into a house. This is the beginning.",
            style: 'room', // FIXME use an enum? style could be a UI descriptor?
            exits: [ { direction: Direction.North, roomId: 101} ],
            items: [
              'apple',
              'turkey-leg',
              'hammer',
              'sword',
              'shield'
            ]
          },
          { id: 101,
            desc: "a large room",
            style: 'room',
            exits: [
               { direction: Direction.North, roomId: 102},
               { direction: Direction.South, roomId: 100},
               { direction: Direction.East, roomId: 103},
               { direction: Direction.West, roomId: 104}
                          ],
            items: [
              'apple',
              'orange'
            ]
          },
          { id: 102,
            desc: "You are in a long hallway",
            style: 'hallway',
            exits: [
               { direction: Direction.North, roomId: 106},
               { direction: Direction.South, roomId: 101},
               { direction: Direction.East, roomId: 105}
                          ],
            items: []
          },
          { id: 103,
            desc: "a dining room",
            exits: [
               { direction: Direction.West, roomId: 101}
                          ],
            items: []
          },
          { id: 104,
            desc: "a study",
            exits: [
               { direction: Direction.East, roomId: 101}
                          ],
            items: [
              'ball'
            ]
          },
          { id: 105,
            desc: "a tiny closet. a trap",
            exits: [
               { direction: Direction.West, roomId: 102}
                          ],
            items: [
              'ball'
            ]
          },
          { id: 106,
            desc: "a great hall",
            exits: [
               { direction: Direction.South, roomId: 102},
               { direction: Direction.West, roomId: 107}
                          ],
            items: []
          },
          { id: 107,
            desc: "a library",
            exits: [
               { direction: Direction.North, roomId: 108},
               { direction: Direction.East, roomId: 106}
                          ],
            items: [
              'book'
            ]
          },
          { id: 108,
            desc: "a kitchen",
            exits: [
              { direction: Direction.South, roomId: 107},
              { direction: Direction.East, roomId: 109}
                          ],
            items: [
              'sandwich'
            ]
          },
          { id: 109,
            desc: "a back porch",
            exits: [
              { direction: Direction.North, roomId: 111},
              { direction: Direction.West, roomId: 108},
              { direction: Direction.East, roomId: 110}
                          ],
            items: []
          },
          { id: 110,
            desc: "a closet.",
            exits: [
              { direction: Direction.West, roomId: 109}
                          ],
            items: []
          },
          { id: 111,
            desc: "back yard. the end!",
            exits: [
               { direction: Direction.South, roomId: 109}
                          ],
            items: []
          }
        ]
  }
}
