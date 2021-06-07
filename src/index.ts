import path from "path";
import fs from "fs/promises";
import { json2csv, json2csvAsync } from "json-2-csv";

import IubStructure from "./lib/IubStructure";

var iubStruct: IubStructure;

const load = async () => {
  const file = path.resolve(__dirname, "data", "inputs_data.json");

  iubStruct = await IubStructure.CreateIubStructure(file);

  const struct = iubStruct.getIubStructBySap("I01384");

  const csvString = await json2csvAsync(struct, {
    delimiter: {
      field: ";", // Comma field delimiter
    },
  });

  await fs.writeFile("output.csv", csvString);
  return;
};

load();

// [x] recursive function to filter inputs for a given product
//    [x] by sap code
//    [x] should be able to accept both character cases
// [ ] get prices from a prices list
// [x] save csv file to open in excel
//    [ ] fix foreign characters

// [] write results as csv file
