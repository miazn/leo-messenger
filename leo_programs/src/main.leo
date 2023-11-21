// The 'leo_messenger' program.
program leo_messenger.aleo {

    record message {
        // owner here is the recipient of the message
        owner: address, 
        sender: address,
        message: [u64; 32],
        time: i32
    }
    transition main(public a: u32, b: u32) -> u32 {
        let c: u32 = a + b;
        let arr: [bool; 4] = [true, false, true, false];
        return c;
    }

    transition send_message(
        private recipient: address, 
        private messageContent: [u64; 32], 
        private timestamp: i32) -> message {
        return message {
            owner: recipient,
            sender: self.caller,
            message: messageContent,
            time: timestamp
        };
    }
}
