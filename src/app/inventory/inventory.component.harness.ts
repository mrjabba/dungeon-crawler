import { ComponentHarness } from '@angular/cdk/testing';

export class InventoryComponentHarness extends ComponentHarness {
  static hostSelector = 'app-inventory';

  async isPresent(): Promise<boolean> {
    return await this.locatorForOptional('.inventory-grid')() !== null;
  }
}