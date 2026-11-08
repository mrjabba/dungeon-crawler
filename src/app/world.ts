export interface Inventory {
  items: string[];
};

export enum Direction {
  North = 'North',
  South = 'South',
  East = 'East',
  West = 'West'
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
