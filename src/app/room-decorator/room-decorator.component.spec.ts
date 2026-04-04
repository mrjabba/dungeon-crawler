import { TestBed } from '@angular/core/testing';
import { RoomDecoratorComponent } from './room-decorator.component';
import { WorldService } from '../world.service';
import { RoomDecoratorComponentHarness } from './room-decorator.component.harness';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Direction } from '../world';

describe('RoomDecoratorComponent', () => {

  it('should render current location', async () => {
    const { harness } = await setup();
    const roomIdText = await harness.getRoomIdText();
    expect(roomIdText).toContain(WorldService.STARTING_LOCATION.toString());
  });

  it('should allow player to move to a different room', async () => {
    const { harness, worldService } = await setup();
    const roomIdText = await harness.getRoomIdText();
    await harness.navigate(Direction.North);
    await harness.waitForTransition();
    expect(await harness.getRoomIdText()).not.toContain(WorldService.STARTING_LOCATION.toString());

    await harness.navigate(Direction.South);
    await harness.waitForTransition();
    const currentRoomId = await harness.getRoomIdText();
    expect(currentRoomId).toContain(WorldService.STARTING_LOCATION.toString());

    const currentRoom = worldService.getRoom(Number(currentRoomId));

    // add a bit of randomness to the test. Later, we can design a spec
    // that will allow the test to drive the player through the map
    // using strategies like "go to the first exit" or "go to the last exit"
    // maybe add chancejs
    const firstPossibleCoodinate = currentRoom.exits[0];
    const firstPossibleExit = firstPossibleCoodinate.direction;
    await harness.navigate(firstPossibleExit);
    await harness.waitForTransition();
    expect(await harness.getRoomIdText()).toEqual(firstPossibleCoodinate.roomId.toString());
  });

  async function setup() {
    await TestBed.configureTestingModule({
      imports: [RoomDecoratorComponent],
      providers: [WorldService]
    }).compileComponents();

    const fixture = TestBed.createComponent(RoomDecoratorComponent);    
    fixture.componentRef.setInput('startingRoomId', WorldService.STARTING_LOCATION);
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, RoomDecoratorComponentHarness);
    const worldService = TestBed.inject(WorldService);

    return {
      harness,
      worldService
    }
  }
});
