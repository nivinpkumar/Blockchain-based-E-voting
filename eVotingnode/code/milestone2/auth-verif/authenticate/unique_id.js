const { VerifiableCredential } = require('../node/identity_wasm');
const { createIdentity } = require('./create_did');
const { manipulateIdentity } = require('./manipulate_did');
const fs = require("fs");
const prompt = require("prompt-sync")({ sigint: true });



function saveQR(qrcode) {
    // saving data in QRcode
    console.log("Saved verifiable credentials ");
    try {
      fs.writeFileSync("citizen_verifiable_credentials.json", qrcode);
    } catch (e) {
      console.error(e);
    }
  }

function get_eligibilty_age(date_of_birth,age_requirement){
    // only checking if the citizen is above 18 years
    // can be changed to according to the organization's requirement
    //const age_requirement = 18;
    const year_requirement = new Date().getFullYear();
    if(year_requirement-age_requirement > parseInt(date_of_birth.substr(date_of_birth.length - 4), 10)){
        return true;
      }else{
        return false;
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
    // let credentialSubject = {
    //     id: citizen_id.doc.id.toString(),
    //     first_name: "Harry",
    //     last_name: "Smith",
    //     birthdate:"08201999",
    //     postalcode: "9852",
    //     nationality: "The Netherlands",
    //     city: "Groningen",
    //     gender: "Male",
    //     bsn: "987452136"
    // };

    console.log("****************final signed credentials*****************");
    console.log("Press 1 for sharing only name and birthdate");
    console.log("Press 2 for sharing all data");
    let choice = prompt("Your choise ");
    if(choice == "1"){
      
        let credentialSubject = {
            id: citizen_id.doc.id.toString(),
            first_name: "Sam",
            birthdate:"08201990",
        };

        let is_above18 = get_eligibilty_age(credentialSubject.birthdate,18);
        let is_above25 = get_eligibilty_age(credentialSubject.birthdate,25);
        let is_above50 = get_eligibilty_age(credentialSubject.birthdate,50);

        credentialSubject.age_above18 = is_above18;
        credentialSubject.age_above25 = is_above25;
        credentialSubject.age_above50 = is_above50;

        // Create an unsigned `Decentralized Identity` credential for citizen_id
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

        saveQR(JSON.stringify(signedVc));
        console.log("Verifiable credentials is successfull..............");
        // uncomment to get the QR code
    //     console.log("You can use this QR-code to show to your verifiable credentials");
    //     console.log(
    //    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${JSON.stringify(signedVc)}`);

    }else{
        
        let credentialSubject = {
            id: citizen_id.doc.id.toString(),
            first_name: "James",
            last_name: "Smith",
            birthdate:"08202000",
            postalcode: "9852",
            nationality: "The Netherlands",
            city: "Groningen",
            gender: "Male",
            bsn: "987452136"
        };

        let is_above18 = get_eligibilty_age(credentialSubject.birthdate,18);
        let is_above25 = get_eligibilty_age(credentialSubject.birthdate,25);
        let is_above50 = get_eligibilty_age(credentialSubject.birthdate,50);

        credentialSubject.age_above18 = is_above18;
        credentialSubject.age_above25 = is_above25;
        credentialSubject.age_above50 = is_above50;
        // Create an unsigned `Decentralized Identity` credential for citizen_id
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

        saveQR(JSON.stringify(signedVc));
        console.log("Verifiable credentials is successfull..............");
        // uncomment to get the QR code
        //console.log("You can use this QR-code to show to your verifiable credentials");
        //console.log(
       //`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${JSON.stringify(signedVc)}`);
    }


    

}

run();