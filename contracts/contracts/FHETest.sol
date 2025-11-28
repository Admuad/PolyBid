// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@fhevm/solidity/lib/FHE.sol";
import "./CoprocessorSetup.sol";

/**
 * Minimal FHE Test Contract
 * Purpose: Isolate FHE.fromExternal verification to debug proof/handle issues
 * Based on debugging guidance - test with euint8 and small values first
 */
contract FHETest {
    // Event to confirm successful encryption
    event TestSuccess(address indexed user, string message);
    event TestValue(address indexed user, uint8 decryptedValue);
    
    // Store the last encrypted value for verification
    mapping(address => euint8) public encryptedValues;
    
    constructor() {
        // Initialize FHE library with coprocessor addresses
        FHE.setCoprocessor(CoprocessorSetup.defaultConfig());
    }
    
    /**
     * Simplest possible FHE test - just verify the proof works
     * @param encryptedValue The encrypted uint8 value (handle)
     * @param inputProof The zero-knowledge proof
     */
    function testEncryption(externalEuint8 encryptedValue, bytes calldata inputProof) external payable returns (bool) {
        // This is the ONLY line we're testing - can proof be verified?
        euint8 value = FHE.fromExternal(encryptedValue, inputProof);
        
        // If we reach here, verification succeeded!
        encryptedValues[msg.sender] = value;
        FHE.allow(value, address(this));
        
        emit TestSuccess(msg.sender, "FHE verification successful!");
        return true;
    }
    
    /**
     * Test with ETH value requirement (like the auction)
     */
    function testWithValue(externalEuint8 encryptedValue, bytes calldata inputProof) external payable returns (bool) {
        require(msg.value > 0, "Must send ETH");
        
        euint8 value = FHE.fromExternal(encryptedValue, inputProof);
        encryptedValues[msg.sender] = value;
        FHE.allow(value, address(this));
        
        emit TestSuccess(msg.sender, "FHE verification with value successful!");
        return true;
    }
}
