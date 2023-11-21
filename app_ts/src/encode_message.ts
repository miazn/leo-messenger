import * as util from 'util';
import * as readline from 'readline';

export function stringToIntegerArray(message) {
    const integerArray = [];
    if (message.length > 256) {
        console.error("ERROR: Message must be <= 256 characters in length");
        process.exit(1);
    }
    for (let i = 0; i < message.length; i += 8) {
        let packedValue = BigInt(0);
        for (let j = 0; j < 8; j++) {
            if (i + j < message.length) {
                const charCode = BigInt(message.charCodeAt(i + j));
                packedValue |= (charCode << BigInt(j * 8));
            }
        }
        integerArray.push(packedValue);
    }

    // pad array for fixed size/length of 32, the largest that Leo supports
    while (integerArray.length < 32) {
        integerArray.push(0);
    }

    const formattedArray = integerArray.map(num => `${num}u64`);
    return `[${formattedArray.join(', ')}]`;
}

export function integerArrayToString(array) {
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

export function getRecipient() {
    return new Promise(resolve => {    
        const recipient = readline.createInterface({
            input:  process.stdin,
            output: process.stdout
        });
        recipient.question("Who do you want to send a message to?: ", (answer) => {
            resolve(answer);
            console.log("Sending message to: ", answer);
            recipient.close();
        });
    });   
}

export function getMessage() {
    return new Promise(resolve => {   
        const message = readline.createInterface({
            input:  process.stdin,
            output: process.stdout
        });
        message.question("What do you want to say?: ", (answer) => {
            const encodedArray = stringToIntegerArray(answer);
            //console.log("Message represented as an array will look like: ", encodedArray);
            resolve(encodedArray);
            message.close();
        });
    });
}



/*
const message = "This is my test Aleo Message";
const encodedMessage = stringToIntegerArray(message);
console.log("Encoded Message:", encodedMessage);


const decodedMessage = integerArrayToString(encodedMessage);
console.log("Decoded Message:", decodedMessage);
*/