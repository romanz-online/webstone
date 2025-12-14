import * as THREE from 'three'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js'
import { DragEvent, Draggable, DropZone } from './Draggable.ts'

export enum InteractionState {
  IDLE,
  DRAGGING_CARD,
  TARGETING_MINION,
}

export default class InteractionManager extends EventTarget {
  private state = InteractionState.IDLE
  private draggedObject: Draggable | null = null
  private dragControls: DragControls
  private dropZones: DropZone[] = []

  constructor(camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    super()
    this.dragControls = new DragControls([], camera, renderer.domElement)
    this.setupDragEventListeners()
  }

  public addDraggableObject(object: THREE.Object3D): void {
    if (this.dragControls.objects.indexOf(object) === -1) {
      this.dragControls.objects.push(object)
    }
  }

  public removeDraggableObject(object: THREE.Object3D): void {
    const objects = this.dragControls.objects
    const index = objects.indexOf(object)
    if (index !== -1) {
      objects.splice(index, 1)
    }
  }

  public addDropZone(dropZone: DropZone): void {
    this.dropZones.push(dropZone)
  }

  public removeDropZone(dropZone: DropZone): void {
    const index = this.dropZones.indexOf(dropZone)
    if (index !== -1) {
      this.dropZones.splice(index, 1)
    }
  }

  public setState(newState: InteractionState): void {
    this.state = newState
    this.dispatchEvent(new CustomEvent('statechange', { detail: newState }))
  }

  public getState(): InteractionState {
    return this.state
  }

  private setupDragEventListeners(): void {
    this.dragControls.addEventListener('dragstart', (event) => {
      const dragEvent = this.createDragEvent(event)
      const draggable = this.getDraggableFromObject(event.object)

      if (draggable && draggable.isDraggable()) {
        this.draggedObject = draggable
        this.setState(InteractionState.DRAGGING_CARD)
        draggable.onDragStart(dragEvent)

        this.dispatchEvent(new CustomEvent('dragstart', { detail: dragEvent }))
      }
    })

    this.dragControls.addEventListener('drag', (event) => {
      if (this.draggedObject) {
        const dragEvent = this.createDragEvent(event)
        this.draggedObject.onDrag(dragEvent)

        // Update drop zone feedback
        this.updateDropZoneFeedback(dragEvent)

        this.dispatchEvent(new CustomEvent('drag', { detail: dragEvent }))
      }
    })

    this.dragControls.addEventListener('dragend', (event) => {
      if (this.draggedObject) {
        const dragEvent = this.createDragEvent(event)

        // Check for valid drop zones
        const validDropZone = this.findValidDropZone(
          this.draggedObject,
          dragEvent
        )

        if (validDropZone) {
          validDropZone.onDrop(this.draggedObject, dragEvent)
        }

        this.draggedObject.onDragEnd(dragEvent)

        this.dispatchEvent(new CustomEvent('dragend', { detail: dragEvent }))

        this.draggedObject = null
        this.setState(InteractionState.IDLE)
      }
    })
  }

  private createDragEvent(event: any): DragEvent {
    return {
      object: event.object,
      point: event.point || new THREE.Vector3(),
      intersections: event.intersections || [],
    }
  }

  private getDraggableFromObject(object: THREE.Object3D): Draggable | null {
    if (
      object.userData &&
      object.userData.owner &&
      'onDragStart' in object.userData.owner
    ) {
      return object.userData.owner as Draggable
    }
    return null
  }

  private updateDropZoneFeedback(dragEvent: DragEvent): void {
    if (!this.draggedObject) return

    for (const dropZone of this.dropZones) {
      if (dropZone.canAcceptDrop(this.draggedObject)) {
        if (this.isObjectInDropZone(dragEvent.object, dropZone)) {
          // Visual feedback for valid drop zone
          this.dispatchEvent(
            new CustomEvent('hoverdropzone', {
              detail: { dropZone, dragEvent, draggable: this.draggedObject },
            })
          )
        } else {
          // Clear feedback when no longer hovering
          this.dispatchEvent(
            new CustomEvent('leavedropzone', {
              detail: { dropZone, dragEvent, draggable: this.draggedObject },
            })
          )
        }
      }
    }
  }

  private findValidDropZone(
    draggable: Draggable,
    dragEvent: DragEvent
  ): DropZone | null {
    for (const dropZone of this.dropZones) {
      if (
        dropZone.canAcceptDrop(draggable) &&
        this.isObjectInDropZone(dragEvent.object, dropZone)
      ) {
        return dropZone
      }
    }
    return null
  }

  private isObjectInDropZone(
    object: THREE.Object3D,
    dropZone: DropZone
  ): boolean {
    const objectBounds = new THREE.Box3().setFromObject(object)
    const dropZoneBounds = dropZone.getBoundingInfo()

    return objectBounds.intersectsBox(
      new THREE.Box3(dropZoneBounds.min, dropZoneBounds.max)
    )
  }

  public dispose(): void {
    this.dragControls.dispose()
    this.dropZones = []
    this.draggedObject = null
  }
}
