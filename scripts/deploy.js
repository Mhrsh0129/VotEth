async function main() {
  // Get duration from environment variable or command line args with validation
  const args = process.argv.slice(2);
  const durationArg = args.find(arg => arg.startsWith('--duration='));
  const envDuration = process.env.ELECTION_DURATION;
  let duration = 2; // Default value
  
  // Priority: command-line arg > environment variable > default
  if (durationArg) {
    const parsedDuration = parseInt(durationArg.split('=')[1], 10);
    
    if (Number.isInteger(parsedDuration) && parsedDuration > 0) {
      duration = parsedDuration;
    } else {
      console.error(`❌ Error: Invalid duration value "${durationArg.split('=')[1]}"`);
      console.error("   Duration must be a positive integer (> 0)");
      console.error("   Example: --duration=5");
      process.exit(1);
    }
  } else if (envDuration) {
    const parsedDuration = parseInt(envDuration, 10);
    
    if (Number.isInteger(parsedDuration) && parsedDuration > 0) {
      duration = parsedDuration;
    } else {
      console.error(`❌ Error: Invalid ELECTION_DURATION environment variable "${envDuration}"`);
      console.error("   Duration must be a positive integer (> 0)");
      process.exit(1);
    }
  }
  
  console.log(`📅 Election duration: ${duration} minutes`);
  
  const Voting = await ethers.getContractFactory("Voting");

  // Start deployment, returning a promise that resolves to a contract object
  const Voting_ = await Voting.deploy(["BJP", "NDA", "AAP", "BSPA","INC"], duration);
  console.log("Contract address:", Voting_.address);
}

main()
 .then(() => process.exit(0))
 .catch(error => {
   console.error(error);
   process.exit(1);
 });