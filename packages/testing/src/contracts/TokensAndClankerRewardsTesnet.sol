// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract HackathonToken is ERC20, ERC20Burnable {
    constructor() ERC20("Hackathon Token", "hackathonT") {}

    // Override _decimals to set the number of decimal places
    function decimals() public pure override returns (uint8) {
        return 18; // 18 decimal places
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract WETHToken is ERC20, ERC20Burnable {
    constructor() ERC20("Wrapped Ether Token", "wethT") {}

    // Override _decimals to set the number of decimal places
    function decimals() public pure override returns (uint8) {
        return 18; // 18 decimal places
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract RewardsContract {
    HackathonToken public hackathonT;
    WETHToken public wethT;

    address walletAgentRecipient = 0x6b27A87290AF5fbaE5DAa95cD1AB253CcB3a7Cf9;

    event ClaimedRewards(
        address indexed claimer,
        address indexed token0,
        address indexed token1,
        uint256 amount0,
        uint256 amount1,
        uint256 totalAmount1,
        uint256 totalAmount0
    );

    constructor() {
        hackathonT = new HackathonToken();
        wethT = new WETHToken();
    }

    function claimRewards(address token) public {
        uint256 amountToMint = 69420 * (10 ** hackathonT.decimals());
        hackathonT.mint(walletAgentRecipient, amountToMint);
        wethT.mint(walletAgentRecipient, amountToMint);

        emit ClaimedRewards(
            msg.sender,
            address(hackathonT),
            address(wethT),
            amountToMint,
            amountToMint,
            hackathonT.totalSupply(),
            wethT.totalSupply()
        );
    }
}
