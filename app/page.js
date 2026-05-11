'use client'

import React from 'react'
import { motion } from 'framer-motion'

import {
  createWalletClient,
  custom,
  createPublicClient,
  http
} from 'viem'

import { base } from 'viem/chains'

const CONTRACT_ADDRESS =
  '0x5c13105FD21ae3aD3b6b0F8dBa1a9b12A17a5ACa'

const CONTRACT_ABI = [
  {
    type: 'function',
    name: 'feed',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'getPlayer',
    inputs: [
      {
        name: 'user',
        type: 'address',
        internalType: 'address'
      }
    ],
    outputs: [
      {
        name: 'streak',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'xp',
        type: 'uint256',
        internalType: 'uint256'
      },
      {
        name: 'lastFeed',
        type: 'uint256',
        internalType: 'uint256'
      }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getPlayers',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address[]',
        internalType: 'address[]'
      }
    ],
    stateMutability: 'view'
  }
]

export default function BasePetApp() {

  const publicClient = createPublicClient({
    chain: base,
    transport: http()
  })
  
  const playSound = (src, volume = 0.5) => {

  const audio = new Audio(src)

  audio.volume = volume

  audio.play()
}

  const [walletAddress, setWalletAddress] =
    React.useState('')

  const [currentTime, setCurrentTime] =
    React.useState(Date.now())

  const [leaderboard, setLeaderboard] =
    React.useState([])

  const [playerData, setPlayerData] =
    React.useState({
      streak: 0,
      xp: 0,
      lastFeed: 0
    })

  const [showFeedEffect, setShowFeedEffect] =
    React.useState(false)

  const [showEvolution, setShowEvolution] =
    React.useState(false)

  React.useEffect(() => {

    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(interval)

  }, [])

  React.useEffect(() => {

    const reconnectWallet = async () => {

      if (!window.ethereum) return

      const accounts =
        await window.ethereum.request({
          method: 'eth_accounts'
        })

      if (accounts.length > 0) {

        setWalletAddress(accounts[0])

        await fetchPlayerData(
          accounts[0]
        )

        await fetchLeaderboard()
      }
    }

    reconnectWallet()

  }, [])

  const petStages = [
    {
      name: 'Egg',
      image: '/pets/egg.png',
      text: 'Your BasePet is sleeping...'
    },
    {
      name: 'Baby Blob',
      image: '/pets/blob1.png',
      text: 'Tiny but hungry.'
    },
    {
      name: 'Cyber Pet',
      image: '/pets/blob2.png',
      text: 'Growing stronger every day.'
    },
    {
      name: 'Base Dragon',
      image: '/pets/blob3.png',
      text: 'Legendary streak energy unlocked.'
    }
  ]

  const getPetStage = () => {

    if (playerData.streak >= 30)
      return petStages[3]

    if (playerData.streak >= 14)
      return petStages[2]

    if (playerData.streak >= 3)
      return petStages[1]

    return petStages[0]
  }

  const previousStageRef =
    React.useRef(getPetStage().name)

  const pet = getPetStage()

  React.useEffect(() => {

    const currentStage =
      getPetStage().name

    if (
      previousStageRef.current !== currentStage
    ) {

      setShowEvolution(true)
      playSound('/sounds/evolve.mp3', 0.6)

      setTimeout(() => {
        setShowEvolution(false)
      }, 3000)

      previousStageRef.current =
        currentStage
    }

  }, [playerData.streak])

  const fetchPlayerData = async (
    address
  ) => {

    try {

      const result =
        await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getPlayer',
          args: [address]
        })

      setPlayerData({
        streak: Number(result[0]),
        xp: Number(result[1]),
        lastFeed: Number(result[2])
      })

    } catch (err) {

      console.error(err)
    }
  }

  const fetchLeaderboard = async () => {

    try {

      const players =
        await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getPlayers'
        })

      const leaderboardData = []

      for (const address of players) {

        const result =
          await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getPlayer',
            args: [address]
          })

        leaderboardData.push({
          address,
          streak: Number(result[0]),
          xp: Number(result[1])
        })
      }

      leaderboardData.sort(
        (a, b) => b.xp - a.xp
      )

      setLeaderboard(
        leaderboardData
      )

    } catch (err) {

      console.error(err)
    }
  }

  const connectWallet = async () => {

    try {

      if (!window.ethereum) {
        alert('Install MetaMask')
        return
      }

      const accounts =
        await window.ethereum.request({
          method: 'eth_requestAccounts'
        })

      setWalletAddress(accounts[0])

      await fetchPlayerData(
        accounts[0]
      )

      await fetchLeaderboard()

    } catch (err) {

      console.error(err)

      alert('Wallet connection failed')
    }
  }

  const feedOnchain = async () => {

    try {

      if (!window.ethereum) {
        alert('Install MetaMask')
        return
      }

      const walletClient =
        createWalletClient({
          chain: base,
          transport: custom(window.ethereum)
        })

      const [account] =
        await walletClient.getAddresses()

      const hash =
        await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'feed',
          account,
          
          dataSuffix:
      '0x62635f33677578766a6f7a0b0080218021802180218021802180218021'

        })

      await publicClient.waitForTransactionReceipt({
        hash
      })
      
      playSound('/sounds/feed.mp3', 0.5)

      await fetchPlayerData(
        account
      )

      await fetchLeaderboard()

      setShowFeedEffect(true)

      setTimeout(() => {
        setShowFeedEffect(false)
      }, 1500)

      console.log('TX HASH:', hash)

    } catch (err) {

      console.error(err)

      alert('Transaction failed')
    }
  }

  const canFeed =
    !playerData.lastFeed ||
    (
      Date.now() / 1000 >
      playerData.lastFeed + 86400
    )

  const getRemainingTime = () => {

    if (!playerData.lastFeed)
      return 'Ready now'

    const remaining =
      (playerData.lastFeed + 86400) -
      Math.floor(currentTime / 1000)

    if (remaining <= 0)
      return 'Ready now'

    const hours =
      Math.floor(remaining / 3600)

    const minutes =
      Math.floor(
        (remaining % 3600) / 60
      )

    const seconds =
      remaining % 60

    return (
      `${hours}h ${minutes}m ${seconds}s`
    )
  }

  const resetGame = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 overflow-hidden relative">

      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">

        <div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">

            <div className="flex items-center justify-between mb-8">

              <div>

                <h1 className="text-3xl font-bold tracking-tight">
                  BasePet
                </h1>

                <p className="text-zinc-400 text-sm mt-1">
                  Feed daily. Protect your streak.
                </p>

                {walletAddress && (
                  <div className="text-xs text-green-400 mt-3 break-all">
                    {walletAddress.slice(0,6)}...
                    {walletAddress.slice(-4)}
                  </div>
                )}

              </div>

              <div className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-2xl text-sm border border-blue-500/20">
                ⚡ {playerData.xp} XP
              </div>

            </div>

            <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-3xl p-8 border border-zinc-700 text-center relative overflow-hidden">

              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.5),transparent_70%)]" />

              <div className="relative z-10">

                {showEvolution && (
                  <motion.img
                    src={pet.image}
                    alt={pet.name}
                    animate={{
                      scale: showFeedEffect
                        ? [1, 1.08, 1]
                        : [1, 1.02, 1],
                        y: [0, -8, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity
                    }}
                    className="w-40 h-40 sm:w-52 sm:h-52 mx-auto object-contain mb-4 drop-shadow-[0_0_35px_rgba(59,130,246,0.45)]"
                  />
                )}

                <motion.div
                  animate={{
                    scale: showFeedEffect
                      ? [1, 1.25, 1]
                      : 1,
                    rotate: showFeedEffect
                      ? [0, -10, 10, 0]
                      : 0
                  }}
                  transition={{
                    duration: 0.6
                  }}
                  className="text-8xl mb-4"
                >
                  <img
                    src={pet.image}
                    className="w-36 h-36 object-contain"
                  />
                </motion.div>

                <h2 className="text-2xl font-semibold mb-2">
                  {pet.name}
                </h2>

                <p className="text-zinc-400 text-sm mb-6">
                  {pet.text}
                </p>

                <div className="flex gap-3 mb-4">

                  {!walletAddress ? (

                    <button
                      onClick={() => {

                        playSound('/sounds/click.mp3', 0.3)

                        connectWallet()
                      }}
                      className="flex-1 bg-white text-black py-3 rounded-2xl font-semibold"
                    >
                      Connect Wallet
                    </button>

                  ) : (

                    <button
                      onClick={() => {

                        playSound('/sounds/click.mp3', 0.3)

                        feedOnchain()
                      }}

                      disabled={!canFeed}
                      className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${
                        canFeed
                          ? 'bg-purple-500 hover:bg-purple-400'
                          : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                      }`}
                    >
                      {canFeed
                        ? 'Feed Onchain'
                        : 'Already Fed'}
                    </button>

                  )}

                </div>

                <div className="text-xs text-blue-400 mb-6">
                  Next Feed In:
                  {' '}
                  {getRemainingTime()}
                </div>

                <div className="flex items-center justify-center gap-4 mb-6">
                <div className="mb-6">

  <div className="flex justify-between text-xs text-zinc-400 mb-2">
    <span>
      Level Progress
    </span>

    <span>
      {playerData.xp % 100}/100 XP
    </span>
  </div>

  <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">

    <motion.div
      initial={{
        width: 0
      }}
      animate={{
        width: `${
          playerData.xp % 100
        }%`
      }}
      transition={{
        duration: 0.6
      }}
      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
    />

  </div>

</div>
                  <div className="bg-zinc-800 px-5 py-3 rounded-2xl border border-zinc-700">

                    <div className="text-xs text-zinc-500 mb-1">
                      STREAK
                    </div>

                    <div className="text-2xl font-bold">
                      {playerData.streak} 🔥
                    </div>

                  </div>

                  <div className="bg-zinc-800 px-5 py-3 rounded-2xl border border-zinc-700">

                    <div className="text-xs text-zinc-500 mb-1">
                      LEVEL
                    </div>

                    <div className="text-2xl font-bold">
                      {Math.floor(
                        playerData.xp / 100
                      ) + 1}
                    </div>

                  </div>

                </div>

                <button
                  onClick={resetGame}
                  className="w-full mt-4 py-3 rounded-2xl bg-red-500/20 border border-red-500/20 hover:bg-red-500/30 transition-all text-sm text-red-300"
                >
                  Refresh Game
                </button>

              </div>

            </div>

          </div>

        </div>

        <div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">

            <h2 className="text-2xl font-bold mb-6">
              Leaderboard 🏆
            </h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">

              {leaderboard.map(
                (player, index) => (

                  <div
                    key={player.address}
                    className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 flex items-center justify-between"
                  >

                    <div>

                      <div className="font-semibold">
                        #{index + 1}
                      </div>

                      <div className="text-xs text-zinc-400 break-all mt-1">
                        {player.address}
                      </div>

                    </div>

                    <div className="text-right">

                      <div className="font-bold text-lg">
                        ⚡ {player.xp}
                      </div>

                      <div className="text-sm text-orange-400">
                        🔥 {player.streak}
                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
