import GAME from '../../game.js'

// maybe convert this into TargetController or something which handles all targeting (attacks, spells, hero powers, etc.)
export class TargetController {
  constructor() {
    // HTML dom element, not view or object
    // use .dataSet.boardIndex or id to distinguish
    this.attackerCard = null
    this.dragOrigin = { x: 0, y: 0 }

    $('#board--player').on('mousedown', (e) => this.onMouseDown(e))

    $('body').on('mouseup', (e) => this.onMouseUp(e))

    // TODO: maybe need to move the code below elsewhere
    // it will also be used for spells and hero powers
    $(document).on('mousemove', (e) => {
      $('#outercursor, #innercursor, #arrowcursor').css({
        left: `${e.pageX}px`,
        top: `${e.pageY}px`,
      })
    })
  }

  startTargetting(origin) {
    this.dragOrigin = origin

    $('#svg').show()

    $('#innercursor, #outercursor, #arrowcursor').css({
      visibility: 'visible',
    })

    $('body').css({ cursor: 'none' })

    $('body').on('mousemove', (e) => this.onMouseDrag(e))

    this.onMouseDrag({ clientX: origin.x, clientY: origin.y }) // updates the svg once to set its origin correctly
  }

  onMouseDown(event) {
    event.preventDefault()
    if (event.target.classList.contains('cardInPlay--player')) {
      if (!JSON.parse(event.target.dataset.minion).canAttack) {
        alert('minion already attacked this turn!')
        return
      }

      this.attackerCard = event.target

      const rect = this.attackerCard.getBoundingClientRect()
      this.startTargetting({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    } else if (true /* click on hero portrait */) {
      // do hero attack
    }
  }

  onMouseDrag(event) {
    $('#arrowcursor').css(
      'transform',
      `rotate(${(Math.atan2(event.clientY - this.dragOrigin.y, event.clientX - this.dragOrigin.x) * 180) / Math.PI + 90}deg) translate(-50%,-110%)`
    )

    $('#svgpath').attr(
      'd',
      `M${event.clientX},${event.clientY} ${this.dragOrigin.x},${this.dragOrigin.y}`
    )
  }

  onMouseUp(event) {
    event.preventDefault()

    $('body').off('mousemove', this.onMouseDrag)
    this.dragOrigin = { x: 0, y: 0 }

    if (!this.attackerCard) {
      return
    }

    if (event.target.classList.contains('cardInPlay--opponent')) {
      const attackerJSON = JSON.parse(this.attackerCard.dataset.minion),
        targetJSON = JSON.parse(event.target.dataset.minion)
      console.log(attackerJSON.minionID, targetJSON.minionID)
      GAME.triggerEvent('tryAttack', {
        attackerID: attackerJSON.minionID,
        targetID: targetJSON.minionID,
      })
    } else if (event.target.id == 'opponentHero') {
      GAME.triggerEvent('tryAttack', {
        attackerID: attackerJSON.minionID,
        targetID: -2, // TODO: make a list of shared enums between server and client for stuff like this
      })
    }

    this.resetAttack()
  }

  resetAttack() {
    this.attackerCard = null

    $('#svg').hide()

    $('#innercursor, #outercursor, #arrowcursor').css({ visibility: 'hidden' })

    document.body.style.cursor =
      'url(../media/images/cursor/cursor.png) 10 2, auto'
  }
}
