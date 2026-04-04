import { ComponentHarness } from '@angular/cdk/testing';

export class AppComponentHarness extends ComponentHarness {
  static hostSelector = 'app-root';

  async hasRoomDecorator(): Promise<boolean> {
    return await this.locatorForOptional('room-decorator')() !== null;
  }
}