// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BasePet {

    struct Player {
        uint256 streak;
        uint256 xp;
        uint256 lastFeed;
    }

    mapping(address => Player)
        public players;

    address[] public playersList;

    mapping(address => bool)
        public hasPlayed;

    error TooEarly();

    event Fed(
        address indexed user,
        uint256 streak,
        uint256 xp,
        uint256 time
    );

    function feed() external {

        Player storage player =
            players[msg.sender];

        if (
            player.lastFeed != 0 &&
            block.timestamp <
            player.lastFeed + 1 days
        ) {
            revert TooEarly();
        }

        if (!hasPlayed[msg.sender]) {

            hasPlayed[msg.sender] = true;

            playersList.push(msg.sender);
        }

        player.streak += 1;

        player.xp += 25;

        player.lastFeed =
            block.timestamp;

        emit Fed(
            msg.sender,
            player.streak,
            player.xp,
            block.timestamp
        );
    }

    function getPlayer(
        address user
    )
        external
        view
        returns (
            uint256 streak,
            uint256 xp,
            uint256 lastFeed
        )
    {
        Player memory player =
            players[user];

        return (
            player.streak,
            player.xp,
            player.lastFeed
        );
    }

    function getPlayers()
        external
        view
        returns (address[] memory)
    {
        return playersList;
    }
}
