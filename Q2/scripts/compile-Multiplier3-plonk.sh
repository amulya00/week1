#!/bin/bash

# [assignment] create your own bash script to compile Multipler3.circom using PLONK below



cd contracts/circuits

mkdir _plonkMultiplier3

circom Multiplier3.circom --r1cs --wasm --sym -o _plonkMultiplier3
snarkjs r1cs info _plonkMultiplier3/Multiplier3.r1cs


node _plonkMultiplier3/Multiplier3_js/generate_witness.js _plonkMultiplier3/Multiplier3_js/Multiplier3.wasm _plonkMultiplier3/in.json witness.wtns
snarkjs wtns export json witness.wtns witness.json


snarkjs plonk setup _plonkMultiplier3/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau _plonkMultiplier3/circuit_final.zkey
# snarkjs zkey contribute _plonkMultiplier3/circuit_0000.zkey _plonkMultiplier3/circuit_final.zkey --name="1st Contributor Name" -v -e="random text"
snarkjs zkey export verificationkey _plonkMultiplier3/circuit_final.zkey _plonkMultiplier3/verification_key.json


snarkjs plonk prove _plonkMultiplier3/circuit_final.zkey witness.wtns proof.json public.json
snarkjs plonk verify _plonkMultiplier3/verification_key.json public.json proof.json


#snarkjs zkey export solidityverifier Multiplier.zkey verifier.sol


 snarkjs zkey export solidityverifier _plonkMultiplier3/circuit_final.zkey ../_plonkMultiplier3Verifier.sol

cd ../..