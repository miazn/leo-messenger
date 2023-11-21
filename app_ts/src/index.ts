import { Account, ProgramManager, TransactionModel, AleoKeyProvider, NetworkRecordProvider, AleoNetworkClient, RecordCiphertext, RecordPlaintext} from "@aleohq/sdk";
import * as encode from './encode_message';

import * as dotenv from "dotenv";
dotenv.config({ path: '.env' });

/*
function encodeMsgForLeoMessenger(message: string, recipient: string) {
    return encode.stringToIntegerArray(message);
}
*/
const lines = [];

const recipient = await encode.getRecipient();
const message = await encode.getMessage();
console.log(recipient);
console.log(message);

// Create a new NetworkClient, KeyProvider, and RecordProvider

//privateKey1 is the one with funds that we want to send messages using
const privateKey1 = process.env.PRIVATE_KEY_1;
//const privateKey2 = process.env.PRIVATE_KEY_2;

const account = new Account({privateKey: privateKey1});
const networkClient = new AleoNetworkClient("https://api.explorer.aleo.org/v1");

const keyProvider = new AleoKeyProvider();
const recordProvider = new NetworkRecordProvider(account, networkClient);

// Initialize a program manager to talk to the Aleo network with the configured key and record providers
const programName = "leo_messenger.aleo";
const programManager = new ProgramManager("https://api.explorer.aleo.org/v1", keyProvider, recordProvider);

// Provide a key search parameter to find the correct key for the program if they are stored in a memory cache
const keySearchParams = { "cacheKey": "leo_messenger:send_message" };

console.log([recipient.toString(), message.toString(), Math.round(Date.now() / 1000).toString() + "i32"]);

const tx_id = await programManager.execute(programName, 
    "send_message", 
    0.2, 
    false, 
    [recipient.toString(), message.toString(), Math.round(Date.now() / 1000).toString() + "i32"],
    undefined,
    keySearchParams,
    undefined,
    undefined,
    undefined,
    account.privateKey());

if (tx_id instanceof Error) {
    console.error("Error sending message:", tx_id.message);
} else {
    const tx = tx_id as string;
    console.log("The transaction of your sent message is " + tx);
    const transaction = await programManager.networkClient.getTransaction(tx);
}
