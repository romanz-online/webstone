import MinionCardView from './MinionCardView.ts'

let draggedObj: MinionCardView | null = null

class CardDragStateClass {
  getDraggedCard(): MinionCardView | null {
    return draggedObj
  }

  setDraggedCard(obj: MinionCardView | null): void {
    draggedObj = obj
  }

  clearDraggedCard(): void {
    draggedObj = null
  }
}

const CardDragState = new CardDragStateClass()
export default CardDragState
