import GAME from '../../game.js'

// maybe convert this into TargetController or something which handles all targeting (attacks, spells, hero powers, etc.)
export class AttackController {
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

  onMouseDown(event) {
    event.preventDefault()
    if (event.target.classList.contains('cardInPlay--player')) {
      this.attackerCard = event.target

      const rect = this.attackerCard.getBoundingClientRect()
      this.dragOrigin = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      }

      $('#svg').show()

      $('#innercursor, #outercursor, #arrowcursor').css({
        visibility: 'visible',
      })

      $('body').css({ cursor: 'none' })

      $('body').on('mousemove', (e) => this.onMouseDrag(e))

      this.onMouseDrag(event) // updates the svg to set its origin correctly
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
      console.log(
        this.attackerCard.dataset.minionid,
        event.target.dataset.minionid
      )
      GAME.triggerEvent('tryAttack', {
        attackerID: this.attackerCard.dataset.minionid,
        targetID: event.target.dataset.minionid,
      })
    } else if (event.target.id == 'opponentHero') {
      GAME.triggerEvent('tryAttack', {
        attackerID: this.attackerCard.dataset.minionid,
        targetID: 102, // TODO: make a list of shared enums between server and client for stuff like this
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
