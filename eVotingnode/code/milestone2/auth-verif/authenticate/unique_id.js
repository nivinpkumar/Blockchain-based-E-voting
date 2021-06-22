const { VerifiableCredential, checkCredential } = require('../node/identity_wasm');
const { createIdentity } = require('./create_did');
const { manipulateIdentity } = require('./manipulate_did');
const fs = require("fs");

function saveQR(qrcode) {
    // saving data in QRcode
    console.log("Save QRcode >>>>>>>>".green);
    try {
      fs.writeFileSync("citizen_verifiable_credentials.json", qrcode);
    } catch (e) {
      console.error(e);
    }
  }

async function run() {

    const CLIENT_CONFIG = {
        network: "main",
        node: "https://chrysalis-nodes.iota.org:443",
        }        
    // creates citizen identity
    const citizen_id = await createIdentity(CLIENT_CONFIG);
    // creates government or organizational identity and helps in signing documents
    const government_id = await manipulateIdentity(CLIENT_CONFIG);
    console.log("********************citizen_id*************************");
    console.log(citizen_id);
    console.log("************************issuer*************************");
    console.log(government_id);
    // Prepare a credential subject indicating the degree earned by citizen_id
    let credentialSubject = {
        id: citizen_id.doc.id.toString(),
        first_name: "Ron",
        last_name: "Smith",
        birthdate:"08201999",
        postalcode: "9852",
        nationality: "The Netherlands",
        city: "Groningen",
        gender: "Male",
        bsn: "987452136"
    };
    // Create an unsigned `UniversityDegree` credential for citizen_id
    const unsignedVc = VerifiableCredential.extend({
        id: "http://groninen.edu/credentials/3732",
        type: "NationalIdentityCredentials",
        issuer: government_id.doc.id.toString(),
        credentialSubject,
    });
    // Sign the credential with the government_id's newKey
    const signedVc = government_id.doc.signCredential(unsignedVc, {
        method: government_id.doc.id.toString()+"#newKey",
        public: government_id.newKey.public,
        secret: government_id.newKey.secret,
    });
    console.log("****************final signed credentials*****************");
    //console.log(signedVc);
    //console.log(signedVc.toString);
    //console.log("You can use this QR-code to show to your verifiable credentials");
    //console.log(
    //    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${JSON.stringify(signedVc)}`);
    
    saveQR(JSON.stringify(signedVc));
}

run();