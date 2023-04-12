import { SorobanContextType } from '@soroban-react/core';
import addresses from './addresses.json'
import {useContractValue} from '@soroban-react/contracts'
import { numberToU32, scvalToBool } from '@soroban-react/utils'
import * as SorobanClient from 'soroban-client';

interface IsPetAdoptedProps {
    id: number,
    sorobanContext: SorobanContextType
}


export async function useIsPetAdopted ({id, sorobanContext}: IsPetAdoptedProps){
//            let id_BN = BigNumber(id)
            let isAdopted_scval
            let isAdopted 
            
            isAdopted_scval = await useContractValue({
                contractId: addresses.pet_adopt_id,
                method: 'get_base_uri',
                sorobanContext: sorobanContext,
            }).result

            // isAdopted_scval = await useContractValue({
            //     contractId: addresses.pet_adopt_id,
            //     method: 'current_nft_supply',
            //     sorobanContext: sorobanContext,
            // }).result

            // isAdopted_scval = await useContractValue({
            //     contractId: addresses.pet_adopt_id,
            //     method: 'total_nft_supply',
            //     sorobanContext: sorobanContext,
            // }).result
           
            console.log("pet id: ", id, " is adopted", isAdopted_scval?.value()?.toString())
        return isAdopted_scval?.value()?.toString()
}


    
