import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { WorldService } from './world.service';
import { AppComponentHarness } from './app.component.harness';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

describe('AppComponent', () => {
  let harness: AppComponentHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      AppComponentHarness
    );
  });

  it('should have a starting location', async () => {
    const worldService = TestBed.inject(WorldService);
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.startingRoomId).toEqual(WorldService.STARTING_LOCATION);
  });

  it('should include a room decorator', async () => {
    expect(await harness.hasRoomDecorator()).toBe(true);
  });
});