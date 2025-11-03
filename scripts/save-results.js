require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// Paths
const LOG_PATH = path.join(__dirname, '..', 'contract-addresses.txt');
const ARTIFACT = require(path.join('..', 'artifacts', 'contracts', 'Voting.sol', 'Voting.json'));

function getLatestAddressFromLog() {
  if (!fs.existsSync(LOG_PATH)) {
    return null;
  }
  const content = fs.readFileSync(LOG_PATH, 'utf8');
  const matches = [...content.matchAll(/Contract Address: (0x[a-fA-F0-9]{40})/g)].map(m => m[1]);
  return matches.length ? matches[matches.length - 1] : null;
}

function appendResultsToLog(address, results, votingActive, winners) {
  const timestamp = new Date().toISOString();
  const localTime = new Date().toLocaleString();

  const resultsLines = results
    .map(r => ` - ${r.name}: ${r.voteCount}`)
    .join('\n');

  const winnersLine = winners.length ? winners.map(w => `${w.name} (${w.voteCount})`).join(', ') : 'N/A';

  const block = `\n${'='.repeat(80)}\nResults Date: ${localTime}\nTimestamp: ${timestamp}\nContract Address: ${address}\nVoting Active: ${votingActive ? 'Yes' : 'No'}\nResults:\n${resultsLines}\nWinners: ${winnersLine}\n${'='.repeat(80)}\n`;

  fs.appendFileSync(LOG_PATH, block);
  console.log('✅ Election results appended to contract-addresses.txt');
}

async function fetchResults(address) {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) throw new Error('Missing API_URL in .env');
  const provider = new ethers.providers.JsonRpcProvider(apiUrl);
  const contract = new ethers.Contract(address, ARTIFACT.abi, provider);

  const [candidates, votingActive] = await Promise.all([
    contract.getAllVotesOfCandidates(),
    contract.getVotingStatus()
  ]);

  const parsed = candidates.map(c => ({ name: c.name, voteCount: Number(c.voteCount.toString()) }));
  const maxVotes = parsed.reduce((m, c) => Math.max(m, c.voteCount), 0);
  const winners = parsed.filter(c => c.voteCount === maxVotes && maxVotes > 0);

  return { results: parsed, votingActive, winners };
}

async function main() {
  let address = process.argv[2];

  if (!address || address.toLowerCase() === 'latest') {
    address = getLatestAddressFromLog();
    if (!address) throw new Error('No contract address provided and none found in log. Pass an address or "latest".');
  }

  if (!ethers.utils.isAddress(address)) {
    throw new Error(`Invalid contract address: ${address}`);
  }

  console.log(`ℹ️ Fetching results for ${address} ...`);
  const { results, votingActive, winners } = await fetchResults(address);

  console.log('\n📊 Results:');
  results.forEach(r => console.log(` - ${r.name}: ${r.voteCount}`));
  if (votingActive) {
    console.log('\n⚠️ Voting is still active for this contract. Saving a snapshot of current counts.');
  }
  if (winners.length) {
    console.log('\n🏆 Winner(s):', winners.map(w => `${w.name} (${w.voteCount})`).join(', '));
  } else {
    console.log('\n🏆 Winner(s): N/A');
  }

  appendResultsToLog(address, results, votingActive, winners);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
