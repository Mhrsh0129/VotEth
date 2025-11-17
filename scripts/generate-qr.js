/**
 * QR Code Generation Utility
 * Generates QR codes for election voting links
 * Professional implementation with error handling and validation
 */

const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

/**
 * Generate QR code for a voting election
 * @param {string} contractAddress - Ethereum contract address
 * @param {string} electionName - Name of the election
 * @param {string} baseUrl - Base URL of the voting dApp
 * @returns {Promise<Object>} - Object with file paths and data URL
 */
async function generateElectionQR(contractAddress, electionName = 'Election', baseUrl = 'https://vot-eth.vercel.app') {
    try {
        // Validate inputs
        if (!contractAddress || !contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
            throw new Error('Invalid Ethereum contract address format');
        }

        // Construct voting URL with query parameters
        const votingUrl = `${baseUrl}?contract=${contractAddress}&election=${encodeURIComponent(electionName)}`;
        
        // Create QR codes directory if it doesn't exist
        const qrDir = path.join(__dirname, '..', 'assets', 'qr-codes');
        if (!fs.existsSync(qrDir)) {
            fs.mkdirSync(qrDir, { recursive: true });
        }

        // Generate sanitized filename
        const sanitizedName = electionName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const timestamp = Date.now();
        const filename = `qr_${sanitizedName}_${timestamp}`;
        
        // File paths
        const pngPath = path.join(qrDir, `${filename}.png`);
        const svgPath = path.join(qrDir, `${filename}.svg`);
        const txtPath = path.join(qrDir, `${filename}_info.txt`);

        // QR Code options for high quality
        const options = {
            errorCorrectionLevel: 'H', // High error correction (30%)
            type: 'image/png',
            quality: 0.95,
            margin: 2,
            width: 512, // High resolution
            color: {
                dark: '#132440',  // VotEth brand color
                light: '#FFFFFF'
            }
        };

        // Generate PNG
        await QRCode.toFile(pngPath, votingUrl, options);
        
        // Generate SVG (scalable for printing)
        await QRCode.toFile(svgPath, votingUrl, { 
            ...options, 
            type: 'svg',
            color: {
                dark: '#132440',
                light: '#FFFFFF'
            }
        });

        // Generate data URL for inline display
        const dataUrl = await QRCode.toDataURL(votingUrl, options);

        // Save metadata
        const metadata = {
            electionName,
            contractAddress,
            votingUrl,
            generatedAt: new Date().toISOString(),
            files: {
                png: filename + '.png',
                svg: filename + '.svg'
            }
        };

        fs.writeFileSync(txtPath, JSON.stringify(metadata, null, 2));

        console.log('✅ QR Code generated successfully!');
        console.log(`📁 PNG: ${pngPath}`);
        console.log(`📁 SVG: ${svgPath}`);
        console.log(`🔗 URL: ${votingUrl}`);

        return {
            success: true,
            votingUrl,
            files: {
                png: pngPath,
                svg: svgPath,
                info: txtPath
            },
            dataUrl,
            metadata
        };

    } catch (error) {
        console.error('❌ Error generating QR code:', error.message);
        throw error;
    }
}

/**
 * Generate QR code as buffer for API responses
 * @param {string} url - URL to encode
 * @returns {Promise<Buffer>}
 */
async function generateQRBuffer(url) {
    const options = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 2,
        width: 512,
        color: {
            dark: '#132440',
            light: '#FFFFFF'
        }
    };

    return await QRCode.toBuffer(url, options);
}

/**
 * Generate QR code as data URL (base64)
 * @param {string} url - URL to encode
 * @returns {Promise<string>}
 */
async function generateQRDataURL(url) {
    const options = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 2,
        width: 512,
        color: {
            dark: '#132440',
            light: '#FFFFFF'
        }
    };

    return await QRCode.toDataURL(url, options);
}

// CLI support
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Usage: node generate-qr.js <contract_address> [election_name] [base_url]');
        console.log('Example: node generate-qr.js 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb "Student Election 2025"');
        process.exit(1);
    }

    const [contractAddress, electionName = 'Election', baseUrl = 'https://vot-eth.vercel.app'] = args;
    
    generateElectionQR(contractAddress, electionName, baseUrl)
        .then(result => {
            console.log('\n📊 Generation complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Generation failed:', error.message);
            process.exit(1);
        });
}

module.exports = {
    generateElectionQR,
    generateQRBuffer,
    generateQRDataURL
};
