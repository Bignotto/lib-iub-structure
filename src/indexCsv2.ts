import path from "path"
import fs from "fs/promises"
import { json2csvAsync } from "json-2-csv"

import IubStructure from "./lib/IubStructure"
import { StructLine } from "lib/IubStructure/models/IStructLine"

import { list } from "./list"

var iubStruct: IubStructure

type Structures = StructLine & { productCode: string }

// {
//   itemSapCode: string;
//   itemStruct: StructLine[];
// };

const load = async () => {
  const inputs_file = path.resolve(__dirname, "data", "roteiros.csv")
  const prices_file = path.resolve(__dirname, "data", "precos.csv")

  const outputPath = path.resolve(__dirname, "output")

  console.log("iubstruct ok")
  iubStruct = await IubStructure.CreateIubStructureCSV(inputs_file, prices_file)

  // TODO: read product list from file
  //const list = ["i02542", "i01384", "i01441"];

  let structs: Structures[] = []

  list.forEach(async item => {
    const struct = iubStruct.getIubStructBySap(item)

    struct.map(line => {
      structs.push({
        ...line,
        productCode: item.toUpperCase(),
      })
    })
  })

  const csvString = await json2csvAsync(structs, {
    delimiter: {
      field: ";",
    },
    excelBOM: true,
  })

  const outputFile = path.resolve(outputPath, `estruturas.csv`)
  await fs.writeFile(outputFile, csvString, "utf-8")

  return
}

load()

// [x] recursive function to filter inputs for a given product
//    [x] by sap code
//    [x] should be able to accept both character cases
// [x] get prices from a prices list
// [x] save csv file to open in excel
//    [x] fix foreign characters
// [x] write results as csv file
