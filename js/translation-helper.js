/**
 * Translation Helper for Dynamic Content
 * Provides easy access to translations in main.js
 */

// Helper function to get translation safely
function getTranslation(key, params = {}) {
    if (typeof window.t === 'function') {
        return window.t(key, params);
    }
    
    // Fallback English translations
    const fallbacks = {
        // Wallet messages
        'wallet.connected': 'Wallet connected',
        'wallet.connectPrompt': 'Connect your wallet to view voting status',
        'errors.wrongNetwork': 'Wrong Network! Please switch to Sepolia testnet in your wallet.',
        'errors.noWallet': 'No Ethereum wallet detected! Please install MetaMask, Phantom, or another Web3 wallet.',
        
        // Voting messages
        'voting.success': 'Vote successfully recorded!',
        'voting.alreadyVoted': 'You have already voted!',
        'voting.votingEnded': 'Voting period has ended',
        'voting.invalidCandidate': 'Invalid candidate number',
        'voting.transactionRejected': 'Transaction rejected by user',
        'voting.transactionFailed': 'Transaction failed. Please try again.',
        'voting.connectFirst': 'Please connect your wallet first',
        'voting.submitting': 'Submitting vote',
        'voting.confirming': 'Confirming transaction',
        
        // Candidates messages
        'candidates.loading': 'Loading candidates',
        'candidates.loaded': 'Candidates loaded successfully',
        'candidates.failed': 'Failed to load candidates. Please refresh the page.',
        'candidates.connectToView': 'Connect your wallet to view candidates',
        
        // Election status
        'election.active': 'Voting is currently open',
        'election.finished': 'Voting is finished',
        'election.remainingTime': 'Remaining time is {{seconds}} seconds',
        
        // Results
        'results.connectToView': 'Please connect your wallet first',
        'results.loading': 'Please wait, getting all the candidates from the voting smart contract',
        'results.updated': 'The tasks are updated',
        
        // QR Code
        'qr.downloaded': 'QR code downloaded successfully!',
        'qr.urlCopied': 'URL copied to clipboard!',
        'qr.downloadFailed': 'Failed to download QR code',
        'qr.notGenerated': 'Please generate a QR code first',
        
        // Common
        'common.loading': 'Loading...',
        'common.pleaseWait': 'Please wait'
    };
    
    let translation = fallbacks[key] || key;
    
    // Simple interpolation for {{variable}} patterns
    if (params && Object.keys(params).length > 0) {
        Object.keys(params).forEach(paramKey => {
            translation = translation.replace(new RegExp(`{{${paramKey}}}`, 'g'), params[paramKey]);
        });
    }
    
    return translation;
}

// Export for use in main.js
if (typeof window !== 'undefined') {
    window.getTranslation = getTranslation;
}
