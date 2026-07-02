const fs = require('fs');
let content = fs.readFileSync('src/components/chat/TrueVirtualMessageList.tsx', 'utf8');

const target = `  if (messages.length === 0) {
    return (

  // Auto-scroll to bottom on new messages (like WhatsApp)`;

const replace = `  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-muted-foreground bg-background/80 px-4 py-2 rounded-full text-sm shadow-sm backdrop-blur-sm">
          No messages yet. Send a message to start the conversation!
        </p>
      </div>
    );
  }

  // Auto-scroll to bottom on new messages (like WhatsApp)`;

if (content.includes(target)) {
  content = content.replace(target, replace);
  fs.writeFileSync('src/components/chat/TrueVirtualMessageList.tsx', content);
  console.log("Syntax error fixed in TrueVirtualMessageList.tsx");
} else {
  console.log("Target string not found. Please inspect manually.");
}
