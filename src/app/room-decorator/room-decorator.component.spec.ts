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

  it('should move the player with the keyboard', async () => {
    const { harness } = await setup();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    await harness.waitForTransition();
    expect(await harness.getRoomIdText()).toEqual('101');
  });

  it('should ignore movement keys pressed with a browser modifier', async () => {
    const { harness } = await setup();
    for (const modifier of ['ctrlKey', 'metaKey', 'altKey']) {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp', [modifier]: true, cancelable: true });
      window.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', ctrlKey: true }));
    await harness.waitForTransition();
    expect(await harness.getRoomIdText()).toEqual(WorldService.STARTING_LOCATION.toString());
  });

  it('should stop arrow keys scrolling the page, even with no exit that way', async () => {
    const { harness } = await setup();
    const noExit = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
    window.dispatchEvent(noExit);
    expect(noExit.defaultPrevented).toBe(true);

    const move = new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true });
    window.dispatchEvent(move);
    expect(move.defaultPrevented).toBe(true);

    const duringTransition = new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true });
    window.dispatchEvent(duringTransition);
    expect(duringTransition.defaultPrevented).toBe(true);

    await harness.waitForTransition();
    expect(await harness.getRoomIdText()).toEqual('101');
  });

  it('should restore rooms and empty the inventory on start over', async () => {
    const { harness, worldService } = await setup();
    const startingItems = worldService.getRoom(WorldService.STARTING_LOCATION).items;
    startingItems.splice(startingItems.indexOf('hammer'), 1);
    worldService.getInventory().items.push('hammer');

    await harness.navigate(Direction.North);
    await harness.waitForTransition();
    expect(await harness.getText()).not.toContain('Your inventory is empty');

    await harness.startOver();
    await harness.waitForTransition();

    expect(worldService.getInventory().items).toEqual([]);
    expect(worldService.getRoom(WorldService.STARTING_LOCATION).items).toContain('hammer');
    expect(await harness.getRoomIdText()).toEqual(WorldService.STARTING_LOCATION.toString());
    const text = await harness.getText();
    expect(text).toContain('hammer');
    expect(text).toContain('Your inventory is empty');
  });

  it('should keep compass buttons focusable when they have no exit', async () => {
    const { harness } = await setup();
    const west = await harness.getCompassButton(Direction.West);
    expect(await west.getProperty('disabled')).toBe(false);
    expect(await west.getAttribute('aria-disabled')).toBe('true');

    await west.click();
    await harness.waitForTransition();
    expect(await harness.getRoomIdText()).toEqual('100');
  });

  it('should keep buttons focusable but inactive during a transition', async () => {
    const { harness } = await setup();
    const north = await harness.getCompassButton(Direction.North);
    expect(await north.getAttribute('aria-disabled')).toBe('false');

    await north.click();
    expect(await north.getProperty('disabled')).toBe(false);
    expect(await north.getAttribute('aria-disabled')).toBe('true');
    const startOver = await harness.getStartOverButton();
    expect(await startOver.getProperty('disabled')).toBe(false);
    expect(await startOver.getAttribute('aria-disabled')).toBe('true');

    await harness.waitForTransition();
    expect(await harness.getRoomIdText()).toEqual('101');
    expect(await north.getAttribute('aria-disabled')).toBe('false');
    expect(await startOver.getAttribute('aria-disabled')).toBe('false');
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
