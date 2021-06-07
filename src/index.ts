import path from "path";
import fs from "fs/promises";
import { json2csvAsync } from "json-2-csv";

import IubStructure from "./lib/IubStructure";

var iubStruct: IubStructure;

const load = async () => {
  const inputs_file = path.resolve(__dirname, "data", "inputs_data.json");
  const prices_file = path.resolve(__dirname, "data", "prices_data.json");

  iubStruct = await IubStructure.CreateIubStructure(inputs_file, prices_file);

  const struct = iubStruct.getIubStructBySap("I02542");

  const csvString = await json2csvAsync(struct, {
    delimiter: {
      field: ";",
    },
    excelBOM: true,
  });

  await fs.writeFile("output.csv", csvString, "utf-8");
  return;
};

load();

// [x] recursive function to filter inputs for a given product
//    [x] by sap code
//    [x] should be able to accept both character cases
// [x] get prices from a prices list
// [x] save csv file to open in excel
//    [x] fix foreign characters
// [x] write results as csv file
