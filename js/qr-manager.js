/**
 * QR Code Manager - Frontend
 * Professional QR code generation and display for VotEth
 */

class QRManager {
    constructor() {
        this.currentQR = null;
        this.serverUrl = window.location.origin;
    }

    /**
     * Generate and display QR code for current election
     * @param {string} electionName - Name of the election
     * @param {HTMLElement} container - Container element to display QR
     */
    async generateAndDisplay(electionName = 'Current Election', container) {
        try {
            if (!container) {
                throw new Error('Container element not provided');
            }

            // Show loading state
            container.innerHTML = `
                <div class="qr-loading">
                    <div class="spinner"></div>
                    <p>Generating QR Code...</p>
                </div>
            `;

            // Get current contract address from config or main.js global variable
            const contractAddress = window.contractAddress || (typeof contractAddress !== 'undefined' ? contractAddress : '0x50bc25f0878B5081Bf00870643C74DDe6df64756');
            
            // Fetch QR code data from backend
            const response = await fetch(
                `${this.serverUrl}/api/qr/data?contract=${contractAddress}&election=${encodeURIComponent(electionName)}`
            );

            if (!response.ok) {
                throw new Error('Failed to generate QR code');
            }

            const data = await response.json();
            this.currentQR = data;

            // Display QR code with professional UI
            this.displayQR(data, container, electionName);

            return data;

        } catch (error) {
            console.error('QR Generation Error:', error);
            container.innerHTML = `
                <div class="qr-error">
                    <p style="color: #FF6B6B;">❌ Failed to generate QR code</p>
                    <small>${error.message}</small>
                </div>
            `;
            throw error;
        }
    }

    /**
     * Display QR code with professional styling
     */
    displayQR(qrData, container, electionName) {
        const shortUrl = qrData.votingUrl.length > 50 
            ? qrData.votingUrl.substring(0, 47) + '...' 
            : qrData.votingUrl;

        // Helper function to get translation
        const t = (key) => {
            if (typeof window.t === 'function') {
                return window.t(key);
            }
            // Fallback translations
            const fallbacks = {
                'qr.scanToVote': 'Scan to Vote',
                'qr.votingUrl': 'Voting URL',
                'qr.download': '📥 Download PNG',
                'qr.copyUrl': '📋 Copy URL',
                'qr.share': '📤 Share',
                'qr.howToUse': 'How to use:',
                'qr.step1': 'Download or screenshot this QR code',
                'qr.step2': 'Share on posters, emails, or social media',
                'qr.step3': 'Voters scan with their phone camera',
                'qr.step4': 'Automatically opens voting page',
                'election.contract': 'Contract'
            };
            return fallbacks[key] || key;
        };

        container.innerHTML = `
            <div class="qr-container">
                <div class="qr-header">
                    <h3>🗳️ ${electionName}</h3>
                    <p class="qr-subtitle">${t('qr.scanToVote')}</p>
                </div>
                
                <div class="qr-image-wrapper">
                    <img src="${qrData.dataUrl}" alt="QR Code for ${electionName}" class="qr-image">
                </div>
                
                <div class="qr-info">
                    <p class="qr-url-label">${t('qr.votingUrl')}:</p>
                    <p class="qr-url" title="${qrData.votingUrl}">${shortUrl}</p>
                    <p class="qr-contract-info">
                        <strong>${t('election.contract')}:</strong> ${qrData.contractAddress.substring(0, 10)}...${qrData.contractAddress.substring(38)}
                    </p>
                </div>
                
                <div class="qr-actions">
                    <button onclick="qrManager.downloadQR('${electionName}')" class="qr-btn qr-btn-primary">
                        ${t('qr.download')}
                    </button>
                    <button onclick="qrManager.copyURL()" class="qr-btn qr-btn-secondary">
                        ${t('qr.copyUrl')}
                    </button>
                    <button onclick="qrManager.shareQR()" class="qr-btn qr-btn-secondary">
                        ${t('qr.share')}
                    </button>
                </div>
                
                <div class="qr-instructions">
                    <p><strong>${t('qr.howToUse')}</strong></p>
                    <ol>
                        <li>${t('qr.step1')}</li>
                        <li>${t('qr.step2')}</li>
                        <li>${t('qr.step3')}</li>
                        <li>${t('qr.step4')}</li>
                    </ol>
                </div>
            </div>
        `;
    }

    /**
     * Download QR code as PNG
     */
    async downloadQR(electionName = 'Election') {
        try {
            if (!this.currentQR) {
                alert('⚠️ Please generate a QR code first');
                return;
            }

            // Convert data URL to blob
            const response = await fetch(this.currentQR.dataUrl);
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `VotEth_QR_${electionName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log('✅ QR code downloaded');
            this.showNotification('✅ QR code downloaded successfully!', 'success');

        } catch (error) {
            console.error('Download error:', error);
            this.showNotification('❌ Failed to download QR code', 'error');
        }
    }

    /**
     * Copy voting URL to clipboard
     */
    async copyURL() {
        try {
            if (!this.currentQR) {
                alert('⚠️ Please generate a QR code first');
                return;
            }

            await navigator.clipboard.writeText(this.currentQR.votingUrl);
            this.showNotification('✅ URL copied to clipboard!', 'success');

        } catch (error) {
            console.error('Copy error:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.currentQR.votingUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            this.showNotification('✅ URL copied to clipboard!', 'success');
        }
    }

    /**
     * Share QR code using Web Share API
     */
    async shareQR() {
        try {
            if (!this.currentQR) {
                alert('⚠️ Please generate a QR code first');
                return;
            }

            if (navigator.share) {
                await navigator.share({
                    title: 'Vote on VotEth',
                    text: `Cast your vote: ${this.currentQR.electionName}`,
                    url: this.currentQR.votingUrl
                });
                console.log('✅ Shared successfully');
            } else {
                // Fallback: copy to clipboard
                await this.copyURL();
            }

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share error:', error);
                this.showNotification('⚠️ Sharing not supported. URL copied instead.', 'warning');
                await this.copyURL();
            }
        }
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Check if notification element exists
        let notification = document.getElementById('qr-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'qr-notification';
            notification.className = 'qr-notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.className = `qr-notification qr-notification-${type} qr-notification-show`;

        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('qr-notification-show');
        }, 3000);
    }

    /**
     * Generate QR code directly in browser (offline mode)
     * Uses a QR library if available, otherwise falls back to API
     */
    async generateOffline(text, size = 512) {
        // This would require a client-side QR library like qrcode.js
        // For now, we use the server API
        console.log('Offline QR generation not yet implemented');
        return null;
    }
}

// Create global instance
const qrManager = new QRManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QRManager;
}
