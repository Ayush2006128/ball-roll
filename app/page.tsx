'use client';

import dynamic from 'next/dynamic';

const GameClient = dynamic(() => import('./game/GameClient'), {
  ssr: false,
  loading: () => (
    <div className="loading-screen">
      <div className="loading-title">BALL ROLL</div>
      <div className="loading-spinner" />
    </div>
  ),
});

export default function Home() {
  return <GameClient />;
}
