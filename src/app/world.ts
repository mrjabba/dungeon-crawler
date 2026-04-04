export interface Inventory {
  items: string[];
};

export interface DirectionData {
  values: string[];
};

export enum Direction {
  North = 'North',
  South = 'South',
  East = 'East',
  West = 'West'
}

export interface CompassDirection {
  values: string[],
  direction: Direction
}
export interface Coordinate {
  direction: Direction,
  roomId: number
}
export interface Room {
  id: number;
  desc: string;
  exits: Coordinate[];
  items: string[];
  style?: string;
}

export class ItemManifest {
  private items: string[];

  constructor() {
    this.items = [
      'apple',
      'turkey leg',
      'orange',
      'banana',
      'hammer',
      'sword',
      'shield'
    ];
  }
}

