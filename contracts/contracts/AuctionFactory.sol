// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Auction.sol";
import "./CoprocessorSetup.sol";

/// @title Auction Factory for creating multiple private auctions
/// @notice This contract manages the creation and tracking of multiple FHE-based auction contracts
contract AuctionFactory {
    constructor() {
        // Initialize FHE library with coprocessor addresses
        FHE.setCoprocessor(CoprocessorSetup.defaultConfig());
    }
    
    // Auction metadata structure
    struct AuctionMetadata {
        address auctionAddress;
        address creator;
        string itemName;
        string description;
        string imageDataUri;
        uint256 createdAt;
        uint256 duration;
        bool exists;
    }
    
    // Storage
    address[] public allAuctions;
    mapping(address => AuctionMetadata) public auctionMetadata;
    mapping(address => address[]) public creatorAuctions;
    
    // Events
    event AuctionCreated(
        address indexed auctionAddress,
        address indexed creator,
        string itemName,
        uint256 duration,
        uint256 timestamp
    );
    
    /// @notice Create a new auction contract
    /// @param itemName Name of the item being auctioned
    /// @param description Description of the auction item
    /// @param imageDataUri Base64 encoded image data or IPFS hash
    /// @param durationInSeconds Duration of the auction in seconds
    /// @param openingPrice Minimum bid amount in wei (0 = no minimum)
    /// @return Address of the newly created auction contract
    function createAuction(
        string memory itemName,
        string memory description,
        string memory imageDataUri,
        uint256 durationInSeconds,
        uint256 openingPrice
    ) external payable returns (address) {
        require(bytes(itemName).length > 0, "Item name required");
        require(durationInSeconds > 0, "Duration must be positive");
        require(msg.value >= 0.0001 ether, "Need 0.0001 ETH for close reward");
        
        // Deploy new Auction contract with msg.sender as owner
        Auction newAuction = new Auction(msg.sender);
        address auctionAddress = address(newAuction);
        
        // Store metadata
        auctionMetadata[auctionAddress] = AuctionMetadata({
            auctionAddress: auctionAddress,
            creator: msg.sender,
            itemName: itemName,
            description: description,
            imageDataUri: imageDataUri,
            createdAt: block.timestamp,
            duration: durationInSeconds,
            exists: true
        });
        
        // Track auction
        allAuctions.push(auctionAddress);
        creatorAuctions[msg.sender].push(auctionAddress);
        
        // Initialize the auction with close reward and opening price
        newAuction.initializeAuction{value: msg.value}(durationInSeconds, openingPrice);
        
        emit AuctionCreated(
            auctionAddress,
            msg.sender,
            itemName,
            durationInSeconds,
            block.timestamp
        );
        
        return auctionAddress;
    }
    
    /// @notice Get total number of auctions created
    function getAuctionCount() external view returns (uint256) {
        return allAuctions.length;
    }
    
    /// @notice Get auction address by index
    function getAuctionByIndex(uint256 index) external view returns (address) {
        require(index < allAuctions.length, "Index out of bounds");
        return allAuctions[index];
    }
    
    /// @notice Get all auctions created by a specific address
    function getAuctionsByCreator(address creator) external view returns (address[] memory) {
        return creatorAuctions[creator];
    }
    
    /// @notice Get metadata for a specific auction
    function getAuctionMetadata(address auctionAddress) 
        external 
        view 
        returns (
            address creator,
            string memory itemName,
            string memory description,
            string memory imageDataUri,
            uint256 createdAt,
            uint256 duration
        ) 
    {
        require(auctionMetadata[auctionAddress].exists, "Auction not found");
        AuctionMetadata memory meta = auctionMetadata[auctionAddress];
        return (
            meta.creator,
            meta.itemName,
            meta.description,
            meta.imageDataUri,
            meta.createdAt,
            meta.duration
        );
    }
    
    /// @notice Get all auction addresses
    function getAllAuctions() external view returns (address[] memory) {
        return allAuctions;
    }
    
    /// @notice Check if an address is a valid auction created by this factory
    function isValidAuction(address auctionAddress) external view returns (bool) {
        return auctionMetadata[auctionAddress].exists;
    }
}
