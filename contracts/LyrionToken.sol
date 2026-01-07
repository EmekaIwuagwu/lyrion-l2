// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LyrionToken
 * @notice Native LYR token on Flare L1 for bridging
 * @dev ERC20 token that can be minted by the bridge for L2 withdrawals
 */
contract LyrionToken is ERC20, Ownable {
    /// @notice Bridge contract address with minting rights
    address public bridge;

    /// @notice Maximum supply cap (1 billion tokens)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;

    event BridgeUpdated(address indexed oldBridge, address indexed newBridge);

    error OnlyBridge();
    error MaxSupplyExceeded();

    constructor(
        address _bridge
    ) ERC20("Lyrion Token", "LYR") Ownable(msg.sender) {
        bridge = _bridge;
        emit BridgeUpdated(address(0), _bridge);
    }

    /**
     * @notice Mint tokens (only bridge can call)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external {
        if (msg.sender != bridge) revert OnlyBridge();
        if (totalSupply() + amount > MAX_SUPPLY) revert MaxSupplyExceeded();
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens (for L1 -> L2 deposits)
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @notice Update bridge address
     */
    function setBridge(address _bridge) external onlyOwner {
        address oldBridge = bridge;
        bridge = _bridge;
        emit BridgeUpdated(oldBridge, _bridge);
    }
}
