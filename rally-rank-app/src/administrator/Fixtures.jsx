
import React from 'react';
import "../brackets.css"

const Fixtures = () => {
  return (
    <div className="bracket flex justify-between mb-24 overflow-visible w-full">
      <h1 className="text-center text-2xl font-bold mb-8">Tournament Bracket</h1>

      <section aria-labelledby="round-1" className="max-w-xs min-w-[100px] px-5 w-[17%]">
        <h2 id="round-1" className="text-lg font-semibold">Round 1</h2>
        <ol className="flex flex-wrap m-0 min-h-full p-0">
          {[
            { players: ['Player 1', 'Player 2'], date: '01.01. 1pm' },
            { players: ['Player 3', 'Player 4'], date: '01.01. 1.30pm' },
            { players: ['Player 5', 'Player 6'], date: '01.01. 2pm' },
            { players: ['Player 7', 'Player 8'], date: '01.01. 2.30pm' },
            { players: ['Player 9', 'Player 10'], date: '01.01. 3pm' },
            { players: ['Player 11', 'Player 12'], date: '01.01. 3.30pm' },
            { players: ['Player 13', 'Player 14'], date: '01.01. 4pm' },
            { players: ['Player 15', 'Player 16'], date: '01.01. 4.30pm' },
          ].map((match, index) => (
            <li key={index} className="flex flex-col justify-center my-5 relative w-full bracket-item">
              <div className="border border-black">
                <a href="#" className="block">{match.players[0]}</a>
                <a href="#" className="block">{match.players[1]}</a>
                <span className="block">{match.date}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Repeat similar structure for other rounds */}

      <section aria-labelledby="round-2" className="max-w-xs min-w-[100px] px-5 w-[17%]">
        <h2 id="round-2" className="text-lg font-semibold">Round 2</h2>
        <ol className="flex flex-wrap m-0 min-h-full p-0">
          {[
            { players: ['Player 1', 'Player 3'], date: '05.01. 1pm' },
            { players: ['Player 5', 'Player 7'], date: '05.01. 1.30pm' },
            { players: ['Player 9', 'Player 11'], date: '05.01. 2pm' },
            { players: ['Player 13', 'Player 15'], date: '05.01. 2.30pm' },
          ].map((match, index) => (
            <li key={index} className="flex flex-col justify-center my-5 relative w-full bracket-item">
              <div className="border border-black">
                <a href="#" className="block">{match.players[0]}</a>
                <a href="#" className="block">{match.players[1]}</a>
                <span className="block">{match.date}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="round-3" className="max-w-xs min-w-[100px] px-5 w-[17%]">
        <h2 id="round-3" className="text-lg font-semibold">Round 3</h2>
        <ol className="flex flex-wrap m-0 min-h-full p-0">
          {[
            { players: ['Player 1', 'Player 5'], date: '07.01. 1pm' },
            { players: ['Player 9', 'Player 13'], date: '07.01. 1.30pm' },
          ].map((match, index) => (
            <li key={index} className="flex flex-col justify-center my-5 relative w-full bracket-item">
              <div className="border border-black">
                <a href="#" className="block">{match.players[0]}</a>
                <a href="#" className="block">{match.players[1]}</a>
                <span className="block">{match.date}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="round-4" className="max-w-xs min-w-[100px] px-5 w-[17%]">
        <h2 id="round-4" className="text-lg font-semibold">Round 4</h2>
        <ol className="flex flex-wrap m-0 min-h-full p-0">
          <li className="flex flex-col justify-center my-5 relative w-full bracket-item">
            <div className="border border-black">
              <a href="#" className="block">Player 1</a>
              <a href="#" className="block">Player 9</a>
              <span className="block">Date: 10.01. 1pm</span>
            </div>
          </li>
        </ol>
      </section>

      <section aria-labelledby="winner" className="max-w-xs min-w-[100px] px-5 w-[17%]">
        <h2 id="winner" className="text-lg font-semibold">Winner</h2>
        <ol className="flex flex-wrap m-0 min-h-full p-0">
          <li className="flex flex-col justify-center my-5 relative w-full bracket-item">
            <div className="border border-black">
              <a href="#" className="block">Player 1</a>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
};

export default Fixtures;