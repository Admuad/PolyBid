// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {CoprocessorConfig} from "@fhevm/solidity/lib/Impl.sol";

/**
 * @title   CoprocessorSetup
 * @notice  This library returns all addresses for the ACL, FHEVMExecutor and KMSVerifier contracts.
 * @dev     Uses Sepolia v0.9 addresses from official Zama documentation
 */
library CoprocessorSetup {
    /**
     * @notice This function returns a struct containing all contract addresses for Sepolia testnet.
     * @dev    These addresses are from Zama's official v0.9 Sepolia deployment.
     */
    function defaultConfig() internal pure returns (CoprocessorConfig memory) {
        return
            CoprocessorConfig({
                ACLAddress: 0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D,
                CoprocessorAddress: 0x92C920834Ec8941d2C77D188936E1f7A6f49c127, // FHEVMExecutor
                KMSVerifierAddress: 0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A
            });
    }
}
