// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title LyrionBridge
 * @notice Main bridge contract for LYRION L2 on Flare L1
 * @dev Handles deposits to L2, batch submissions, and withdrawals with merkle proofs
 */
contract LyrionBridge is Ownable, ReentrancyGuard {
    // ============ State Variables ============

    /// @notice Mapping of L2 batch numbers to their state roots
    mapping(uint256 => bytes32) public batchStateRoots;

    /// @notice Mapping of L2 batch numbers to their submission timestamps
    mapping(uint256 => uint256) public batchSubmissionTime;

    /// @notice Mapping of deposit nonces to prevent replay
    mapping(uint256 => bool) public processedDeposits;

    /// @notice Mapping of withdrawal hashes to prevent replay
    mapping(bytes32 => bool) public processedWithdrawals;

    /// @notice Current batch number
    uint256 public currentBatchNumber;

    /// @notice Challenge period for optimistic withdrawals (7 days for production)
    uint256 public challengePeriod = 10 minutes; // Short for testing

    /// @notice Authorized sequencer address
    address public sequencer;

    /// @notice Total deposits to L2
    uint256 public totalDeposited;

    /// @notice Total withdrawn from L2
    uint256 public totalWithdrawn;

    /// @notice Deposit nonce counter
    uint256 public depositNonce;

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

    event SequencerUpdated(
        address indexed oldSequencer,
        address indexed newSequencer
    );
    event ChallengePeriodUpdated(uint256 oldPeriod, uint256 newPeriod);

    // ============ Errors ============

    error InvalidSequencer();
    error InvalidAmount();
    error InvalidProof();
    error DepositAlreadyProcessed();
    error WithdrawalAlreadyProcessed();
    error BatchNotFinalized();
    error InsufficientBridgeBalance();
    error TransferFailed();

    // ============ Constructor ============

    constructor(address _sequencer) Ownable(msg.sender) {
        sequencer = _sequencer;
        emit SequencerUpdated(address(0), _sequencer);
    }

    // ============ Deposit Functions ============

    /**
     * @notice Deposit native tokens to L2
     * @param recipient Address to receive tokens on L2
     */
    function depositToL2(address recipient) external payable nonReentrant {
        if (msg.value == 0) revert InvalidAmount();

        uint256 nonce = depositNonce++;
        totalDeposited += msg.value;

        emit DepositInitiated(
            nonce,
            msg.sender,
            recipient,
            msg.value,
            block.timestamp
        );
    }

    /**
     * @notice Deposit native tokens to L2 for self
     */
    function depositToL2() external payable nonReentrant {
        if (msg.value == 0) revert InvalidAmount();

        uint256 nonce = depositNonce++;
        totalDeposited += msg.value;

        emit DepositInitiated(
            nonce,
            msg.sender,
            msg.sender,
            msg.value,
            block.timestamp
        );
    }

    // ============ Batch Submission Functions ============

    /**
     * @notice Submit a new batch of L2 state
     * @param stateRoot Merkle root of the L2 state after this batch
     * @param startBlock First L2 block in this batch
     * @param endBlock Last L2 block in this batch
     * @param txCount Number of transactions in this batch
     */
    function submitBatch(
        bytes32 stateRoot,
        uint256 startBlock,
        uint256 endBlock,
        uint256 txCount
    ) external {
        if (msg.sender != sequencer) revert InvalidSequencer();

        currentBatchNumber++;
        batchStateRoots[currentBatchNumber] = stateRoot;
        batchSubmissionTime[currentBatchNumber] = block.timestamp;

        emit BatchSubmitted(
            currentBatchNumber,
            stateRoot,
            startBlock,
            endBlock,
            txCount,
            block.timestamp
        );
    }

    // ============ Withdrawal Functions ============

    /**
     * @notice Withdraw tokens from L2 using a Merkle proof
     * @param batchNumber Batch number where the withdrawal was included
     * @param recipient Address to receive tokens on L1
     * @param amount Amount to withdraw
     * @param proof Merkle proof of the withdrawal
     */
    function withdrawFromL2(
        uint256 batchNumber,
        address recipient,
        uint256 amount,
        bytes32[] calldata proof
    ) external nonReentrant {
        // Verify batch is finalized (challenge period passed)
        if (
            block.timestamp < batchSubmissionTime[batchNumber] + challengePeriod
        ) {
            revert BatchNotFinalized();
        }

        // Create withdrawal hash
        bytes32 withdrawalHash = keccak256(
            abi.encodePacked(batchNumber, recipient, amount)
        );

        // Check not already processed
        if (processedWithdrawals[withdrawalHash])
            revert WithdrawalAlreadyProcessed();

        // Verify merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(recipient, amount));
        if (!MerkleProof.verify(proof, batchStateRoots[batchNumber], leaf)) {
            revert InvalidProof();
        }

        // Check bridge has sufficient balance
        if (address(this).balance < amount) revert InsufficientBridgeBalance();

        // Mark as processed
        processedWithdrawals[withdrawalHash] = true;
        totalWithdrawn += amount;

        // Transfer
        (bool success, ) = recipient.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit WithdrawalCompleted(
            withdrawalHash,
            recipient,
            amount,
            block.timestamp
        );
    }

    // ============ View Functions ============

    /**
     * @notice Get batch information
     */
    function getBatchInfo(
        uint256 batchNumber
    )
        external
        view
        returns (bytes32 stateRoot, uint256 submissionTime, bool isFinalized)
    {
        stateRoot = batchStateRoots[batchNumber];
        submissionTime = batchSubmissionTime[batchNumber];
        isFinalized = block.timestamp >= submissionTime + challengePeriod;
    }

    /**
     * @notice Check if a batch is finalized
     */
    function isBatchFinalized(
        uint256 batchNumber
    ) external view returns (bool) {
        return
            block.timestamp >=
            batchSubmissionTime[batchNumber] + challengePeriod;
    }

    /**
     * @notice Get bridge statistics
     */
    function getBridgeStats()
        external
        view
        returns (
            uint256 _currentBatchNumber,
            uint256 _totalDeposited,
            uint256 _totalWithdrawn,
            uint256 _bridgeBalance,
            uint256 _depositNonce
        )
    {
        return (
            currentBatchNumber,
            totalDeposited,
            totalWithdrawn,
            address(this).balance,
            depositNonce
        );
    }

    // ============ Admin Functions ============

    /**
     * @notice Update the sequencer address
     */
    function setSequencer(address _sequencer) external onlyOwner {
        address oldSequencer = sequencer;
        sequencer = _sequencer;
        emit SequencerUpdated(oldSequencer, _sequencer);
    }

    /**
     * @notice Update the challenge period
     */
    function setChallengePeriod(uint256 _period) external onlyOwner {
        uint256 oldPeriod = challengePeriod;
        challengePeriod = _period;
        emit ChallengePeriodUpdated(oldPeriod, _period);
    }

    /**
     * @notice Emergency withdrawal (owner only, for emergencies)
     */
    function emergencyWithdraw(address to, uint256 amount) external onlyOwner {
        (bool success, ) = to.call{value: amount}("");
        if (!success) revert TransferFailed();
    }

    // ============ Receive ============

    receive() external payable {}
}
