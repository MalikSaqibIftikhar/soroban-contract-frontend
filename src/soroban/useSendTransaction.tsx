import React from "react";
import * as SorobanClient from "soroban-client";
import { SorobanContextType } from "@soroban-react/core";
export type TransactionStatus = 'idle' | 'error' | 'loading' | 'success';



export interface contractTransactionProps {
    networkPassphrase: string,
    source: SorobanClient.Account,
    contractId: string,
    method: string,
    params?: SorobanClient.xdr.ScVal[]
  }

export function contractTransaction({
    networkPassphrase,
    source,
    contractId,
    method,
    params}: contractTransactionProps): SorobanClient.Transaction {
    
    let myParams: SorobanClient.xdr.ScVal[] = params || [];
    const contract = new SorobanClient.Contract(contractId)
    return new SorobanClient.TransactionBuilder(source, {
      // TODO: Figure out the fee
      fee: '100',
      networkPassphrase,
    })
      .addOperation(contract.call(method, ...myParams))
      .setTimeout(SorobanClient.TimeoutInfinite)
      .build()
  }


export interface SendTransactionResult<E = Error> {
  data?: SorobanClient.xdr.ScVal;
  error?: E;
  isError: boolean;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  sendTransaction: (txn?: Transaction, opts?: SendTransactionOptions) => Promise<SorobanClient.xdr.ScVal>;
  reset: () => void;
  status: TransactionStatus;
}

type Transaction = SorobanClient.Transaction | SorobanClient.FeeBumpTransaction;

export interface SendTransactionOptions {
  timeout?: number;
  skipAddingFootprint?: boolean
  secretKey?: string;
  sorobanContext: SorobanContextType
}

// useSendTransaction is a hook that returns a function that can be used to
// send a transaction. Upon sending, it will poll server.getTransactionStatus,
// until the transaction succeeds/fails, and return the result.
export function useSendTransaction<E = Error>(defaultTxn?: Transaction, defaultOptions?: SendTransactionOptions): SendTransactionResult<E> {
    console.log("thissssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss")
    if (!defaultOptions) {
      throw new Error("No sorobanContext passed to sendTransaction");
    }

    const sorobanContext =  defaultOptions.sorobanContext
    const { activeChain, activeConnector , server } = sorobanContext
    const [status, setState] = React.useState<TransactionStatus>('idle');
  
  
  const sendTransaction = React.useCallback(async function(passedTxn?: Transaction, passedOptions?: SendTransactionOptions): Promise<SorobanClient.xdr.ScVal> {

    console.log("I'm going to use send trnasaction.........................ssssssssssssssssssssssssssssssss")
    let txn = passedTxn ?? defaultTxn;
    if (!txn || !activeConnector || !activeChain) {
      throw new Error("No transaction or wallet or chain");
    }

    if (!server) throw new Error("Not connected to server")

    const {
      timeout,
      skipAddingFootprint,
    } = {
      timeout: 60000,
      skipAddingFootprint: false,
      ...defaultOptions,
      ...passedOptions,
    };
    const networkPassphrase = activeChain.networkPassphrase;
    setState('loading');

    // preflight and add the footprint
    // if (!skipAddingFootprint) {
    //   let {footprint} = await server.simulateTransaction(txn);
    //   txn = addFootprint(txn, networkPassphrase, footprint);
    // }

    let signed = "";
    if (passedOptions?.secretKey) {
      const keypair = SorobanClient.Keypair.fromSecret(passedOptions.secretKey);
      txn.sign(keypair);
      signed = txn.toXDR();
    } else {
      signed = await activeConnector.signTransaction(txn.toXDR(), { networkPassphrase });
    }

    const transactionToSubmit = SorobanClient.TransactionBuilder.fromXDR(signed, networkPassphrase);
    console.log("SENDDDDDDDDDDDDDDDDDDDINGGGGGGGGGGGGGGGGGGGGG TRANSACTION")
    const transaction = await server.sendTransaction(transactionToSubmit);
    console.log("SENTTTTTTTTTTTTTT TRANSACTION")
    const sleepTime = Math.min(1000, timeout);
    for (let i = 0; i <= timeout; i+= sleepTime) {
      await sleep(sleepTime);
      try {
        const response = await server.getTransaction(transaction.hash);
        console.log("TRANSACTION STATUSSSSSSSSSSSSSSSSSSSSSSSSSS",response.status.toString())
        switch (response.status.toString()) {
        case "NOT_FOUND": {
            continue;
          }
        case "SUCCESS": {
            if (response.resultXdr?.length != 1) {
              throw new Error("Expected exactly one result");
            }
            setState('success');
            return SorobanClient.xdr.ScVal.fromXDR(Buffer.from(response.resultXdr[0], 'base64'));
          }
        case "FAILED": {
            setState('error');
            throw response.status;
          }
        default: {
            throw new Error("Unexpected transaction status: " + response.status);
          }
        }
      } catch (err: any) {
        setState('error');
        if ('code' in err && err.code === 404) {
          // No-op
        } else {
          throw err;
        }
      }
    }
    throw new Error("Timed out");
  }, [activeConnector, activeChain, defaultTxn]);

  return {
    isIdle: status == 'idle',
    isError: status == 'error',
    isLoading: status == 'loading',
    isSuccess: status == 'success',
    sendTransaction,
    reset: () => {},
    status,
  };
}

// TODO: Transaction is immutable, so we need to re-build it here. :(
// function addFootprint(raw: Transaction, networkPassphrase: string, result: SorobanClient.SorobanRpc.SimulateTransactionResponse['results']): Transaction {
//   if ('innerTransaction' in raw) {
//     // TODO: Handle feebump transactions
//     return addFootprint(raw.innerTransaction, networkPassphrase, result ? result[0].footprint : {xd);
//   }
//   // TODO: Figure out a cleaner way to clone this transaction.
//   const source = new SorobanClient.Account(raw.source, `${parseInt(raw.sequence)-1}`);
//   const txn = new SorobanClient.TransactionBuilder(source, {
//     fee: raw.fee,
//     memo: raw.memo,
//     networkPassphrase,
//     timebounds: raw.timeBounds,
//     ledgerbounds: raw.ledgerBounds,
//     minAccountSequence: raw.minAccountSequence,
//     minAccountSequenceAge: raw.minAccountSequenceAge,
//     minAccountSequenceLedgerGap: raw.minAccountSequenceLedgerGap,
//     extraSigners: raw.extraSigners,
//   });
//   for (let rawOp of raw.operations) {
//     if ('function' in rawOp) {
//       // TODO: Figure out a cleaner way to clone these operations
//       txn.addOperation(SorobanClient.Operation.invokeHostFunction({
//         function: rawOp.function,
//         parameters: rawOp.parameters,
//         footprint: SorobanClient.xdr.LedgerFootprint.fromXDR(footprint, 'base64'),
        
//       }));
//     } else {
//       // TODO: Handle this.
//       throw new Error("Unsupported operation type");
//     }
//   }
//   return txn.build();
// }

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}