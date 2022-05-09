const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16 } = require("snarkjs");
const { plonk } = require("snarkjs");
const { Console } = require("console");


function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey"); //providing the values of input signals(a,b) AND providing wasm file and verification key to generate a proof

        console.log('1x2 =',publicSignals[0]); // the value of the ouput signal from the circuit

        const editedPublicSignals = unstringifyBigInts(publicSignals);   //Converts json into object value.  Makes it easy to convert json to snark proofs
        const editedProof = unstringifyBigInts(proof); //Converts json into object value.  Makes it easy to convert json to snark proofs
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals); // use the proof and public signals to generate the arguments needed later in the smart contract function(verifyProof)
     //console.log(calldata);
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());  //replace specific values on calldata (using regex). 
    //console.log(argv);
        const a = [argv[0], argv[1]]; //assign first two string in argv to a
       // console.log(a);
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];  //assign first four string in argv to b
        const c = [argv[6], argv[7]];   //assign first two string in argv to c
        const Input = argv.slice(8);  //slice from 8th positon to end assign it to input
    //console.log(Input);
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; // provide the arguments and await for the verifyProof functions to return
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here

        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2","c":"3"},"contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm", "contracts/circuits/Multiplier3/circuit_final.zkey"); //providing the values of input signals(a,b) AND providing wasm file and verification key to generate a proof
        console.log('1x2x3 =',publicSignals[0]); // the value of the ouput signal from the circuit
        console.log(publicSignals[0]);
    
        const editedPublicSignals = unstringifyBigInts(publicSignals);   //Converts json into object value.  Makes it easy to convert json to snark proofs
        const editedProof = unstringifyBigInts(proof); //Converts json into object value.  Makes it easy to convert json to snark proofs
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals); // use the proof and public signals to generate the arguments needed later in the smart contract function(verifyProof)
     
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());  //replace specific values on calldata (using regex). 
 
        const a = [argv[0], argv[1]]; //from value in argv assign to a
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];  //from value in argv assign to b
        const c = [argv[6], argv[7]];   //from value in argv assign to c
        const Input = argv.slice(8);  //slice from 8th positon to end assign it to input
       // console.log(Input);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;

    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0,0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
      
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const proof=require('/home/amulya/week1/Q2/contracts/circuits/proof.json');
        const public=require('/home/amulya/week1/Q2/contracts/circuits/public.json');
        const epublic= unstringifyBigInts(public);   
        const eproof = unstringifyBigInts(proof);
       // console.log(proof);
      
       var calldata=await plonk.exportSolidityCallData(eproof,epublic); 
  
    //const argv = calldata.replace(/["[\]\s]/g, "").split(','); 
    var argv = calldata.split(',');

    // console.log(JSON.parse(argv[1]));
    // console.log(argv);
    
    expect(await verifier.verifyProof(argv[0], JSON.parse(argv[1]))).to.be.true;
   

    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = '0x00';
        let b = ['0'];
    
        expect(await verifier.verifyProof(a, b)).to.be.false;
    });
});