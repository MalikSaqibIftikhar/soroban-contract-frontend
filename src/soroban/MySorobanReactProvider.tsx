import React from 'react'
import {SorobanReactProvider} from '@soroban-react/core';
// eslint-disable-next-line
import {public_chain, futurenet} from '@soroban-react/chains';
import {ChainMetadata, Connector} from "@soroban-react/types";
import { freighter } from '@soroban-react/freighter';

 
  const appName = "Pet Adopt Dapp"
  const allowedConnectorName = "My Allowed Connectors for Pet Adopt Dapp"
  const allowedChains: ChainMetadata[] = [futurenet];

  const allowedConnectors: Connector[] = [
     freighter()
    ];

  export default function MySorobanReactProvider({children}:{children: React.ReactNode}) {
    return (
      <SorobanReactProvider
        chains={allowedChains}
        connectors={allowedConnectors}>
          {children}
      </SorobanReactProvider>
    )
  } 