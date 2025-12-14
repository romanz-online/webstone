import * as THREE from 'three'

export interface DragEvent {
  object: THREE.Object3D
  point: THREE.Vector3
  intersections: THREE.Intersection[]
}

export interface Draggable {
  onDragStart(event: DragEvent): void
  onDrag(event: DragEvent): void
  onDragEnd(event: DragEvent): void
  isDraggable(): boolean
}

export interface DropZone {
  canAcceptDrop(draggable: Draggable): boolean
  onDrop(draggable: Draggable, event: DragEvent): void
  getBoundingInfo(): { min: THREE.Vector3; max: THREE.Vector3 }
}