import React from 'react'
import {useSorobanReact } from "@soroban-react/core"
import Button from '@mui/material/Button';
//import { contractTransaction} from '@soroban-react/contracts'
import {useSendTransaction, contractTransaction} from './useSendTransaction'
import * as SorobanClient from 'soroban-client'
import addresses from '../soroban/addresses.json'


interface AdoptPetButtonProps {
    id: number,
}


export function AdoptPetButton ({id}: AdoptPetButtonProps){
    const sorobanContext =  useSorobanReact()
    console.log("sorobanContext: ", sorobanContext)

    const { sendTransaction } = useSendTransaction()
    console.log("send trnasaction funciton is here")
    //console.log(sendTransaction)
    const { activeChain, server, address, activeConnector } = sorobanContext
    
    
    const handleAdopt = async (): Promise<void> => {
        if (!activeChain || ! address || !server) {
            console.log("No active chain")
            return
        }
        else{
            try{
            let account = await server.getAccount(address)
            let sequence = account.sequenceNumber();
            let source = new SorobanClient.Account(address, sequence)
            console.log("sourceeeeeeeeeeeee")
                console.log(source)
            const transaction = contractTransaction({
                networkPassphrase: activeChain.networkPassphrase,
                source: source,
                contractId: addresses.pet_adopt_id,
                method: 'mint_nft',
                params: [new SorobanClient.Address(address).toScVal()]
                });
                console.log("I am going to send this transaction to stellar network")
                // console.log(activeConnector)
                // let signed = await activeConnector?.signTransaction(transaction.toXDR(), {networkPassphrase: transaction.networkPassphrase});
                // console.log("signed transaction")
                // console.log(signed)
                // const transactionToSubmit = SorobanClient.TransactionBuilder.fromXDR(signed??'', transaction.networkPassphrase);
                // console.log("SENDDDDDDDDDDDDDDDDDDDINGGGGGGGGGGGGGGGGGGGGG TRANSACTION")
                const txn = await sendTransaction(transaction, {sorobanContext});
                //const result = await sendTransaction(txn, {sorobanContext})
                console.log("adoptPet.tsx:sendTransaction:result: ", txn)
            }
            catch(error){
                console.log("Error while sending the transaction: ", error)

            }
        }

        

    }

    // async function sendTransaction(passedTxn: SorobanClient.Transaction, passedOptions?: any): Promise<any> {

    //     console.log("I'm going to use send trnasaction.........................ssssssssssssssssssssssssssssssss")
    //     let txn = passedTxn;
    //     if (!txn || !activeConnector || !activeChain) {
    //       throw new Error("No transaction or wallet or chain");
    //     }
    
    //     if (!server) throw new Error("Not connected to server")
    
    //     // const {
    //     //   timeout,
    //     //   skipAddingFootprint,
    //     // } = {
    //     //   timeout: 60000,
    //     //   skipAddingFootprint: false,
    //     //   ...defaultOptions,
    //     //   ...passedOptions,
    //     // };
    //     console.log(activeChain)
    //     const networkPassphrase = activeChain.networkPassphrase;
    //     // setState('loading');
    
    //     // preflight and add the footprint
    //     // if (!skipAddingFootprint) {
    //     //   let {footprint} = await server.simulateTransaction(txn);
    //     //   txn = addFootprint(txn, networkPassphrase, footprint);
    //     // }
    //     console.log("level 1")
    //     //let signed = "";
    //     //if (true) {
    //         console.log("level 1AA")
    //       const keypair = SorobanClient.Keypair.fromSecret("SBAYNCPCWBWOCBT2CQYVAXTOTPYJ3B2R6Q7QJJ6BXSJYDXFJLQKNQPWH");
    //       console.log(keypair.publicKey(), keypair.secret())
    //       txn.sign(keypair);
    //       console.log("transaction")
    //       console.log(txn)
    //       var signed = txn.toXDR();
    //       console.log("signed transaction")
    //       console.log(signed)
    //     //}
    //     // } else {
    //     //     console.log("level 1AB")
    //     //     console.log(activeConnector)
    //     //   signed = await activeConnector.signTransaction(txn.toXDR(), {networkPassphrase});
    //     // }
    //     console.log(signed)
    //     console.log("level2")
    
    //     const transactionToSubmit = SorobanClient.TransactionBuilder.fromXDR(signed, networkPassphrase);
    //     console.log("SENDDDDDDDDDDDDDDDDDDDINGGGGGGGGGGGGGGGGGGGGG TRANSACTION")
    //     const transaction = await server.sendTransaction(txn);
    //     console.log(transaction.errorResultXdr)
    //     console.log("SENTTTTTTTTTTTTTT TRANSACTION")
    //     const timeout = 60000;
    //     const sleepTime = Math.min(10000, timeout);
    //     for (let i = 0; i <= timeout; i+= sleepTime) {
    //       await sleep(sleepTime);
    //       try {
    //         const response = await server.getTransaction(transaction.hash);
    //         console.log("TRANSACTION STATUSSSSSSSSSSSSSSSSSSSSSSSSSS",response.status.toString())
    //         switch (response.status.toString()) {
    //         case "PENDING": {
    //             console.log("TRANSACTION IS PENDING ...")
    //             continue;
    //           }
    //         case "SUCCESS": {
    //             console.log("TRANSACTION COMPLETED HURRRAHHH ...")
    //             if (response.resultXdr?.length != 1) {
    //               throw new Error("Expected exactly one result");
    //             }
    //             return SorobanClient.xdr.ScVal.fromXDR(Buffer.from(response.resultXdr[0], 'base64'));
    //           }
    //         case "FAILED": {
    //             console.log("TRANSACTION HAS FAILED, OOOOPS ...")
    //             console.log(response)
                
    //             //throw response.status;
    //           }
    //         case "NOT_FOUND": {
    //             continue;
    //         }
    //         default: {
    //             throw new Error("Unexpected transaction status: " + response.status);
    //           }
    //         }
    //       } catch (err: any) {
    //         if ('code' in err && err.code === 404) {
    //           // No-op
    //         } else {
    //           throw err;
    //         }
    //       }
    //     }
    //     throw new Error("Timed out");
    // }

    // async function sleep(ms: number) {
    //     return new Promise(resolve => setTimeout(resolve, ms));
    // }
    
    return(
        <Button
            size="small"
            variant="contained"
            onClick={handleAdopt}>
              Adopt it now! ❤️
          </Button>

    )
}