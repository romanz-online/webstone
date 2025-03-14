import { HandCard } from './Card.ts'

let draggedObj: HandCard | null = null

export function getDraggedObj(): HandCard | null {
  return draggedObj
}

export function setDraggedObj(obj: HandCard | null): void {
  draggedObj = obj
}

export function clearDraggedObj(): void {
  draggedObj = null
}
