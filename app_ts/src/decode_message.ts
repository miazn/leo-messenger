import { Account, ProgramManager, TransactionModel, AleoKeyProvider, NetworkRecordProvider, AleoNetworkClient, RecordCiphertext, RecordPlaintext} from "@aleohq/sdk";
import * as dotenv from "dotenv";
dotenv.config({ path: '.env' });
function isError(result: Error | TransactionModel): result is Error {
    return (result as Error).message !== undefined;
}

function jsonReviver(key: any, value: any): any {
    if (typeof value === 'string' && /^\d+n$/.test(value)) {
        return BigInt(value.slice(0, -1));
    }
    return value;
}

function convertToJson(input: string): any {
    // Remove the .private, u64.private, and i32.private suffixes
    let formattedString = input
        .replace(/\.private/g, '')  // Remove .private
        .replace(/\.public/g, '')  // Remove .public
        .replace(/u64/g, '')  // Remove u64.private
        .replace(/i32/g, '')  // Remove i32.private
        .replace(/(\w+):/g, '"$1":')  // Wrap property names in quotes
        .replace(/: ([\w\d]+)/g, ': "$1"');  // Wrap string values in quotes

    // Specifically target arrays and wrap their integers in quotes
    formattedString = formattedString.replace(/\[(.*?)\]/gs, (match) => {
        return match.replace(/(\b\d+\b)/g, '"$1"');
    });
    // Parse the formatted string as JSON
    try {
        const jsonObject = JSON.parse(formattedString, jsonReviver);
        return jsonObject;
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
    }
}


function integerArrayToString(array) {
    let string = '';
    for (let i = 0; i < array.length; i++) {
        let packedValue = BigInt(array[i]); // Ensure packedValue is BigInt
        for (let j = 0; j < 8; j++) {
            const charCodeBigInt = (packedValue >> BigInt(j * 8)) & BigInt(0xFF);
            if (charCodeBigInt !== BigInt(0)) {
                const charCode = Number(charCodeBigInt); // Convert BigInt to Number
                string += String.fromCharCode(charCode);
            }
        }
    }
    return string;
}

const privateKey2 = process.env.PRIVATE_KEY_2;

// Create a new NetworkClient, KeyProvider, and RecordProvider
const account = new Account({privateKey: privateKey2});
const networkClient = new AleoNetworkClient("https://api.explorer.aleo.org/v1");
const keyProvider = new AleoKeyProvider();
const recordProvider = new NetworkRecordProvider(account, networkClient);

// Initialize a program manager with the key provider to automatically fetch keys for executions
const programManager = new ProgramManager("https://api.explorer.aleo.org/v1", keyProvider, recordProvider);
programManager.setAccount(account);

// Fetch the transaction from the network that user 1 sent
const transaction = await programManager.networkClient.getTransaction("at169dza9f5t2xm8z0gqnd7vkqu2satdm8xpzev52daxdul3fll7v8sv8cx2s");

if (transaction instanceof Error) {
    console.error("ERROR:", transaction.message);
    // Handle the error case
} else {
    // Use type assertion to treat transactionResponse as TransactionModel
    const transactionModel = transaction as TransactionModel;

    const record = <string>transactionModel.execution.transitions[0].outputs[0].value;
    //console.log("Record value:", record);
    
    // Decrypt the record with the user's view key
    const recordCiphertext = <RecordCiphertext>RecordCiphertext.fromString(record);
    const recordPlaintext = <RecordPlaintext>recordCiphertext.decrypt(account.viewKey());
    //const result = JSON.parse(recordPlaintext.toString());

    const jsonObject = convertToJson(recordPlaintext.toString());
    //console.log(jsonObject);

    // Access elements
    if (jsonObject) {
        console.log("Encoded Message:", jsonObject.message);
        const decodedMessage = integerArrayToString(jsonObject.message);
        console.log("Decoded Message:", decodedMessage);
    }

}
