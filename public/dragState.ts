import { Minion } from './Minion.ts'

let draggedObj: Minion | null = null

export function getDraggedObj(): Minion | null {
  return draggedObj
}

export function setDraggedObj(obj: Minion | null): void {
  draggedObj = obj
}

export function clearDraggedObj(): void {
  draggedObj = null
}
