import path from "path";
import fs from "fs/promises";
import { json2csvAsync } from "json-2-csv";

import IubStructure from "./lib/IubStructure";

var iubStruct: IubStructure;

const load = async () => {
  const inputs_file = path.resolve(__dirname, "data", "roteiros.csv");
  const prices_file = path.resolve(__dirname, "data", "precos.csv");

  const outputPath = path.resolve(__dirname, "output");

  iubStruct = await IubStructure.CreateIubStructureCSV(
    inputs_file,
    prices_file
  );

  const list = ["i02542", "i01384", "i01441"];

  list.forEach(async item => {
    const struct = iubStruct.getIubStructBySap(item);

    const csvString = await json2csvAsync(struct, {
      delimiter: {
        field: ";",
      },
      excelBOM: true,
    });

    const outputFile = path.resolve(outputPath, `${item.toUpperCase()}.csv`);
    await fs.writeFile(outputFile, csvString, "utf-8");
    console.log(`Struct of item ${item} in file ${outputFile}`);
  });

  const inputsWithoutPrices = iubStruct.getInputsWithoutPrices();
  const csvString = await json2csvAsync(inputsWithoutPrices, {
    delimiter: {
      field: ";",
    },
    excelBOM: true,
  });

  await fs.writeFile(`without_prices.csv`, csvString, "utf-8");

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
