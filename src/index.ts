import path from "path";
import fs from "fs/promises";
import { json2csvAsync } from "json-2-csv";

import IubStructure from "./lib/IubStructure";

var iubStruct: IubStructure;

const load = async () => {
  const inputs_file = path.resolve(__dirname, "data", "inputs_data.json");
  const prices_file = path.resolve(__dirname, "data", "prices_data.json");

  const outputPath = path.resolve(__dirname, "output");

  iubStruct = await IubStructure.CreateIubStructure(inputs_file, prices_file);

  // const list = ["i02542", "i01384", "i01441"];
  const list = [
    "I00001",
    "I00035",
    "I00037",
    "I00046",
    "I00055",
    "I00069",
    "I00087",
    "I00099",
    "I00114",
    "I00126",
    "I00150",
    "I00160",
    "I00162",
    "I00171",
    "I00181",
    "I00192",
    "I00203",
    "I00205",
    "I00224",
    "I00235",
    "I00237",
    "I00242",
    "I00252",
    "I00255",
    "I00363",
    "I00364",
    "I00374",
    "I00404",
    "I00504",
    "I00537",
    "I00587",
    "I00588",
    "I00590",
    "I00592",
    "I00637",
    "I00650",
    "I00672",
    "I00762",
    "I00802",
    "I00806",
    "I00849",
    "I00852",
    "I00862",
    "I00864",
    "I00944",
    "I00989",
    "I00992",
    "I01016",
    "I01033",
    "I01053",
    "I01080",
    "I01083",
    "I01086",
    "I01126",
    "I01156",
    "I01174",
    "I01178",
    "I01208",
    "I01227",
    "I01262",
    "I01275",
    "I01281",
    "I01297",
    "I01298",
    "I01308",
    "I01309",
    "I01350",
    "I01384",
    "I01415",
    "I01441",
    "I01448",
    "I01449",
    "I01466",
    "I01467",
    "I01489",
    "I01492",
    "I01493",
    "I01507",
    "I01510",
    "I01511",
    "I01519",
    "I01520",
    "I01523",
    "I01576",
    "I01659",
    "I01710",
    "I01811",
    "I01814",
    "I01851",
    "I01872",
    "I01910",
    "I01912",
    "I01915",
    "I01920",
    "I01928",
    "I01946",
    "I01964",
    "I01974",
    "I01989",
    "I02009",
    "I02017",
    "I02023",
    "I02042",
    "I02128",
    "I02203",
    "I02307",
    "I02374",
    "I02443",
    "I02468",
    "I02577",
    "I02709",
    "I02798",
    "I02802",
    "I02845",
    "I03691",
    "I03831",
    "I04913",
    "I07081",
    "I07309",
    "I07311",
    "I07387",
    "I07390",
    "I07597",
    "I07655",
    "I07656",
    "I07962",
    "I07999",
    "I08072",
    "I08149",
    "I08310",
    "I08345",
    "I08481",
    "I08511",
    "I08580",
    "I08587",
    "i08609",
    "I08655",
    "I08659",
    "I08721",
    "I08754",
    "I08879",
    "I08887",
    "I08888",
    "I08911",
    "I08995",
    "I09038",
    "I09039",
    "I09048",
    "I09058",
    "I09137",
    "I09149",
    "I09158",
    "I09172",
    "I09205",
    "I09212",
    "I09213",
    "I09214",
    "I09265",
    "I09280",
    "I09282",
    "I09296",
    "I09302",
    "I09303",
    "I09304",
    "I09305",
    "I09351",
    "I09352",
    "I09390",
    "I09398",
    "I09413",
    "I09438",
    "I09443",
    "I09444",
    "I09445",
    "I09446",
    "I09447",
    "I09458",
    "I09462",
    "I09464",
    "I09465",
    "I09474",
    "I09475",
    "I09476",
    "I09479",
    "I09480",
    "I09481",
    "I09485",
    "I09486",
    "I09488",
    "I09489",
    "I09491",
  ];

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
