import React, { useRef, useEffect, useState } from 'react';
import "../brackets.css"

const rounds = [
  {
    matches: [
      { players: ['Player 1', 'Player 2'], date: '01.01. 1pm' },
      { players: ['Player 3', 'Player 4'], date: '01.01. 1.30pm' },
      { players: ['Player 5', 'Player 6'], date: '01.01. 2pm' },
      { players: ['Player 7', 'Player 8'], date: '01.01. 2.30pm' },
      { players: ['Player 9', 'Player 10'], date: '01.01. 3pm' },
      { players: ['Player 11', 'Player 12'], date: '01.01. 3.30pm' },
      { players: ['Player 13', 'Player 14'], date: '01.01. 4pm' },
      { players: ['Player 15', 'Player 16'], date: '01.01. 4.30pm' },
    ]
  },
  {
    matches: [
      { players: ['Player 1', 'Player 3'], date: '05.01. 1pm' },
      { players: ['Player 5', 'Player 7'], date: '05.01. 1.30pm' },
      { players: ['Player 9', 'Player 11'], date: '05.01. 2pm' },
      { players: ['Player 13', 'Player 15'], date: '05.01. 2.30pm' },
    ]
  },
  {
    matches: [
      { players: ['Player 1', 'Player 5'], date: '07.01. 1pm' },
      { players: ['Player 9', 'Player 13'], date: '07.01. 1.30pm' },
    ]
  },
  {
    matches: [
      { players: ['Player 1', 'Player 9'], date: '10.01. 1pm' },
    ]
  }
];

const Player = ({ player, position }) => {
  return (
    <>
      <a href="#" className={`block border-black ${position % 2 === 0 ? 'border-t mb-5' : 'border-b mt-5'}`}>{player}</a>
    </>
  );
};

const Match = ({ players, date, height }) => {
  return (
    <li className="match flex flex-col justify-between my-5 relative w-full bracket-item" style={{height: height}}>
      <div className="flex flex-col justify-between h-full bracket-item">
        <Player player={players[0]} position={0} />
        <span className="block">{date}</span>
        <Player player={players[1]} position={1} />
      </div>
    </li>
  );
};

const Round = ({ title, matches, matchCount, isFirstRound }) => {
  const roundRef = useRef(null);
  const [roundHeight, setRoundHeight] = useState(0);

  useEffect(() => {
    if (roundRef.current && isFirstRound) {
      setRoundHeight(roundRef.current.clientHeight);
      console.log(roundRef.current.clientHeight); 
    }
  }, []);

  const height = roundHeight / matchCount;

  return (
    <section ref={roundRef} aria-labelledby={title.toLowerCase().replace(' ', '-')} className="max-w-xs min-w-[100px] px-5 w-[17%]">
      <h2 id={title.toLowerCase().replace(' ', '-')} className="text-lg font-semibold">{title}</h2>
      <ol className="round flex flex-col m-0 min-h-full p-0 justify-around">
        {matches.map((match, index) => (
          <Match key={index} players={match.players} date={match.date} height={height}/>
        ))}
      </ol>
    </section>
  );
};


const Fixtures = () => {

  return (
    <div className="bracket flex flex-col justify-between mb-24 overflow-x-auto overflow-y-auto w-full">
      <h1 className="text-center text-2xl font-bold m-8">Tournament Bracket</h1>
      <div className="flex justify-center">
        {rounds.map((round, index) => (
            <Round key={index} title={"Round " + (index + 1)} matches={round.matches} matchCount={round.matches.length / (index + 1)}  isFirstRound={index === 0}/>
        ))}
      </div>
    </div>
  );
};

export default Fixtures;