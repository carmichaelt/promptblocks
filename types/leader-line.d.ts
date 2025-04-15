declare module 'leader-line' {
  interface LeaderLineOptions {
    color?: string
    size?: number
    path?: 'straight' | 'arc' | 'fluid' | 'magnet' | 'grid'
    startSocket?: 'top' | 'right' | 'bottom' | 'left' | string
    endSocket?: 'top' | 'right' | 'bottom' | 'left' | string
    startPlug?: 'behind' | 'disc' | 'square' | 'arrow1' | 'arrow2' | 'arrow3' | 'hand'
    endPlug?: 'behind' | 'disc' | 'square' | 'arrow1' | 'arrow2' | 'arrow3' | 'hand'
    gradient?: boolean
    dash?: boolean | { animation: boolean }
  }

  class LeaderLine {
    constructor(start: Element, end: Element, options?: LeaderLineOptions)
    position(): void
    remove(): void
  }

  export default LeaderLine
} 