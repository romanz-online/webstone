import React from 'react'

const MinionCard = ({ minion, playable = false }) => {
  const defaultMinion = {
    name: 'Ancient Mage',
    attack: 2,
    health: 5,
    mana: 4,
    description: '+1 Spellpower',
    fileName: 'ancient_mage',
  }

  const cardData = { ...defaultMinion, ...minion }

  return (
    <div
      className="card"
      data-minion={JSON.stringify(cardData)}
      style={{ pointerEvents: playable ? 'all' : 'none' }}
    >
      <div className="name">
        <svg viewBox="0 0 100 20">
          <path
            id="curve"
            fill="transparent"
            d="M0,18 C0,18 0,20 25,15 C25,15 50,10 50,10 C50,10 50,10 75,8 C75,8 100,10 100,12"
          />
          <text
            x="52"
            fontSize="8.5"
            fill="#fff"
            stroke="#333"
            strokeWidth="1.8"
            textAnchor="middle"
            paintOrder="stroke fill"
          >
            <textPath href="#curve">{cardData.name}</textPath>
          </text>
        </svg>
      </div>

      <div className="mana">{cardData.mana}</div>
      <div className="attack">{cardData.attack}</div>
      <div className="health">{cardData.health}</div>
      <div className="title"></div>
      <div className="desc">{cardData.description}</div>

      <img
        src={`../media/images/cardimages/${cardData.fileName}.jpg`}
        className="image"
        draggable="false"
        alt={cardData.name}
      />

      <div
        className="card-border"
        style={{ border: `solid 4px ${playable ? '#0FCC00' : '#383838'}` }}
      />
    </div>
  )
}

export default MinionCard

// function App() {
//   const myMinion = {
//     name: "Ancient Mage",
//     attack: 2,
//     health: 5,
//     mana: 4,
//     description: "+1 Spellpower",
//     fileName: "ancient_mage"
//   };

//   return (
//     <div className="hand">
//       <MinionCard minion={myMinion} playable={true} />
//     </div>
//   );
// }
