const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const mime = require("mime-types");
const fs = require("fs");

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("message", (message) => {
  console.log(message.body);
});

client.on("message", async (message) => {
  if (message.hasMedia) {
    message.downloadMedia().then((media) => {
      if (media) {
        const mediaPath = "./media";
        if (!fs.existsSync(mediaPath)) {
          fs.mkdirSync(mediaPath);
        }
        const extension = mime.extension(media.mimetype);
        const filename = new Date().getTime();
        const fullFileName = mediaPath + filename + "." + extension;
        try {
          fs.writeFileSync(fullFileName, media.data, { encoding: "base64" });
          console.log("Media downloaded", fullFileName);
          console.log(fullFileName);
          MessageMedia.fromFilePath((filePath = fullFileName));
          client.sendMessage(
            message.from,
            new MessageMedia(media.mimetype, media.data, filename),
            { sendMediaAsSticker: true, stickerName: "Stickers" }
          );
          fs.unlinkSync(fullFileName);
        } catch (error) {
          console.error(error);
        }
      }
    });
  }
});

client.initialize();
