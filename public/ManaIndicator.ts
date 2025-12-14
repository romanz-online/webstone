import BaseIndicator from './BaseIndicator.ts'

export default class ManaIndicator extends BaseIndicator {
  protected getIconPath(): string {
    return './media/images/indicators/mana.png'
  }
}