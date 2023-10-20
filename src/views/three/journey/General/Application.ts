export class Application {
  $canvas?: HTMLCanvasElement

  constructor(_options: { $canvas: HTMLCanvasElement }) {
    this.$canvas = _options.$canvas
  }
}
