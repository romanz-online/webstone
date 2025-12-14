import BaseIndicator from './BaseIndicator.ts'

export default class HealthIndicator extends BaseIndicator {
  protected getIconPath(): string {
    return './media/images/indicators/health.png'
  }
}