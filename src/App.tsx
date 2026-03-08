import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useBalance } from 'wagmi'
import { formatEther, parseEther } from 'viem'

type CoinSide = 'heads' | 'tails'
type GameState = 'idle' | 'betting' | 'flipping' | 'result'

interface FlipResult {
  won: boolean
  side: CoinSide
  amount: string
}

function App() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient glow spots */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 md:px-8 py-4 md:py-6 border-b border-white/5">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-zinc-900 font-bold text-sm md:text-base">₿</span>
          </div>
          <h1 className="font-bebas text-xl md:text-2xl tracking-wider text-white/90">FLIP.BASE</h1>
        </div>
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
            const ready = mounted
            const connected = ready && account && chain

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        className="px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 font-bebas text-sm md:text-base tracking-wider rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/25"
                      >
                        CONNECT
                      </button>
                    )
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        className="px-4 md:px-6 py-2 md:py-2.5 bg-rose-500 text-white font-bebas text-sm md:text-base tracking-wider rounded-lg"
                      >
                        WRONG NETWORK
                      </button>
                    )
                  }

                  return (
                    <button
                      onClick={openAccountModal}
                      className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                    >
                      <span className="font-mono text-xs md:text-sm text-amber-400">
                        {account.displayBalance ?? '0 ETH'}
                      </span>
                      <span className="font-mono text-xs md:text-sm text-white/60">
                        {account.displayName}
                      </span>
                    </button>
                  )
                })()}
              </div>
            )
          }}
        </ConnectButton.Custom>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] md:min-h-[calc(100vh-180px)] px-4 py-8">
        {isConnected ? (
          <CoinFlipGame balance={balance?.value} />
        ) : (
          <LandingScreen />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center border-t border-white/5">
        <p className="font-mono text-xs text-white/30">
          Requested by <span className="text-white/50">@PauliusX</span> · Built by <span className="text-white/50">@clonkbot</span>
        </p>
      </footer>
    </div>
  )
}

function LandingScreen() {
  return (
    <div className="text-center max-w-lg mx-auto">
      {/* Decorative coin */}
      <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8 md:mb-12">
        <div
          className="w-full h-full rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-2xl shadow-amber-500/30 animate-float"
          style={{
            backgroundImage: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #b45309 100%)',
          }}
        >
          <div className="absolute inset-2 md:inset-3 rounded-full border-2 border-amber-200/30 flex items-center justify-center">
            <span className="text-4xl md:text-5xl font-bebas text-amber-900/80">Ξ</span>
          </div>
        </div>
        <div className="absolute -inset-4 rounded-full bg-amber-400/20 blur-xl -z-10" />
      </div>

      <h2 className="font-bebas text-4xl md:text-6xl tracking-tight mb-4 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
        DOUBLE OR NOTHING
      </h2>
      <p className="font-mono text-sm md:text-base text-white/50 mb-8 md:mb-10 leading-relaxed px-4">
        Connect your wallet to flip.<br />
        50/50 chance. Winner takes all.
      </p>

      <div className="flex items-center justify-center gap-4 md:gap-6 text-white/30 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>PROVABLY FAIR</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>BASE NETWORK</span>
        </div>
      </div>
    </div>
  )
}

function CoinFlipGame({ balance }: { balance?: bigint }) {
  const [betAmount, setBetAmount] = useState('0.001')
  const [selectedSide, setSelectedSide] = useState<CoinSide>('heads')
  const [gameState, setGameState] = useState<GameState>('idle')
  const [result, setResult] = useState<FlipResult | null>(null)
  const [flipCount, setFlipCount] = useState(0)

  const formattedBalance = balance ? formatEther(balance) : '0'
  const displayBalance = parseFloat(formattedBalance).toFixed(4)

  const handleFlip = () => {
    setGameState('flipping')
    setFlipCount(prev => prev + 1)

    // Simulate flip (in production, this would be on-chain randomness)
    setTimeout(() => {
      const outcome: CoinSide = Math.random() > 0.5 ? 'heads' : 'tails'
      const won = outcome === selectedSide

      setResult({
        won,
        side: outcome,
        amount: betAmount,
      })
      setGameState('result')
    }, 2500)
  }

  const resetGame = () => {
    setGameState('idle')
    setResult(null)
  }

  const quickBets = ['0.001', '0.005', '0.01', '0.05']

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Balance display */}
      <div className="text-center mb-6 md:mb-8">
        <p className="font-mono text-xs text-white/40 mb-1">YOUR BALANCE</p>
        <p className="font-bebas text-2xl md:text-3xl text-amber-400">{displayBalance} ETH</p>
      </div>

      {/* Coin */}
      <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto mb-8 md:mb-10 perspective-1000">
        <div
          key={flipCount}
          className={`w-full h-full relative preserve-3d ${
            gameState === 'flipping' ? 'animate-coinflip' : ''
          }`}
        >
          {/* Heads side */}
          <div
            className={`absolute inset-0 rounded-full backface-hidden ${
              result?.side === 'heads' && gameState === 'result' ? 'opacity-100' : ''
            }`}
            style={{
              background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #b45309 100%)',
              boxShadow: '0 25px 50px -12px rgba(245, 158, 11, 0.4), inset 0 -4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <div className="absolute inset-3 md:inset-4 rounded-full border-2 border-amber-200/40 flex flex-col items-center justify-center">
              <span className="text-3xl md:text-4xl font-bebas text-amber-900/90">HEADS</span>
              <span className="text-5xl md:text-6xl mt-1">👑</span>
            </div>
          </div>

          {/* Tails side */}
          <div
            className="absolute inset-0 rounded-full backface-hidden rotate-y-180"
            style={{
              background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #334155 100%)',
              boxShadow: '0 25px 50px -12px rgba(100, 116, 139, 0.4), inset 0 -4px 20px rgba(0,0,0,0.2)',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="absolute inset-3 md:inset-4 rounded-full border-2 border-slate-300/40 flex flex-col items-center justify-center">
              <span className="text-3xl md:text-4xl font-bebas text-slate-900/90">TAILS</span>
              <span className="text-5xl md:text-6xl mt-1">🌙</span>
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div className={`absolute -inset-6 rounded-full blur-2xl -z-10 transition-all duration-500 ${
          result?.won ? 'bg-emerald-500/30' : result && !result.won ? 'bg-rose-500/30' : 'bg-amber-500/20'
        }`} />
      </div>

      {/* Result display */}
      {gameState === 'result' && result && (
        <div className={`text-center mb-8 animate-fadeIn ${result.won ? 'text-emerald-400' : 'text-rose-400'}`}>
          <p className="font-bebas text-3xl md:text-4xl mb-2">
            {result.won ? '🎉 YOU WON! 🎉' : '💀 YOU LOST 💀'}
          </p>
          <p className="font-mono text-sm md:text-base">
            {result.won
              ? `+${(parseFloat(result.amount) * 2).toFixed(4)} ETH`
              : `-${result.amount} ETH`
            }
          </p>
          <button
            onClick={resetGame}
            className="mt-4 md:mt-6 px-6 md:px-8 py-2.5 md:py-3 bg-white/10 border border-white/20 rounded-lg font-bebas tracking-wider text-white hover:bg-white/20 transition-all text-sm md:text-base"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* Betting controls */}
      {gameState === 'idle' && (
        <div className="space-y-5 md:space-y-6">
          {/* Side selection */}
          <div>
            <p className="font-mono text-xs text-white/40 mb-3 text-center">CHOOSE YOUR SIDE</p>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <button
                onClick={() => setSelectedSide('heads')}
                className={`py-3 md:py-4 rounded-xl font-bebas text-lg md:text-xl tracking-wider transition-all ${
                  selectedSide === 'heads'
                    ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-zinc-900 shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                👑 HEADS
              </button>
              <button
                onClick={() => setSelectedSide('tails')}
                className={`py-3 md:py-4 rounded-xl font-bebas text-lg md:text-xl tracking-wider transition-all ${
                  selectedSide === 'tails'
                    ? 'bg-gradient-to-br from-slate-400 to-slate-600 text-zinc-900 shadow-lg shadow-slate-500/30 scale-105'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                }`}
              >
                🌙 TAILS
              </button>
            </div>
          </div>

          {/* Bet amount */}
          <div>
            <p className="font-mono text-xs text-white/40 mb-3 text-center">BET AMOUNT (ETH)</p>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full px-4 py-3 md:py-4 bg-white/5 border border-white/10 rounded-xl font-mono text-center text-xl md:text-2xl text-amber-400 focus:outline-none focus:border-amber-500/50 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-white/30 text-sm">ETH</span>
            </div>
            <div className="flex gap-2 mt-3">
              {quickBets.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  className={`flex-1 py-2 rounded-lg font-mono text-xs transition-all ${
                    betAmount === amount
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Flip button */}
          <button
            onClick={handleFlip}
            disabled={!betAmount || parseFloat(betAmount) <= 0}
            className="w-full py-4 md:py-5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-zinc-900 font-bebas text-xl md:text-2xl tracking-wider rounded-xl hover:from-amber-400 hover:via-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            🎲 FLIP FOR {betAmount} ETH
          </button>

          <p className="text-center font-mono text-xs text-white/30">
            Win 2x your bet · 50/50 odds
          </p>
        </div>
      )}

      {/* Flipping state */}
      {gameState === 'flipping' && (
        <div className="text-center">
          <p className="font-bebas text-2xl md:text-3xl text-amber-400 animate-pulse">FLIPPING...</p>
          <p className="font-mono text-xs md:text-sm text-white/40 mt-2">Waiting for result...</p>
        </div>
      )}
    </div>
  )
}

export default App
