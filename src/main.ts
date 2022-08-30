import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { GoogleSpreadsheet } from "google-spreadsheet";

interface Params {
  sheetId: string;
  apiKeyId: string;
  messageFound: string;
  messageNotFound: string;
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Alasdair Stream Game Checker",
      description: "Checks if alasdair has plade a game before",
      author: "tlanfer",
      version: "1.0",
      firebotVersion: "5",
    };
  },
  getDefaultParameters: () => {
    return {
      sheetId: {
        type: "string",
        default: "",
        description: "Google Sheet ID",
        secondaryDescription: "The sheet id, from the URL when the sheet is open",
      },
      apiKeyId: {
        type: "string",
        default: "",
        description: "Google API Key",
        secondaryDescription: "See here how to get it: https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication?id=api-key",
      },
      messageFound: {
        type: "string",
        default: "Alasdair has played {Name}. He gave it a {My rating}",
        description: "Message when a game is found",
        secondaryDescription: "You can use all columns as variables, for example {Name}, {Backseating}. Use the full column title!",
      },
      messageNotFound: {
        type: "string",
        default: "Alasdair not played anything that sounds like {input}",
        description: "Message when a game is not found",
        secondaryDescription: "You can use {input} for the game that was asked for",
      }

    };
  },
  run: async (runRequest) =>  {
    const { logger } = runRequest.modules;

    let doc = new GoogleSpreadsheet(runRequest.parameters.sheetId);
    await doc.useApiKey(runRequest.parameters.apiKeyId);
    await doc.loadInfo();

    const game = runRequest.trigger.metadata.userCommand.args.join(" ").toLowerCase();

    for(const sheet of doc.sheetsByIndex){

      const rows = await sheet.getRows();
      for( const row of rows) {
        if(row.Name !== undefined && row.Name.toLowerCase().includes(game)){
          let msg = runRequest.parameters.messageFound.replace(/\{([^\}]*)\}/g, (g, h)=> {
            return row[h] ?? "";
          });
          runRequest.modules.twitchChat.sendChatMessage(msg);
          return
        }
      }
    }

    let msg = runRequest.parameters.messageNotFound.replace("{input}", game);
    runRequest.modules.twitchChat.sendChatMessage(msg);
  },
};

export default script;
