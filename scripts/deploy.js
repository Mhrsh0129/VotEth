async function main() {
  // Get duration from command line args or use default
  const args = process.argv.slice(2);
  const durationArg = args.find(arg => arg.startsWith('--duration='));
  const duration = durationArg ? parseInt(durationArg.split('=')[1]) : 2;
  
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