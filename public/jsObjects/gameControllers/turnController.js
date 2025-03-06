import GAME from '../../../game.js'
import { EventType } from '../constants.js'

export class TurnController {
  constructor() {
    this.playersTurn = false
    this.playerTurnSound = new Audio('../../media/sounds/playerturn.mp3')
    this.endTurnSound = new Audio('../media/sounds/endturn.mp3')

    document.getElementById('endturn').addEventListener('click', () => {
      this.endTurnSound.play()
      GAME.triggerEvent(EventType.EndTurn)
    })
  }

  startPlayerTurn() {
    this.playersTurn = true

    this.playerTurnSound.play()

    GAME.playerManaView.newTurn()

    document.body.style.cursor =
      'url(../media/images/cursor/cursor.png) 10 2, auto'

    $('#playerHeropower').addClass('canAttack')

    $('#computerTurn').hide()

    $('#endturn').css({ 'background-color': '#4ce322' }).html('END TURN')

    GAME.cardDrawController.playerDrawCard()
  }

  startOpponentTurn() {
    this.playersTurn = false

    document.getElementById('endturn').style.zIndex = '50'
    // document.getElementById("gifhint").style.backgroundImage = "url('../media/hints/attack.gif')";
    // document.getElementById("texthint").innerText = "Click on a green glowing allied card then click on an enemy to attack.";

    GAME.playerHandView.setAllCardsUnplayable()

    document.body.style.cursor =
      'url(../media/images/cursor/spectate.png) 10 2, auto'

    $('#computerTurn').show()

    $('#endturn').css({ 'background-color': 'grey' }).html('ENEMY TURN')
  }
}
