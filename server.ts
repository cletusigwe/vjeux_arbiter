import https from "https";
import { parse } from "url";
import fs from "fs";
import next from "next";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

var options = {
  key: fs.readFileSync("./certificates/localhost.key"),
  cert: fs.readFileSync("./certificates/localhost.crt"),
  ca: [fs.readFileSync("./certificates/root_certificates/RootCA.crt")],
};

app.prepare().then(() => {
  https
    .createServer(options, (req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    })
    .listen(port);

  console.log(
    `> Server listening at http://vjeuxarbiter.com:${port} as ${
      dev ? "development" : process.env.NODE_ENV
    }`
  );
});
