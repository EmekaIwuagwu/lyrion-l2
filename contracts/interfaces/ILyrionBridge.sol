// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ILyrionBridge
 * @notice Interface for the LYRION L2 Bridge
 */
interface ILyrionBridge {
    // ============ Events ============

    event DepositInitiated(
        uint256 indexed nonce,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    event BatchSubmitted(
        uint256 indexed batchNumber,
        bytes32 stateRoot,
        uint256 startBlock,
        uint256 endBlock,
        uint256 txCount,
        uint256 timestamp
    );

    event WithdrawalCompleted(
        bytes32 indexed withdrawalHash,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    // ============ Deposit Functions ============

    function depositToL2(address recipient) external payable;
    function depositToL2() external payable;

    // ============ Batch Functions ============

    function submitBatch(
        bytes32 stateRoot,
        uint256 startBlock,
        uint256 endBlock,
        uint256 txCount
    ) external;

    // ============ Withdrawal Functions ============

    function withdrawFromL2(
        uint256 batchNumber,
        address recipient,
        uint256 amount,
        bytes32[] calldata proof
    ) external;

    // ============ View Functions ============

    function batchStateRoots(
        uint256 batchNumber
    ) external view returns (bytes32);
    function batchSubmissionTime(
        uint256 batchNumber
    ) external view returns (uint256);
    function currentBatchNumber() external view returns (uint256);
    function isBatchFinalized(uint256 batchNumber) external view returns (bool);

    function getBatchInfo(
        uint256 batchNumber
    )
        external
        view
        returns (bytes32 stateRoot, uint256 submissionTime, bool isFinalized);

    function getBridgeStats()
        external
        view
        returns (
            uint256 _currentBatchNumber,
            uint256 _totalDeposited,
            uint256 _totalWithdrawn,
            uint256 _bridgeBalance,
            uint256 _depositNonce
        );
}
