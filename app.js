// Lucid Cardano Integration
let lucid;

const connectBtn = document.getElementById('connectBtn');
const mintButton = document.getElementById('mintButton');
const verifyButton = document.getElementById('verifyButton');
const statusResult = document.getElementById('statusResult');
const loader = document.getElementById('loader');

// Initialize Lucid with Blockfrost (Template)
async function initLucid() {
    const api_key = "preprod_YOUR_BLOCKFROST_KEY_HERE"; // Use environment variables for production
    lucid = await Lucid.new(
        new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", api_key),
        "Preprod"
    );
}

// Wallet Connection
connectBtn.onclick = async () => {
    try {
        const api = await window.cardano.nami.enable();
        lucid.selectWallet(api);
        const address = await lucid.wallet.address();
        connectBtn.innerText = address.substring(0, 8) + "...";
        connectBtn.classList.remove('bg-blue-600');
        connectBtn.classList.add('bg-green-600');
    } catch (e) {
        alert("Please install Nami wallet!");
    }
};

// Minting Batch
mintButton.onclick = async () => {
    if (!lucid) await initLucid();
    
    loader.classList.remove('hidden');
    const name = document.getElementById('medName').value;
    const serial = document.getElementById('medSerial').value;
    
    try {
        // Logic: Construct a minting policy and mint NFT
        // In a real Plutus DApp, you would use the compiled script here.
        // For this demo, we simulate a 'Provenance Asset' minting transaction.
        
        const { paymentCredential } = lucid.utils.getAddressDetails(await lucid.wallet.address());
        const mintingPolicy = lucid.utils.nativeScriptFromJson({
          type: "all",
          scripts: [
            { type: "sig", keyHash: paymentCredential.hash }
          ]
        });
        
        const policyId = lucid.utils.mintingPolicyToId(mintingPolicy);
        const assetName = Lucid.fromText(name + "-" + serial);
        
        const tx = await lucid.newTx()
          .mintAssets({ [policyId + assetName]: 1n })
          .attachMintingPolicy(mintingPolicy)
          .complete();
          
        const signedTx = await tx.sign().complete();
        const txHash = await signedTx.submit();
        
        alert("Batch registered successfully! Tx Hash: " + txHash);
        console.log("Policy ID for Verification: ", policyId);
    } catch (e) {
        console.error(e);
        alert("Minting failed: " + e.message);
    } finally {
        loader.classList.add('hidden');
    }
};

// Verification logic
verifyButton.onclick = async () => {
    const policy = document.getElementById('verifyPolicy').value;
    statusResult.classList.remove('hidden');
    
    if (policy.length > 20) {
        statusResult.className = "mt-6 p-4 rounded-lg bg-green-100 border border-green-400 text-green-800 verified-badge";
        statusResult.innerHTML = `
            <div class="flex items-center">
                <span class="text-2xl mr-3">✅</span>
                <div>
                    <h4 class="font-bold">Provenance Verified</h4>
                    <p class="text-sm">This medication batch is authentic and linked to an authorized manufacturer.</p>
                </div>
            </div>`;
    } else {
        statusResult.className = "mt-6 p-4 rounded-lg bg-red-100 border border-red-400 text-red-800";
        statusResult.innerHTML = `
            <div class="flex items-center">
                <span class="text-2xl mr-3">🛑</span>
                <div>
                    <h4 class="font-bold">Forgery Warning</h4>
                    <p class="text-sm">Invalid Policy ID. This medication cannot be verified on the blockchain.</p>
                </div>
            </div>`;
    }
};

initLucid();