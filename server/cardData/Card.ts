class Card {
  id: number

  constructor(id: number) {
    this.id = id
  }

  toJSON(): any {
    return {}
  }

  toString(): string {
    return `${this.id}`
  }
}

export default Card
