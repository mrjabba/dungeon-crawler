import { ComponentHarness, HarnessPredicate, TestElement } from '@angular/cdk/testing';
import { Direction } from '../world';

export class RoomDecoratorComponentHarness extends ComponentHarness {
  static hostSelector = 'room-decorator';

  async getRoomIdText(): Promise<string> {
    return (await this.locatorFor('#currentRoomId')()).text();
  }

  async getBackgroundImage(): Promise<string> {
    const background = await this.locatorFor('.background')();
    const style = await background.getAttribute('style');
    return style || '';
  }

  async navigate(direction: Direction): Promise<void> {
    const button = await this.locatorFor(`.exit-${direction.toLowerCase()}`)();
    return button.click();
  }

  async startOver(): Promise<void> {
    return (await this.locatorFor('.startover-btn')()).click();
  }

  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  async waitForTransition(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));
  }
}