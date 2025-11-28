import { useState } from 'react';
import { useWriteContract, useAccount } from 'wagmi';
import { initializeFHE, encryptSmallValue } from '../lib/fhe';

const FHE_TEST_ADDRESS = '0xaC606DCdb3a62Ead145B496CedaD7647e1E0c1D3' as const;

const FHE_TEST_ABI = [
    {
        inputs: [
            { name: 'encryptedValue', type: 'bytes32' },
            { name: 'inputProof', type: 'bytes' }
        ],
        name: 'testEncryption',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'payable',
        type: 'function'
    }
] as const;

export function FHETestForm() {
    const [testValue, setTestValue] = useState('5');
    const [status, setStatus] = useState('');
    const { address } = useAccount();
    const { writeContract } = useWriteContract();

    const handleTest = async () => {
        if (!address) {
            setStatus('❌ Please connect your wallet');
            return;
        }

        try {
            setStatus('🔄 Initializing FHE SDK...');
            const fheInstance = await initializeFHE();

            const value = parseInt(testValue);
            if (isNaN(value) || value < 1 || value > 255) {
                setStatus('❌ Value must be between 1 and 255');
                return;
            }

            setStatus(`🔐 Encrypting value ${value} (euint8)...`);
            console.log('Testing FHE with euint8 value:', value);

            const encrypted = await encryptSmallValue(
                fheInstance,
                FHE_TEST_ADDRESS,
                address,
                value
            );

            if (!encrypted) {
                setStatus('❌ Encryption failed - check console');
                return;
            }

            // Convert proof to hex
            const proofHex = `0x${Array.from(encrypted.proof).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`;

            setStatus('📤 Submitting transaction...');
            console.log('Calling testEncryption with:');
            console.log('  Handle:', encrypted.handle);
            console.log('  Proof length:', encrypted.proof.length, 'bytes');

            writeContract({
                address: FHE_TEST_ADDRESS,
                abi: FHE_TEST_ABI,
                functionName: 'testEncryption',
                args: [encrypted.handle as `0x${string}`, proofHex],
                value: BigInt(100000000000000), // 0.0001 ETH
                gas: BigInt(5000000), // 5M gas - reasonable for FHE
            },
                {
                    onSuccess: (hash) => {
                        setStatus(`✅ Transaction sent! Hash: ${hash}`);
                        console.log('Transaction successful:', hash);
                    },
                    onError: (error) => {
                        setStatus(`❌ Transaction failed: ${error.message}`);
                        console.error('Transaction error:', error);
                    }
                });
        } catch (error) {
            setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Test failed:', error);
        }
    };

    return (
        <div className="fhe-test-container" style={{
            padding: '20px',
            border: '2px solid #4CAF50',
            borderRadius: '8px',
            margin: '20px',
            backgroundColor: '#f9f9f9'
        }}>
            <h2 style={{ color: '#4CAF50' }}>🧪 FHE Test (euint8)</h2>
            <p style={{ fontSize: '14px', color: '#666' }}>
                Testing minimal FHE encryption with euint8 type
            </p>

            <div style={{ margin: '20px 0' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Test Value (1-255):
                </label>
                <input
                    type="number"
                    value={testValue}
                    onChange={(e) => setTestValue(e.target.value)}
                    min="1"
                    max="255"
                    style={{
                        padding: '8px',
                        width: '100px',
                        fontSize: '16px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                    }}
                />
            </div>

            <button
                onClick={handleTest}
                disabled={!address}
                style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: address ? '#4CAF50' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: address ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold'
                }}
            >
                {address ? '🚀 Test FHE Encryption' : '⚠️ Connect Wallet First'}
            </button>

            {status && (
                <div style={{
                    marginTop: '20px',
                    padding: '12px',
                    backgroundColor: status.startsWith('❌') ? '#ffebee' : status.startsWith('✅') ? '#e8f5e9' : '#fff9c4',
                    borderRadius: '4px',
                    border: `1px solid ${status.startsWith('❌') ? '#f44336' : status.startsWith('✅') ? '#4CAF50' : '#FFC107'}`
                }}>
                    <strong>Status:</strong> {status}
                </div>
            )}

            <div style={{
                marginTop: '20px',
                padding: '10px',
                backgroundColor: '#e3f2fd',
                borderRadius: '4px',
                fontSize: '12px'
            }}>
                <strong>Contract:</strong> {FHE_TEST_ADDRESS}<br />
                <strong>Expected Result:</strong> If euint8 works → Success! If fails → Check console for errors
            </div>
        </div>
    );
}
