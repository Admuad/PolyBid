// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Simple Auction (Non-FHE version for testing)
/// @notice Simplified auction contract for testing on regular Ethereum testnets
contract AuctionSimple {
    // Auction state
    address public owner;
    uint256 public auctionEndTime;
    bool public auctionEnded;
    bool public auctionStarted;
    
    // Winner data
    address public winner;
    
    // Mapping of bidder addresses
    mapping(address => bool) public hasBid;
    address[] public bidders;
    
    // Events
    event AuctionStarted(uint256 endTime);
    event BidSubmitted(address indexed bidder);
    event AuctionClosed();
    event WinnerRevealed(address indexed winner, uint64 amount);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier auctionActive() {
        require(auctionStarted, "Auction not started");
        require(!auctionEnded, "Auction already ended");
        require(block.timestamp < auctionEndTime, "Auction time expired");
        _;
    }
    
    modifier auctionComplete() {
        require(auctionEnded, "Auction not ended yet");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /// @notice Initialize a new auction with specified duration
    /// @param _durationInSeconds Duration of the auction in seconds
    function initializeAuction(uint256 _durationInSeconds) external onlyOwner {
        require(!auctionStarted || auctionEnded, "Auction already in progress");
        require(_durationInSeconds > 0, "Duration must be positive");
        
        auctionEndTime = block.timestamp + _durationInSeconds;
        auctionEnded = false;
        auctionStarted = true;
        
        // Reset previous auction data
        delete winner;
        delete bidders;
        
        emit AuctionStarted(auctionEndTime);
    }
    
    /// @notice Submit a bid to the auction (simplified - no actual encryption)
    /// @param encryptedAmount Mock encrypted bid (unused in this version)
    /// @param inputProof Mock proof (unused in this version)
    function submitBid(bytes32 encryptedAmount, bytes calldata inputProof) external auctionActive {
        require(!hasBid[msg.sender], "Already submitted a bid");
        
        // Store that user has bid
        hasBid[msg.sender] = true;
        bidders.push(msg.sender);
        
        emit BidSubmitted(msg.sender);
    }
    
    /// @notice Update an existing bid
    /// @param encryptedAmount New mock encrypted bid
    /// @param inputProof Mock proof
    function updateBid(bytes32 encryptedAmount, bytes calldata inputProof) external auctionActive {
        require(hasBid[msg.sender], "No existing bid to update");
        
        emit BidSubmitted(msg.sender);
    }
    
    /// @notice Close the auction
    function closeAuction() external {
        require(auctionStarted, "Auction not started");
        require(!auctionEnded, "Auction already ended");
        require(
            block.timestamp >= auctionEndTime || msg.sender == owner,
            "Auction still active"
        );
        require(bidders.length > 0, "No bids submitted");
        
        auctionEnded = true;
        
        emit AuctionClosed();
    }
    
    /// @notice Determine winner
    /// @param _winner Address of the winner
    function declareWinner(address _winner) external auctionComplete onlyOwner {
        require(winner == address(0), "Winner already declared");
        require(hasBid[_winner], "Address has no bid");
        
        winner = _winner;
        
        emit WinnerRevealed(winner, 0);
    }
    
    /// @notice Allow winner to claim their victory
    function claimWin() external view auctionComplete {
        require(msg.sender == winner, "Only winner can claim");
    }
    
    /// @notice Get the winner address
    function getWinner() external view auctionComplete returns (address) {
        return winner;
    }
    
    /// @notice Get total number of bidders
    function getBidderCount() external view returns (uint256) {
        return bidders.length;
    }
    
    /// @notice Get bidder address by index
    function getBidder(uint256 index) external view returns (address) {
        require(index < bidders.length, "Index out of bounds");
        return bidders[index];
    }
    
    /// @notice Check if an address has submitted a bid
    /// @param bidder Address of the bidder
    /// @return True if the address has bid
    function hasSubmittedBid(address bidder) external view returns (bool) {
        return hasBid[bidder];
    }
    
    /// @notice Check if auction is currently active
    function isAuctionActive() external view returns (bool) {
        return auctionStarted && !auctionEnded && block.timestamp < auctionEndTime;
    }
    
    /// @notice Get time remaining in auction
    function getTimeRemaining() external view returns (uint256) {
        if (!auctionStarted || auctionEnded || block.timestamp >= auctionEndTime) {
            return 0;
        }
        return auctionEndTime - block.timestamp;
    }
}
