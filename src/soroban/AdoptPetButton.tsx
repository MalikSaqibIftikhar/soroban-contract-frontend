import React from 'react'
import {useSorobanReact } from "@soroban-react/core"
import Button from '@mui/material/Button';
import {useSendTransaction, contractTransaction} from './useSendTransaction'
import * as SorobanClient from 'soroban-client'
import addresses from '../soroban/addresses.json'


interface AdoptPetButtonProps {
    id: number,
}


export function AdoptPetButton ({id}: AdoptPetButtonProps){
    const sorobanContext =  useSorobanReact()

    const { sendTransaction } = useSendTransaction()
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
            const transaction = contractTransaction({
                networkPassphrase: activeChain.networkPassphrase,
                source: source,
                contractId: addresses.pet_adopt_id,
                method: 'mint_nft',
                params: [new SorobanClient.Address(address).toScVal()]
                });
                const txn = await sendTransaction(transaction, {sorobanContext, secretKey: "SBAYNCPCWBWOCBT2CQYVAXTOTPYJ3B2R6Q7QJJ6BXSJYDXFJLQKNQPWH"});
                console.log("adoptPet.tsx:sendTransaction:result: ", txn)
            }
            catch(error){
                console.log("Error while sending the transaction: ", error)
            }
        }

    }
   
    return(
        <Button
            size="small"
            variant="contained"
            onClick={handleAdopt}>
              Adopt it now! ❤️
          </Button>

    )
}