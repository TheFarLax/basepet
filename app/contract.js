export const CONTRACT_ADDRESS =
  '0xe9738Fc245B23956b8eC4cE6841B977349E70708'

export const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "feed",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "lastFeed",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  }
]
