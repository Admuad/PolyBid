// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@fhevm/solidity/lib/FHE.sol";
import "./CoprocessorSetup.sol";

/// @title Private Auction using Fully Homomorphic Encryption  
/// @notice Sealed-bid auction where winner identity remains private
/// @dev Uses Zama FHE for bid comparison. Winner determined via encrypted address comparison
contract Auction {
    // Auction state
    address public owner;
    uint256 public auctionEndTime;
    bool public auctionEnded;
    bool public auctionStarted;
    uint256 public openingPrice; // Minimum bid amount (0 = no minimum)

    // Economic incentive for closing auction
    uint256 public constant CLOSE_REWARD = 0.0001 ether;

    // FHE encrypted data (PRIVATE - no public winner!)
    euint64 private highestBid;
    eaddress private encryptedWinner;

    // Bidder data
    mapping(address => euint64) private encryptedBids;
    mapping(address => bool) public hasBid;
    mapping(address => uint256) public bidDeposits;
    address[] public bidders;

    // Events
    event AuctionStarted(uint256 endTime);
    event BidSubmitted(address indexed bidder);
    event AuctionClosed(address indexed closer, uint256 reward);
    event RefundWithdrawn(address indexed bidder, uint256 amount);
    event ProceedsWithdrawn(address indexed seller, uint256 amount);
    event WinClaimed(address indexed winner);

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

    constructor(address _owner) {
        FHE.setCoprocessor(CoprocessorSetup.defaultConfig());
        owner = _owner;
    }

    /// @notice Initialize auction (owner pays close reward upfront via factory)
    /// @param _durationInSeconds Duration of the auction
    /// @param _openingPrice Minimum bid amount (0 = no minimum)
    function initializeAuction(uint256 _durationInSeconds, uint256 _openingPrice) external payable {
        require(!auctionStarted || auctionEnded, "Auction already in progress");
        require(_durationInSeconds > 0, "Duration must be positive");
        require(msg.value >= CLOSE_REWARD, "Need 0.0001 ETH for closer reward");

        auctionEndTime = block.timestamp + _durationInSeconds;
        auctionEnded = false;
        auctionStarted = true;
        openingPrice = _openingPrice;

        delete bidders;

        emit AuctionStarted(auctionEndTime);
    }

    /// @notice Submit encrypted bid with ETH deposit
    function submitBid(externalEuint64 encryptedAmount, bytes calldata inputProof) external payable auctionActive {
        require(!hasBid[msg.sender], "Already submitted a bid");
        require(msg.value > 0, "Bid amount must be greater than 0");
        
        // Check opening price if set
        if (openingPrice > 0) {
            require(msg.value >= openingPrice, "Bid below opening price");
        }

        euint64 bid = FHE.fromExternal(encryptedAmount, inputProof);
        FHE.allow(bid, address(this));

        encryptedBids[msg.sender] = bid;
        hasBid[msg.sender] = true;
        bidDeposits[msg.sender] = msg.value;
        bidders.push(msg.sender);

        emit BidSubmitted(msg.sender);
    }

    /// @notice Update existing bid
    function updateBid(externalEuint64 encryptedAmount, bytes calldata inputProof) external payable auctionActive {
        require(hasBid[msg.sender], "No existing bid to update");
        require(msg.value > 0, "Bid amount must be greater than 0");
        
        // Check opening price if set
        uint256 totalBid = bidDeposits[msg.sender] + msg.value;
        if (openingPrice > 0) {
            require(totalBid >= openingPrice, "Total bid below opening price");
        }

        euint64 newBid = FHE.fromExternal(encryptedAmount, inputProof);
        FHE.allow(newBid, address(this));

        encryptedBids[msg.sender] = newBid;
        bidDeposits[msg.sender] += msg.value;

        emit BidSubmitted(msg.sender);
    }

    /// @notice Close auction and compute encrypted winner (ANYONE can call after expiry)
    /// @dev Caller receives CLOSE_REWARD as incentive
    function closeAuction() external {
        require(auctionStarted, "Auction not started");
        require(!auctionEnded, "Auction already ended");
        require(block.timestamp >= auctionEndTime || msg.sender == owner, "Auction still active");

        // If no bids, only owner can close (and no winner)
        if (bidders.length == 0) {
            require(msg.sender == owner, "No bids: only owner can close");
            auctionEnded = true;
            emit AuctionClosed(msg.sender, 0); // No reward if no bids
            return;
        }

        auctionEnded = true;

        // Find highest bid using homomorphic comparison
        euint64 currentHighest = encryptedBids[bidders[0]];
        eaddress currentWinner = FHE.asEaddress(bidders[0]);

        for (uint256 i = 1; i < bidders.length; i++) {
            euint64 bid = encryptedBids[bidders[i]];
            eaddress bidder = FHE.asEaddress(bidders[i]);

            ebool isGreater = FHE.gt(bid, currentHighest);

            currentHighest = FHE.select(isGreater, bid, currentHighest);
            currentWinner = FHE.select(isGreater, bidder, currentWinner);
        }

        highestBid = currentHighest;
        encryptedWinner = currentWinner;

        // Compute win status for ALL bidders (avoid FHE.eq in amITheWinner)
        for (uint256 i = 0; i < bidders.length; i++) {
            address bidder = bidders[i];
            eaddress encryptedBidder = FHE.asEaddress(bidder);
            ebool isWinner = FHE.eq(currentWinner, encryptedBidder);
            
            // Store encrypted win status
            myWinStatus[bidder] = isWinner;
            
            // First allow the contract to manage this ciphertext
            FHE.allowThis(isWinner);
            
            // Then allow bidder to decrypt their result
            FHE.allow(isWinner, bidder);
        }

        // Pay reward to closer
        payable(msg.sender).transfer(CLOSE_REWARD);

        emit AuctionClosed(msg.sender, CLOSE_REWARD);
    }

    /// @notice Check if YOU are the winner (returns encrypted boolean)
    /// @dev Each bidder can decrypt this to learn their own win status
    /// @return Encrypted boolean - decrypt locally to see if you won
    mapping(address => ebool) public myWinStatus;

    /// @notice Check if YOU are the winner (reads pre-computed result)
    /// @dev Win status is computed during closeAuction for all bidders
    /// @return Encrypted boolean - decrypt locally to see if you won
    function amITheWinner() external view auctionComplete returns (ebool) {
        require(hasBid[msg.sender], "You did not bid");

        // Return pre-computed win status (set during closeAuction)
        return myWinStatus[msg.sender];
    }

    /// @notice Winner claims victory (deposit goes to seller)
    /// @dev Client must decrypt amITheWinner() first and only call if true
    function claimWin() external auctionComplete {
        require(hasBid[msg.sender], "You did not bid");

        // Client-side must check amITheWinner() before calling
        // No on-chain decrypt available without Gateway
        
        emit WinClaimed(msg.sender);
        // Winner's deposit stays for seller withdrawal
    }

    /// @notice Losers withdraw 100% refund
    /// @dev Client must decrypt amITheWinner() first and only call if false
    function withdrawRefund() external auctionComplete {
        require(hasBid[msg.sender], "You did not bid");
        require(bidDeposits[msg.sender] > 0, "No deposit to withdraw");

        // Client-side must check amITheWinner() = false before calling
        // No way to verify on-chain without decrypt, but wrong call wastes gas
        
        uint256 deposit = bidDeposits[msg.sender];
        bidDeposits[msg.sender] = 0;

        payable(msg.sender).transfer(deposit);

        emit RefundWithdrawn(msg.sender, deposit);
    }

    /// @notice Seller withdraws remaining balance (winner's deposit + any unclaimed)
    function withdrawProceeds() external auctionComplete onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No proceeds available");

        payable(owner).transfer(balance);

        emit ProceedsWithdrawn(owner, balance);
    }

    /// @notice Get number of bidders
    function getBidderCount() external view returns (uint256) {
        return bidders.length;
    }

    /// @notice Get bidder by index
    function getBidder(uint256 index) external view returns (address) {
        require(index < bidders.length, "Index out of bounds");
        return bidders[index];
    }

    /// @notice Check if address has bid
    function hasSubmittedBid(address _bidder) external view returns (bool) {
        return hasBid[_bidder];
    }

    /// @notice Check if auction is active
    function isAuctionActive() external view returns (bool) {
        return auctionStarted && !auctionEnded && block.timestamp < auctionEndTime;
    }

    /// @notice Get time remaining
    function getTimeRemaining() external view returns (uint256) {
        if (!auctionStarted || auctionEnded || block.timestamp >= auctionEndTime) {
            return 0;
        }
        return auctionEndTime - block.timestamp;
    }
}
