import { TestBed } from '@angular/core/testing';
import { InventoryComponent } from './inventory.component';
import { InventoryComponentHarness } from './inventory.component.harness';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

describe('InventoryComponent', () => {
  let harness: InventoryComponentHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(InventoryComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      InventoryComponentHarness
    );
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(InventoryComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render inventory', async () => {
    expect(await harness.isPresent()).toBe(true);
  });
});