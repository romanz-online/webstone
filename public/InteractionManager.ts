import * as THREE from 'three'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js'
import {
  DragEvent,
  Draggable,
  DropZone,
  HoverEvent,
  Hoverable,
} from './InteractionInterfaces.ts'

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
  private lastHoveredDropZone: DropZone | null = null
  private hoverableObjects: THREE.Object3D[] = []
  private lastHoveredObject: THREE.Object3D | null = null
  private hoverable: Hoverable | null = null

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

  public addHoverableObject(object: THREE.Object3D): void {
    if (!this.hoverableObjects.includes(object)) {
      this.hoverableObjects.push(object)
    }
  }

  public removeHoverableObject(object: THREE.Object3D): void {
    const index = this.hoverableObjects.indexOf(object)
    if (index !== -1) {
      this.hoverableObjects.splice(index, 1)
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

        // Clean up state
        this.draggedObject = null
        this.lastHoveredDropZone = null
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

    // Get world position of dragged object for accurate positioning
    const worldPosition = new THREE.Vector3()
    dragEvent.object.getWorldPosition(worldPosition)

    let currentHoveredDropZone: DropZone | null = null

    // Find the currently hovered drop zone
    for (const dropZone of this.dropZones) {
      if (dropZone.canAcceptDrop(this.draggedObject)) {
        const isInDropZone = this.isObjectInDropZone(dragEvent.object, dropZone)

        if (isInDropZone) {
          currentHoveredDropZone = dropZone
          break
        }
      }
    }

    // Only dispatch events if the hovered drop zone has actually changed
    if (currentHoveredDropZone !== this.lastHoveredDropZone) {
      // Dispatch leave event for previously hovered drop zone
      if (this.lastHoveredDropZone) {
        this.dispatchEvent(
          new CustomEvent('leavedropzone', {
            detail: {
              dropZone: this.lastHoveredDropZone,
              dragEvent,
              draggable: this.draggedObject,
              worldPosition: worldPosition.clone(),
            },
          })
        )
      }

      // Dispatch hover event for newly hovered drop zone
      if (currentHoveredDropZone) {
        this.dispatchEvent(
          new CustomEvent('hoverdropzone', {
            detail: {
              dropZone: currentHoveredDropZone,
              dragEvent,
              draggable: this.draggedObject,
              worldPosition: worldPosition.clone(),
            },
          })
        )
      }

      this.lastHoveredDropZone = currentHoveredDropZone
    } else if (currentHoveredDropZone) {
      // Still hovering the same drop zone, send continuous position updates
      this.dispatchEvent(
        new CustomEvent('hoverdropzone', {
          detail: {
            dropZone: currentHoveredDropZone,
            dragEvent,
            draggable: this.draggedObject,
            worldPosition: worldPosition.clone(),
          },
        })
      )
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

    return (
      objectBounds.min.x < dropZoneBounds.max.x &&
      objectBounds.max.x > dropZoneBounds.min.x &&
      objectBounds.min.y < dropZoneBounds.max.y &&
      objectBounds.max.y > dropZoneBounds.min.y
    )
  }

  private checkHoverables(intersections: THREE.Intersection[]): void {
    let currentHoveredObject: THREE.Object3D | null = null

    // Find the first hoverable object in intersections
    for (const intersection of intersections) {
      if (this.hoverableObjects.includes(intersection.object)) {
        currentHoveredObject = intersection.object
        break
      }

      // Also check userData.owner pattern (like MinionCard)
      if (intersection.object.userData?.owner) {
        const owner = intersection.object.userData.owner
        if ('isHoverable' in owner && owner.isHoverable()) {
          currentHoveredObject = intersection.object
          break
        }
      }
    }

    // Handle hover state changes
    if (currentHoveredObject !== this.lastHoveredObject) {
      // End hover on previously hovered object
      if (this.lastHoveredObject && this.hoverable) {
        const hoverEvent: HoverEvent = {
          object: this.lastHoveredObject,
          hoverable: this.hoverable,
        }
        this.hoverable.onHoverEnd(hoverEvent)

        this.dispatchEvent(
          new CustomEvent('hoverend', {
            detail: { hoverable: this.hoverable, object: this.lastHoveredObject },
          })
        )
      }

      // Start hover on newly hovered object
      if (currentHoveredObject) {
        const owner = currentHoveredObject.userData?.owner
        if (owner && 'isHoverable' in owner && owner.isHoverable()) {
          this.hoverable = owner as Hoverable
          const hoverEvent: HoverEvent = {
            object: currentHoveredObject,
            hoverable: this.hoverable,
          }
          this.hoverable.onHoverStart(hoverEvent)

          this.dispatchEvent(
            new CustomEvent('hoverstart', {
              detail: {
                hoverable: this.hoverable,
                object: currentHoveredObject,
              },
            })
          )
        }
      } else {
        this.hoverable = null
      }

      this.lastHoveredObject = currentHoveredObject
    }
  }

  public updateHoverState(intersections: THREE.Intersection[]): void {
    // Only check hovers when not dragging
    if (this.state === InteractionState.IDLE) {
      this.checkHoverables(intersections)
    }
  }

  public dispose(): void {
    this.dragControls.dispose()
    this.dropZones = []
    this.draggedObject = null
    this.hoverableObjects = []
    this.lastHoveredObject = null
    this.hoverable = null
  }
}
