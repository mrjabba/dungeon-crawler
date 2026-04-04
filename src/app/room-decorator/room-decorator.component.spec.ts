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

  it('should change background image when player moves to a different room', async () => {
    const { harness } = await setup();
    const initialBackground = await harness.getBackgroundImage();
    
    await harness.navigate(Direction.North);
    await harness.waitForTransition();
    const afterFirstMove = await harness.getBackgroundImage();
    expect(afterFirstMove).not.toBe(initialBackground);
    
    await harness.navigate(Direction.South);
    await harness.waitForTransition();
    const afterSecondMove = await harness.getBackgroundImage();
    expect(afterSecondMove).not.toBe(afterFirstMove);
  });

  it('should cycle back to first background after all backgrounds are used', async () => {
    const { harness } = await setup();
    const firstBackground = await harness.getBackgroundImage();
    
    await harness.navigate(Direction.North);
    await harness.waitForTransition();
    const secondBackground = await harness.getBackgroundImage();
    
    await harness.navigate(Direction.East);
    await harness.waitForTransition();
    const thirdBackground = await harness.getBackgroundImage();
    
    await harness.navigate(Direction.West);
    await harness.waitForTransition();
    const backToFirst = await harness.getBackgroundImage();
    expect(backToFirst).toBe(firstBackground);
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
