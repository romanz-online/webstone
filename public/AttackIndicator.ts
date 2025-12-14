import BaseIndicator from './BaseIndicator.ts'

export default class AttackIndicator extends BaseIndicator {
  protected getIconPath(): string {
    return './media/images/indicators/attack.png'
  }
}
