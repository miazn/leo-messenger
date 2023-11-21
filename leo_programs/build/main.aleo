program leo_messenger.aleo;

record message:
    owner as address.private;
    sender as address.private;
    message as [u64; 32u32].private;
    time as i32.private;


function main:
    input r0 as u32.public;
    input r1 as u32.private;
    add r0 r1 into r2;
    cast truefalsetruefalse into r3 as [boolean; 4u32];
    output r2 as u32.private;


function send_message:
    input r0 as address.private;
    input r1 as [u64; 32u32].private;
    input r2 as i32.private;
    cast r0 self.caller r1 r2 into r3 as message.record;
    output r3 as message.record;
